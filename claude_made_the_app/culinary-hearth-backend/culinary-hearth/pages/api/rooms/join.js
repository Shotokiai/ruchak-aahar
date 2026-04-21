// pages/api/rooms/join.js
// POST → join a room with an invite code
// GET  → get all members of user's current room

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.supabaseId;

  // ── GET members ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    // Find which room this user belongs to
    const { data: membership } = await supabaseAdmin
      .from('room_members')
      .select('room_id, role, is_cook, eating_tonight')
      .eq('user_id', userId)
      .single();

    if (!membership) return res.status(404).json({ error: 'Not in any room' });

    // Get room details (for invite_code)
    const { data: room } = await supabaseAdmin
      .from('family_rooms')
      .select('invite_code')
      .eq('id', membership.room_id)
      .single();

    // Get all members of the room with their profiles
    const { data: members, error } = await supabaseAdmin
      .from('room_members')
      .select(`
        id, role, is_cook, eating_tonight,
        profiles ( id, name, email, avatar_url )
      `)
      .eq('room_id', membership.room_id);

    if (error) return res.status(500).json({ error: error.message });

    // Flatten for easier frontend use
    const flat = members.map(m => ({
      memberId:      m.id,
      userId:        m.profiles.id,
      name:          m.profiles.name,
      email:         m.profiles.email,
      avatarUrl:     m.profiles.avatar_url,
      role:          m.role,
      isCook:        m.is_cook,
      eatingTonight: m.eating_tonight,
    }));

    return res.status(200).json({ roomId: membership.room_id, inviteCode: room?.invite_code, members: flat });
  }

  // ── POST join ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { invite_code } = req.body;

    if (!invite_code?.trim()) return res.status(400).json({ error: 'Invite code required' });

    // Find room
    const { data: room, error: roomErr } = await supabaseAdmin
      .from('family_rooms')
      .select('id, name')
      .eq('invite_code', invite_code.toUpperCase().trim())
      .single();

    if (roomErr || !room) return res.status(404).json({ error: 'Room not found. Check the code and try again.' });

    // Check if already a member
    const { data: existing } = await supabaseAdmin
      .from('room_members')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .single();

    if (existing) return res.status(200).json({ room, message: 'Already a member' });

    // Add as member
    const { error: joinErr } = await supabaseAdmin
      .from('room_members')
      .insert({ room_id: room.id, user_id: userId, role: 'member' });

    if (joinErr) return res.status(500).json({ error: joinErr.message });

    return res.status(201).json({ room, message: 'Joined successfully' });
  }

  // ── PATCH — update eating_tonight or transfer cook ───────────────
  if (req.method === 'PATCH') {
    const { room_id, target_user_id, eating_tonight, transfer_cook } = req.body;

    if (transfer_cook && target_user_id) {
      // Caller must be admin to transfer cook
      const { data: callerMem } = await supabaseAdmin
        .from('room_members')
        .select('role')
        .eq('room_id', room_id)
        .eq('user_id', userId)
        .single();

      if (callerMem?.role !== 'admin') return res.status(403).json({ error: 'Only admin can transfer cook' });

      // Set all is_cook = false, then set target = true
      await supabaseAdmin
        .from('room_members')
        .update({ is_cook: false })
        .eq('room_id', room_id);

      await supabaseAdmin
        .from('room_members')
        .update({ is_cook: true })
        .eq('room_id', room_id)
        .eq('user_id', target_user_id);

      return res.status(200).json({ success: true });
    }

    if (eating_tonight !== undefined) {
      await supabaseAdmin
        .from('room_members')
        .update({ eating_tonight })
        .eq('room_id', room_id)
        .eq('user_id', userId);

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Nothing to update' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).json({ error: 'Method not allowed' });
}
