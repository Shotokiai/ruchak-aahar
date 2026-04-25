import { getToken } from 'next-auth/jwt';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.supabaseId) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const formData = await req.formData();
  const name      = formData.get('name');
  const calories  = parseInt(formData.get('calories'))  || 0;
  const protein   = parseInt(formData.get('protein'))   || 0;
  const carbs     = parseInt(formData.get('carbs'))     || 0;
  const fiber     = parseInt(formData.get('fiber'))     || 0;
  let   roomId    = formData.get('room_id');
  const imageFile = formData.get('image');

  if (!name?.trim()) return Response.json({ error: 'Dish name required' }, { status: 400 });

  // Look up room from DB if not provided
  if (!roomId) {
    const { data: membership } = await supabaseAdmin
      .from('room_members')
      .select('room_id')
      .eq('user_id', token.supabaseId)
      .single();
    roomId = membership?.room_id;
  }
  if (!roomId) return Response.json({ error: 'Not in a room' }, { status: 400 });

  // Upload image to Supabase Storage if provided
  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    const ext      = (imageFile.name?.split('.').pop() || 'jpg').toLowerCase();
    const filename = `dishes/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const buffer   = await imageFile.arrayBuffer();
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('dish-images')
      .upload(filename, buffer, { contentType: imageFile.type || 'image/jpeg', upsert: false });
    if (!uploadErr) {
      const { data: urlData } = supabaseAdmin.storage.from('dish-images').getPublicUrl(filename);
      imageUrl = urlData.publicUrl;
    }
  }

  const { data: dish, error } = await supabaseAdmin
    .from('dishes')
    .insert({
      room_id:    roomId,
      added_by:   token.supabaseId,
      name:       name.trim(),
      image_url:  imageUrl,
      calories,
      protein,
      carbs,
      fiber,
      source_url: 'manual',   // 'manual' = added by hand; URL string = scraped from link
      ingredients: [],
      steps:       [],
      match_score: 0,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ dish });
}
