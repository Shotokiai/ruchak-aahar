// pages/api/planner/index.js
// GET    ?room_id&start_date&end_date → fetch planned meals in date range
// POST   → save a planned meal (family or personal)
// DELETE ?meal_id&room_id            → remove a meal (admin = any, member = own personal)
// PATCH  → confirm a family meal (admin only)

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.supabaseId;

  // ── GET meals in a date range ───────────────────────────────────
  if (req.method === 'GET') {
    const { room_id, start_date, end_date } = req.query;
    if (!room_id || !start_date) return res.status(400).json({ error: 'room_id and start_date required' });

    let query = supabaseAdmin
      .from('planned_meals')
      .select(`
        *,
        dishes ( id, name, image_url, calories, protein, carbs, fiber, description, ingredients, steps )
      `)
      .eq('room_id', room_id)
      .gte('planned_date', start_date)
      .order('planned_date')
      .order('meal_time');

    if (end_date) query = query.lte('planned_date', end_date);

    // Members only see family meals + their own personal meals
    query = query.or(`is_personal.eq.false,user_id.eq.${userId}`);

    const { data: meals, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ meals });
  }

  // ── POST — add a planned meal ────────────────────────────────────
  if (req.method === 'POST') {
    const {
      room_id,
      dish_id,       // optional — null for manual entries
      dish_name,
      dish_image,
      calories,
      protein,
      carbs,
      fiber,
      planned_date,
      meal_time = '19:00',
      repeat_type = 'once',
      is_personal = false,
    } = req.body;

    if (!room_id || !planned_date) {
      return res.status(400).json({ error: 'room_id and planned_date required' });
    }
    if (!dish_id && !dish_name) {
      return res.status(400).json({ error: 'Either dish_id or dish_name required' });
    }

    const rows = buildRepeatRows({
      room_id, user_id: userId,
      dish_id, dish_name, dish_image,
      calories, protein, carbs, fiber,
      planned_date, meal_time,
      repeat_type, is_personal,
    });

    const { data: meals, error } = await supabaseAdmin
      .from('planned_meals')
      .insert(rows)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ meals });
  }

  // ── DELETE ───────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { meal_id, room_id } = req.query;

    const { data: meal } = await supabaseAdmin
      .from('planned_meals')
      .select('user_id, is_personal')
      .eq('id', meal_id)
      .single();

    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    // Admin can delete anything; member can only delete own personal meals
    const { data: member } = await supabaseAdmin
      .from('room_members')
      .select('role')
      .eq('room_id', room_id)
      .eq('user_id', userId)
      .single();

    const canDelete = member?.role === 'admin' || meal.user_id === userId;
    if (!canDelete) return res.status(403).json({ error: 'Not authorised' });

    const { error } = await supabaseAdmin
      .from('planned_meals')
      .delete()
      .eq('id', meal_id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── PATCH — confirm meal (admin only) ────────────────────────────
  if (req.method === 'PATCH') {
    const { meal_id, room_id, is_confirmed } = req.body;

    const { data: member } = await supabaseAdmin
      .from('room_members')
      .select('role')
      .eq('room_id', room_id)
      .eq('user_id', userId)
      .single();

    if (member?.role !== 'admin') return res.status(403).json({ error: 'Only admin can confirm meals' });

    const { data, error } = await supabaseAdmin
      .from('planned_meals')
      .update({ is_confirmed })
      .eq('id', meal_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ meal: data });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
  return res.status(405).json({ error: 'Method not allowed' });
}

// ── Build repeat rows ────────────────────────────────────────────
function buildRepeatRows(base) {
  const { repeat_type, planned_date, ...rest } = base;
  if (repeat_type === 'once') {
    return [{ ...rest, planned_date, repeat_type }];
  }

  const start  = new Date(planned_date);
  const rows   = [];
  const WEEKS  = 8; // generate 8 occurrences max

  for (let i = 0; i < WEEKS; i++) {
    const d = new Date(start);
    if      (repeat_type === 'daily')   d.setDate(start.getDate() + i);
    else if (repeat_type === 'weekly')  d.setDate(start.getDate() + i * 7);
    else if (repeat_type === 'monthly') d.setMonth(start.getMonth() + i);
    else break;

    rows.push({
      ...rest,
      planned_date: d.toISOString().split('T')[0],
      repeat_type,
    });
  }
  return rows;
}
