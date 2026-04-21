-- ============================================================
--  THE CULINARY HEARTH — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- 1. PROFILES
--    One row per user, linked to auth.users
-- ─────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text,
  email           text,
  avatar_url      text,
  custom_avatar_url text,
  date_of_birth   date,
  age             int,
  weight_kg       numeric(5,1),
  height_cm       numeric(5,1),
  food_pref       text check (food_pref in ('veg','nonveg','vegan')) default 'nonveg',
  allergies       text[]  default '{}',
  activity_level  text check (activity_level in ('sedentary','light','moderate')) default 'sedentary',
  body_goal       text check (body_goal in ('lean','fit','athletic')) default 'fit',
  maintenance_cal int,
  target_cal      int,
  created_at      timestamptz default now()
);

-- Auto-create profile row when a new user signs up via Google
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────
-- 2. FAMILY ROOMS
-- ─────────────────────────────────────────
create table family_rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- 3. ROOM MEMBERS
-- ─────────────────────────────────────────
create table room_members (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid references family_rooms(id) on delete cascade,
  user_id         uuid references profiles(id) on delete cascade,
  role            text check (role in ('admin','member')) default 'member',
  is_cook         boolean default false,
  eating_tonight  boolean default true,
  joined_at       timestamptz default now(),
  unique(room_id, user_id)
);

-- ─────────────────────────────────────────
-- 4. URL CACHE  (prevent duplicate API calls)
-- ─────────────────────────────────────────
create table url_cache (
  url         text primary key,
  dish_data   jsonb not null,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- 5. DISHES  (shared pool per room per week)
-- ─────────────────────────────────────────
create table dishes (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid references family_rooms(id) on delete cascade,
  added_by        uuid references profiles(id) on delete set null,
  name            text not null,
  image_url       text,
  source_url      text,                    -- original reel/video URL
  description     text,
  calories        int default 0,
  protein         numeric(6,1) default 0,
  carbs           numeric(6,1) default 0,
  fiber           numeric(6,1) default 0,
  ingredients     jsonb default '[]',
  steps           jsonb default '[]',
  week_start_date date,                    -- which week this dish belongs to
  match_score     int default 0,           -- updated as votes come in
  is_finalized    boolean default false,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────
-- 6. VOTES
-- ─────────────────────────────────────────
create table votes (
  id          uuid primary key default gen_random_uuid(),
  dish_id     uuid references dishes(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  liked       boolean not null,
  created_at  timestamptz default now(),
  unique(dish_id, user_id)
);

-- Auto-update match_score on each vote
create or replace function update_match_score()
returns trigger language plpgsql as $$
begin
  update dishes
  set match_score = (
    select count(*) from votes
    where dish_id = new.dish_id and liked = true
  )
  where id = new.dish_id;
  return new;
end;
$$;

create trigger on_vote_cast
  after insert or update on votes
  for each row execute procedure update_match_score();

-- ─────────────────────────────────────────
-- 7. PLANNED MEALS
--    Covers both family meals AND personal logs
-- ─────────────────────────────────────────
create table planned_meals (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references family_rooms(id) on delete cascade,
  user_id       uuid references profiles(id) on delete cascade,
  dish_id       uuid references dishes(id) on delete set null,  -- null if manual
  -- Manual entry fields (when no dish_id)
  dish_name     text,
  dish_image    text,
  calories      int default 0,
  protein       numeric(6,1) default 0,
  carbs         numeric(6,1) default 0,
  fiber         numeric(6,1) default 0,
  -- Scheduling
  planned_date  date not null,
  meal_time     time not null default '19:00',
  repeat_type   text check (repeat_type in ('once','daily','weekly','monthly')) default 'once',
  -- Visibility
  is_personal   boolean default false,     -- true = only visible to this user
  is_confirmed  boolean default false,     -- admin confirmed for family
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- 8. CALORIE LOGS  (what user actually ate)
-- ─────────────────────────────────────────
create table calorie_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  dish_name     text not null,
  calories      int default 0,
  protein       numeric(6,1) default 0,
  carbs         numeric(6,1) default 0,
  fiber         numeric(6,1) default 0,
  logged_at     timestamptz default now(),
  log_date      date generated always as (logged_at::date) stored
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────
alter table profiles        enable row level security;
alter table family_rooms    enable row level security;
alter table room_members    enable row level security;
alter table dishes          enable row level security;
alter table votes           enable row level security;
alter table planned_meals   enable row level security;
alter table calorie_logs    enable row level security;
alter table url_cache       enable row level security;

-- Profiles: users can read/write their own
create policy "Own profile" on profiles
  for all using (auth.uid() = id);

-- Family rooms: members can read, creator can write
create policy "Room read for members" on family_rooms
  for select using (
    id in (select room_id from room_members where user_id = auth.uid())
  );
create policy "Room create" on family_rooms
  for insert with check (auth.uid() = created_by);

-- Room members: visible to other members of same room
create policy "Members of same room" on room_members
  for select using (
    room_id in (select room_id from room_members where user_id = auth.uid())
  );
create policy "Join room" on room_members
  for insert with check (auth.uid() = user_id);
create policy "Update own membership" on room_members
  for update using (auth.uid() = user_id);

-- Dishes: visible to all room members, writable by members
create policy "Dish read by room members" on dishes
  for select using (
    room_id in (select room_id from room_members where user_id = auth.uid())
  );
create policy "Dish insert by room members" on dishes
  for insert with check (
    room_id in (select room_id from room_members where user_id = auth.uid())
  );

-- Votes: users manage their own
create policy "Own votes" on votes
  for all using (auth.uid() = user_id);

-- Planned meals: own + room family meals
create policy "Planned meals access" on planned_meals
  for all using (
    auth.uid() = user_id or
    (is_personal = false and room_id in (
      select room_id from room_members where user_id = auth.uid()
    ))
  );

-- Calorie logs: own only
create policy "Own calorie logs" on calorie_logs
  for all using (auth.uid() = user_id);

-- URL cache: readable by all authenticated users
create policy "URL cache read" on url_cache
  for select using (auth.uid() is not null);
create policy "URL cache insert" on url_cache
  for insert with check (auth.uid() is not null);
