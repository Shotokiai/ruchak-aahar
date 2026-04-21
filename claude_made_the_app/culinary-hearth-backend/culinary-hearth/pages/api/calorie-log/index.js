// pages/api/calorie-log/index.js
// GET  ?date → get today's logged calories for the user
// POST       → log a meal as eaten

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.supabaseId;

  // ── GET today's log ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('calorie_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .order('logged_at');

    if (error) return res.status(500).json({ error: error.message });

    // Totals for the day
    const totals = data.reduce(
      (acc, row) => ({
        calories: acc.calories + (row.calories || 0),
        protein:  acc.protein  + (row.protein  || 0),
        carbs:    acc.carbs    + (row.carbs     || 0),
        fiber:    acc.fiber    + (row.fiber     || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fiber: 0 }
    );

    return res.status(200).json({ logs: data, totals });
  }

  // ── POST — log a meal ───────────────────────────────────────────
  if (req.method === 'POST') {
    const { dish_name, calories, protein, carbs, fiber } = req.body;

    if (!dish_name) return res.status(400).json({ error: 'dish_name required' });

    const { data, error } = await supabaseAdmin
      .from('calorie_logs')
      .insert({ user_id: userId, dish_name, calories, protein, carbs, fiber })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ log: data });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
