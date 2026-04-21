// pages/api/votes/index.js
// POST { dish_id, liked }  → cast or update a vote
// GET  ?room_id            → get all votes by current user in this room

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.supabaseId;

  // ── GET my votes in a room ──────────────────────────────────────
  if (req.method === 'GET') {
    const { room_id } = req.query;

    const { data: votes, error } = await supabaseAdmin
      .from('votes')
      .select('dish_id, liked')
      .in(
        'dish_id',
        supabaseAdmin
          .from('dishes')
          .select('id')
          .eq('room_id', room_id)
      )
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });

    // Return as { [dish_id]: true|false }
    const map = Object.fromEntries(votes.map(v => [v.dish_id, v.liked]));
    return res.status(200).json({ votes: map });
  }

  // ── POST — cast / update vote ────────────────────────────────────
  if (req.method === 'POST') {
    const { dish_id, liked } = req.body;
    if (!dish_id || liked === undefined) {
      return res.status(400).json({ error: 'dish_id and liked required' });
    }

    // Upsert — if user already voted, update it
    const { data, error } = await supabaseAdmin
      .from('votes')
      .upsert(
        { dish_id, user_id: userId, liked },
        { onConflict: 'dish_id,user_id' }
      )
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Trigger returns updated match_score automatically (via DB trigger)
    const { data: dish } = await supabaseAdmin
      .from('dishes')
      .select('id, match_score')
      .eq('id', dish_id)
      .single();

    return res.status(200).json({ vote: data, match_score: dish?.match_score });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
