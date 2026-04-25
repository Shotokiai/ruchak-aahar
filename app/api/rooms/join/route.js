import { getToken } from 'next-auth/jwt';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genCode = () => Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.supabaseId) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { name, suggestedCode } = await req.json();
  if (!name?.trim()) return Response.json({ error: 'Room name required' }, { status: 400 });

  const userId = token.supabaseId;

  // Pick a unique invite code
  let inviteCode = suggestedCode || genCode();
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await supabaseAdmin.from('family_rooms').select('id').eq('invite_code', inviteCode).maybeSingle();
    if (!clash) break;
    inviteCode = genCode();
  }

  const { data: room, error: roomErr } = await supabaseAdmin
    .from('family_rooms')
    .insert({ name: name.trim(), invite_code: inviteCode, created_by: userId })
    .select()
    .single();

  if (roomErr) return Response.json({ error: roomErr.message }, { status: 500 });

  const { error: memberErr } = await supabaseAdmin
    .from('room_members')
    .insert({ room_id: room.id, user_id: userId, role: 'admin', is_cook: true, eating_tonight: true });

  if (memberErr) return Response.json({ error: memberErr.message }, { status: 500 });

  return Response.json({ roomId: room.id, inviteCode: room.invite_code, roomName: room.name });
}

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.supabaseId) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const userId = token.supabaseId;

  const { data: membership } = await supabaseAdmin
    .from('room_members')
    .select('room_id, role, is_cook, eating_tonight')
    .eq('user_id', userId)
    .single();

  if (!membership) return Response.json({ error: 'Not in any room' }, { status: 404 });

  const { data: room } = await supabaseAdmin
    .from('family_rooms')
    .select('invite_code, name')
    .eq('id', membership.room_id)
    .single();

  const { data: members, error } = await supabaseAdmin
    .from('room_members')
    .select('id, role, is_cook, eating_tonight, profiles ( id, name, email, avatar_url )')
    .eq('room_id', membership.room_id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const flat = members.map(m => ({
    memberId: m.id, userId: m.profiles.id, name: m.profiles.name,
    email: m.profiles.email, avatarUrl: m.profiles.avatar_url,
    role: m.role, isCook: m.is_cook, eatingTonight: m.eating_tonight,
  }));

  return Response.json({ roomId: membership.room_id, inviteCode: room?.invite_code, roomName: room?.name, members: flat });
}
