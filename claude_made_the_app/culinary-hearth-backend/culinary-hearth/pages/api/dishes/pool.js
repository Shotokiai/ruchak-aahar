// pages/api/dishes/pool.js
// GET  → fetch all dishes in the room's pool (current week)
// POST → manual dish entry (by name, uses OpenAI to fill nutrition)
// DELETE ?dishId → remove dish from pool (admin only)

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';
import OpenAI               from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use GPT-4o to get nutrition data for a manually typed dish name
async function fetchNutritionByName(dishName) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role:    'system',
          content: `You are a nutrition expert. Given a dish name, return a JSON object with these exact fields:
{
  "description": "one witty/fun sentence about the dish (max 100 chars)",
  "calories": <number per serving>,
  "protein": <grams per serving>,
  "carbs": <grams per serving>,
  "fiber": <grams per serving>,
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "steps": ["step 1", "step 2", ...]
}
Return ONLY valid JSON. No markdown, no explanation.`,
        },
        { role: 'user', content: `Dish: ${dishName}` },
      ],
      max_tokens:  600,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content?.trim();
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.supabaseId;

  // ── GET pool ─────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { room_id } = req.query;
    if (!room_id) return res.status(400).json({ error: 'room_id required' });

    const { data: dishes, error } = await supabaseAdmin
      .from('dishes')
      .select(`
        *,
        votes ( user_id, liked ),
        profiles!added_by ( name, avatar_url )
      `)
      .eq('room_id', room_id)
      .order('match_score', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ dishes });
  }

  // ── POST manual dish ──────────────────────────────────────────────
  if (req.method === 'POST') {
    const { room_id, name, image_url, calories, protein, carbs, fiber } = req.body;
    if (!room_id || !name) return res.status(400).json({ error: 'room_id and name required' });

    // If no calories provided, ask GPT-4o
    let nutrition = {};
    if (!calories) {
      nutrition = await fetchNutritionByName(name);
    }

    const { data: dish, error } = await supabaseAdmin
      .from('dishes')
      .insert({
        room_id,
        added_by:    userId,
        name,
        image_url:   image_url || nutrition.image_url || null,
        description: nutrition.description || null,
        calories:    calories  || nutrition.calories  || 0,
        protein:     protein   || nutrition.protein   || 0,
        carbs:       carbs     || nutrition.carbs     || 0,
        fiber:       fiber     || nutrition.fiber     || 0,
        ingredients: nutrition.ingredients || [],
        steps:       nutrition.steps       || [],
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ dish });
  }

  // ── DELETE dish (admin only) ──────────────────────────────────────
  if (req.method === 'DELETE') {
    const { dish_id, room_id } = req.query;

    // Verify caller is admin
    const { data: member } = await supabaseAdmin
      .from('room_members')
      .select('role')
      .eq('room_id', room_id)
      .eq('user_id', userId)
      .single();

    if (member?.role !== 'admin') return res.status(403).json({ error: 'Only admin can remove dishes' });

    const { error } = await supabaseAdmin
      .from('dishes')
      .delete()
      .eq('id', dish_id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
