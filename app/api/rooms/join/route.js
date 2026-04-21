import { getToken } from 'next-auth/jwt';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

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
    .select('invite_code')
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

  return Response.json({ roomId: membership.room_id, inviteCode: room?.invite_code, members: flat });
}
