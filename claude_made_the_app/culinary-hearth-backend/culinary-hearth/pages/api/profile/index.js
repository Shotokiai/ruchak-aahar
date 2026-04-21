// pages/api/profile/index.js
import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';
import { calcCalories }     from '../../../lib/calorie';

function calcAgeFromDob(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.supabaseId;

  // ── GET ───────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Compute current age from DOB on every GET so it stays accurate
    if (data?.date_of_birth && !data.age) {
      data.age = calcAgeFromDob(data.date_of_birth);
    }

    return res.status(200).json(data);
  }

  // ── POST (save onboarding or partial update from profile edit) ────
  if (req.method === 'POST') {
    const {
      dob, date_of_birth,
      weight_kg, height_cm,
      food_pref, allergies,
      activity_level, body_goal,
      custom_avatar_url,
      gender = 'm',
    } = req.body;

    const dobValue = dob || date_of_birth || null;
    const age      = dobValue ? calcAgeFromDob(dobValue) : null;

    // Only recalculate calories if we have enough data
    let maintenance = null;
    let target      = null;
    if (age && weight_kg && height_cm && activity_level && body_goal) {
      const result = calcCalories(age, weight_kg, height_cm, activity_level, body_goal, gender);
      maintenance  = result.maintenance;
      target       = result.target;
    }

    // Build update payload — only include fields that were actually sent
    const update = {};
    if (dobValue)            update.date_of_birth    = dobValue;
    if (weight_kg)           update.weight_kg        = weight_kg;
    if (height_cm)           update.height_cm        = height_cm;
    if (food_pref)           update.food_pref        = food_pref;
    if (allergies)           update.allergies        = allergies;
    if (activity_level)      update.activity_level   = activity_level;
    if (body_goal)           update.body_goal        = body_goal;
    if (custom_avatar_url)   update.custom_avatar_url = custom_avatar_url;
    if (maintenance !== null) update.maintenance_cal = maintenance;
    if (target !== null)      update.target_cal      = target;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(update)
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data, maintenance, target });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
