// pages/api/rooms/create.js
// POST → create a new family room, make caller Admin

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';

// Generate a 6-char alphanumeric invite code (e.g. DISH42)
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId   = session.user.supabaseId;
  const { name } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Room name is required' });

  // Guard: if user is already in a room, return that room instead of creating another
  const { data: existingMembership } = await supabaseAdmin
    .from('room_members')
    .select('room_id, family_rooms ( id, invite_code, name )')
    .eq('user_id', userId)
    .single();

  if (existingMembership?.room_id) {
    const existing = existingMembership.family_rooms;
    return res.status(200).json({ room: existing, alreadyExists: true });
  }

  // Generate a unique invite code
  let invite_code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabaseAdmin
      .from('family_rooms')
      .select('id')
      .eq('invite_code', invite_code)
      .single();
    if (!existing) break;
    invite_code = generateCode();
    attempts++;
  }

  // 1. Create the room
  const { data: room, error: roomErr } = await supabaseAdmin
    .from('family_rooms')
    .insert({ name: name.trim(), invite_code, created_by: userId })
    .select()
    .single();

  if (roomErr) return res.status(500).json({ error: roomErr.message });

  // 2. Add creator as Admin + cook
  const { error: memberErr } = await supabaseAdmin
    .from('room_members')
    .insert({
      room_id: room.id,
      user_id: userId,
      role:    'admin',
      is_cook: true,
    });

  if (memberErr) return res.status(500).json({ error: memberErr.message });

  return res.status(201).json({ room });
}
