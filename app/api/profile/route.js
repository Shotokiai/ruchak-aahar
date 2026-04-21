import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { calcCalories } from '../../../lib/calorie';

function calcAgeFromDob(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', session.user.supabaseId)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  // Ensure age is computed from DOB if not already set
  if (data?.date_of_birth && !data.age) {
    data.age = calcAgeFromDob(data.date_of_birth);
  }
  
  return Response.json(data);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const { dob, date_of_birth, weight_kg, height_cm, food_pref, allergies, activity_level, body_goal, gender = 'm' } = body;

  const dobValue = dob || date_of_birth || null;
  const age = dobValue ? calcAgeFromDob(dobValue) : null;

  let maintenance = null, target = null;
  if (age && weight_kg && height_cm && activity_level && body_goal) {
    ({ maintenance, target } = calcCalories(age, weight_kg, height_cm, activity_level, body_goal, gender));
  }

  const update = {};
  if (dobValue)           update.date_of_birth  = dobValue;
  if (age !== null)       update.age            = age;
  if (weight_kg)          update.weight_kg      = weight_kg;
  if (height_cm)          update.height_cm      = height_cm;
  if (food_pref)          update.food_pref      = food_pref;
  if (allergies)          update.allergies      = allergies;
  if (activity_level)     update.activity_level = activity_level;
  if (body_goal)          update.body_goal      = body_goal;
  if (maintenance !== null) update.maintenance_cal = maintenance;
  if (target !== null)      update.target_cal     = target;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(update)
    .eq('id', session.user.supabaseId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ profile: data, maintenance, target });
}
