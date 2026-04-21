'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '../lib/api';
import WelcomeScreen from './screens/WelcomeScreen';
import Onboarding1 from './screens/Onboarding1';
import Onboarding2 from './screens/Onboarding2';
import Onboarding3 from './screens/Onboarding3';
import CreateJoinScreen from './screens/CreateJoinScreen';
import JoinCodeScreen from './screens/JoinCodeScreen';
import HearthScreen from './screens/HearthScreen';
import MatchScreen from './screens/MatchScreen';
import PlannerScreen from './screens/PlannerScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import RecipeModal from './modals/RecipeModal';
import ProfileScreen from './screens/ProfileScreen';
import { DISH_POOL } from '../lib/constants';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [recipe, setRecipe] = useState(null);
  const [profile, setProfileRaw] = useState({});
  const [votes, setVotes] = useState({});
  const [plannedMeals, setPlannedMeals] = useState({});
  const [dishPool, setDishPool] = useState(DISH_POOL);
  // Initialise from localStorage so state survives Fast Refresh / page reloads
  const [roomId, setRoomId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('culinary_room_id') : null
  );
  const [inviteCode, setInviteCode] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('culinary_invite_code') : null
  );
  const [members, setMembers] = useState([
    { id: 1, name: 'Sushant', role: 'admin', initials: 'SU', eating: true, color: '#D4956A', isCook: true },
  ]);

  const { data: session, status } = useSession();
  const hasNavigated = useRef(false);

  // Sync roomId / inviteCode to localStorage whenever they change
  useEffect(() => {
    if (roomId) localStorage.setItem('culinary_room_id', roomId);
    else localStorage.removeItem('culinary_room_id');
  }, [roomId]);

  useEffect(() => {
    if (inviteCode) localStorage.setItem('culinary_invite_code', inviteCode);
    else localStorage.removeItem('culinary_invite_code');
  }, [inviteCode]);

  // Load dishes from DB whenever we know the room (survives Fast Refresh)
  useEffect(() => {
    if (!roomId || status !== 'authenticated') return;
    api.getDishPool(roomId)
      .then(({ dishes }) => {
        if (!dishes?.length) return;
        setDishPool(dishes.map((d) => ({
          id:          d.id,
          name:        d.name,
          img:         d.image_url || `https://via.placeholder.com/300?text=${encodeURIComponent(d.name)}`,
          cal:         d.calories  || 0,
          protein:     d.protein   || 0,
          carbs:       d.carbs     || 0,
          fiber:       d.fiber     || 0,
          desc:        d.description || '"Added from reel"',
          ingredients: d.ingredients || [],
          steps:       d.steps       || [],
        })));
      })
      .catch(console.error);
  }, [roomId, status]);

  // After Google sign-in redirect: load saved profile, route to right screen
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // User logged out - reset to welcome screen
      setScreen('welcome');
      hasNavigated.current = false;
      setProfileRaw({});
      return;
    }

    if (status !== 'authenticated' || hasNavigated.current) return;
    hasNavigated.current = true;

    api.getProfile()
      .then(async (p) => {
        if (p && (p.age || p.date_of_birth)) {
          setProfileRaw({
            dob:             p.date_of_birth,
            age:             p.age,
            weightKg:        p.weight_kg,
            heightCm:        p.height_cm,
            pref:            p.food_pref,
            allergies:       p.allergies,
            activity:        p.activity_level,
            bodyGoal:        p.body_goal,
            target:          p.target_cal,
            maintenance:     p.maintenance_cal,
            customAvatarUrl: p.custom_avatar_url,
          });

          // 1. Fast path: localStorage has room
          const savedRoom = localStorage.getItem('culinary_room_id');
          if (savedRoom) {
            setScreen('hearth');
            window.scrollTo(0, 0);
            return;
          }

          // 2. Fallback: check DB — user may have cleared cache but still has a room
          try {
            const { roomId: dbRoomId, inviteCode: dbInvite } = await api.getRoomMembers();
            if (dbRoomId) {
              setRoomId(dbRoomId);
              if (dbInvite) setInviteCode(dbInvite);
              setScreen('hearth');
              window.scrollTo(0, 0);
              return;
            }
          } catch (_) {
            // Not in any room yet — fall through to createjoin
          }

          setScreen('createjoin');
        } else {
          setScreen('onboarding1');
        }
        window.scrollTo(0, 0);
      })
      .catch(() => { setScreen('onboarding1'); window.scrollTo(0, 0); });
  }, [status]);

  const setProfile = (fn) => setProfileRaw(fn);
  const go = (s) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };
  const onVote = (id, liked) => setVotes((v) => ({ ...v, [id]: liked }));

  const screens = {
    welcome: <WelcomeScreen go={go} />,
    onboarding1: <Onboarding1 go={go} setProfile={setProfile} />,
    onboarding2: <Onboarding2 go={go} setProfile={setProfile} />,
    onboarding3: <Onboarding3 go={go} profile={profile} setProfile={setProfile} />,
    createjoin: <CreateJoinScreen go={go} userName={members[0]?.name || 'Chef'} setRoomId={setRoomId} setInviteCode={setInviteCode} />,
    joincode: <JoinCodeScreen go={go} setRoomId={setRoomId} setInviteCode={setInviteCode} />,
    hearth: (
      <HearthScreen
        go={go}
        showRecipe={setRecipe}
        profile={profile}
        members={members}
        setMembers={setMembers}
        plannedMeals={plannedMeals}
        dishPool={dishPool}
        setDishPool={setDishPool}
        userName={members[0]?.name}
        roomId={roomId}
        setRoomId={setRoomId}
        inviteCode={inviteCode}
      />
    ),
    match: (
      <MatchScreen
        go={go}
        showRecipe={setRecipe}
        dishPool={dishPool}
        votes={votes}
        onVote={onVote}
        profile={profile}
        setPlannedMeals={setPlannedMeals}
      />
    ),
    planner: (
      <PlannerScreen
        go={go}
        showRecipe={setRecipe}
        isAdmin={true}
        plannedMeals={plannedMeals}
        setPlannedMeals={setPlannedMeals}
      />
    ),
    profile: (
      <ProfileScreen
        go={go}
        profile={profile}
        setProfile={setProfile}
        onLogout={() => {
          // Keep roomId and inviteCode so user returns to same room after login
          setProfileRaw({});
          setScreen('welcome');
        }}
      />
    ),
    notifications: <NotificationsScreen go={go} dishPool={dishPool} />,
  };

  return (
    <>
      {status === 'loading' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5EFE0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽</div>
            <div style={{ fontSize: 14, color: '#9A8E82' }}>Loading...</div>
          </div>
        </div>
      ) : (
        <>
          {screens[screen] || screens.welcome}
          {recipe && <RecipeModal dish={recipe} close={() => setRecipe(null)} />}
        </>
      )}
    </>
  );
}
