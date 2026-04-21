// pages/api/dishes/import-url.js
// POST { url, room_id }
// Pipeline: cache check → Apify scrape → OpenAI extraction → Spoonacular nutrition → save

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';
import OpenAI               from 'openai';
import axios                from 'axios';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Step 1: Check URL cache ──────────────────────────────────────
async function checkCache(url) {
  const { data } = await supabaseAdmin
    .from('url_cache')
    .select('dish_data')
    .eq('url', url)
    .single();
  return data?.dish_data ?? null;
}

async function saveCache(url, dishData) {
  await supabaseAdmin
    .from('url_cache')
    .upsert({ url, dish_data: dishData });
}

// ── Step 2: Scrape with Apify ────────────────────────────────────
async function scrapeWithApify(url) {
  const isInstagram = url.includes('instagram.com');
  const isYoutube   = url.includes('youtube.com') || url.includes('youtu.be');

  // Choose the right Apify actor
  const actorId = isInstagram
    ? 'apify~instagram-scraper'
    : 'bernardo~youtube-scraper';

  const runUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;

  const input = isInstagram
    ? { directUrls: [url], resultsType: 'posts', resultsLimit: 1 }
    : { startUrls: [{ url }], maxResults: 1 };

  try {
    const response = await axios.post(runUrl, input, {
      headers: { Authorization: `Bearer ${process.env.APIFY_API_TOKEN}` },
      timeout: 30000,
    });

    const data = response.data;
    console.log('[Apify] Scrape successful:', { url, dataLength: data?.length });

    if (!data?.length) {
      console.log('[Apify] No data returned from scraper');
      return null;
    }

    const item = data[0];
    return {
      caption:     item.caption || item.description || '',
      thumbnail:   item.displayUrl || item.thumbnailUrl || item.thumbnailSrc || '',
      hashtags:    item.hashtags?.join(' ') || '',
      transcript:  item.transcription || '',
    };
  } catch (err) {
    console.error('[Apify] Scrape failed:', {
      url,
      status: err.response?.status,
      statusText: err.response?.statusText,
      errorData: err.response?.data,
      message: err.message,
    });
    throw err;
  }
}

// ── Step 3: Extract dish name via OpenAI ────────────────────────
async function extractDishName(scraped) {
  const text = [scraped.caption, scraped.hashtags, scraped.transcript]
    .filter(Boolean).join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role:    'system',
        content: 'You are a food identification assistant. Given text from a food video or reel, identify the main dish name. Return ONLY the dish name (e.g. "Butter Chicken") or "no_dish_found" if it is not a food video.',
      },
      { role: 'user', content: text.slice(0, 2000) },
    ],
    max_tokens: 60,
    temperature: 0,
  });

  const result = completion.choices[0]?.message?.content?.trim();
  if (!result || result === 'no_dish_found') return null;
  return result;
}

// ── Step 4: Get nutrition from Spoonacular ──────────────────────
async function getSpoonacularData(dishName) {
  try {
    // Search for the dish
    const search = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query:    dishName,
        number:   1,
        addRecipeInformation: true,
        addRecipeNutrition:   true,
        apiKey:   process.env.SPOONACULAR_API_KEY,
      },
      timeout: 10000,
    });

    if (!search.data?.results?.length) return null;
    const recipe = search.data.results[0];

    const nutrients = recipe.nutrition?.nutrients || [];
    const get = (name) => Math.round(nutrients.find(n => n.name === name)?.amount ?? 0);

    return {
      name:        recipe.title,
      image_url:   recipe.image,
      description: recipe.summary
        ? recipe.summary.replace(/<[^>]*>/g, '').slice(0, 160)
        : null,
      calories: get('Calories'),
      protein:  get('Protein'),
      carbs:    get('Carbohydrates'),
      fiber:    get('Fiber'),
      ingredients: (recipe.extendedIngredients || []).map(i => i.original),
      steps: (recipe.analyzedInstructions?.[0]?.steps || []).map(s => s.step),
    };
  } catch {
    return null; // Spoonacular failed — graceful fallback
  }
}

// ── MAIN HANDLER ────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { url, room_id } = req.body;
  if (!url || !room_id) return res.status(400).json({ error: 'url and room_id are required' });

  const userId = session.user.supabaseId;

  console.log('[Import URL] Request received:', { url, room_id, userId });

  try {
    // ── 1. Cache check ───────────────────────────────────────────
    const cached = await checkCache(url);
    if (cached) {
      console.log('[Cache] Found cached dish');
      // Save to dish pool (new entry for this room)
      const { data: dish, error } = await supabaseAdmin
        .from('dishes')
        .insert({ ...cached, room_id, added_by: userId, source_url: url })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ dish, fromCache: true });
    }

    // ── 2. Scrape ────────────────────────────────────────────────
    let scraped;
    try {
      scraped = await scrapeWithApify(url);
    } catch (err) {
      console.error('[Handler] Scrape error caught:', err.message);
      scraped = null;
    }

    if (!scraped) {
      return res.status(422).json({
        error:        'scrape_failed',
        message:      'We had trouble fetching this link. Please enter the dish name manually.',
        manualEntry:  true,
      });
    }

    // Check for private account (empty result)
    if (!scraped.caption && !scraped.transcript) {
      return res.status(422).json({
        error:       'private_account',
        message:     'This reel is from a private account. Please enter the dish name manually.',
        thumbnail:   scraped.thumbnail,
        manualEntry: true,
      });
    }

    // ── 3. OpenAI extraction ─────────────────────────────────────
    const dishName = await extractDishName(scraped);

    if (!dishName) {
      return res.status(422).json({
        error:       'no_dish_found',
        message:     "This doesn't look like a food video. Try a different link or enter the dish manually.",
        thumbnail:   scraped.thumbnail,
        manualEntry: true,
      });
    }

    // ── 4. Spoonacular nutrition ──────────────────────────────────
    const spoon = await getSpoonacularData(dishName);

    // Build final dish object
    const dishData = {
      name:        spoon?.name     ?? dishName,
      image_url:   (spoon?.image_url ?? scraped.thumbnail) || null,
      description: spoon?.description ?? null,
      calories:    spoon?.calories  ?? 0,
      protein:     spoon?.protein   ?? 0,
      carbs:       spoon?.carbs     ?? 0,
      fiber:       spoon?.fiber     ?? 0,
      ingredients: spoon?.ingredients ?? [],
      steps:       spoon?.steps      ?? [],
    };

    // ── 5. Save to URL cache ─────────────────────────────────────
    await saveCache(url, dishData);

    // ── 6. Insert into dishes pool ───────────────────────────────
    const { data: dish, error: insertErr } = await supabaseAdmin
      .from('dishes')
      .insert({
        ...dishData,
        room_id,
        added_by:   userId,
        source_url: url,
      })
      .select()
      .single();

    if (insertErr) return res.status(500).json({ error: insertErr.message });

    return res.status(201).json({ dish, fromCache: false });

  } catch (err) {
    console.error('import-url error:', err);
    return res.status(500).json({
      error:       'server_error',
      message:     'Something went wrong. Please enter the dish name manually.',
      manualEntry: true,
    });
  }
}
