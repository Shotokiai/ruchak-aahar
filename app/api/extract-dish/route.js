export async function POST(request) {
  const { url } = await request.json();

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'invalid_url', message: 'Please provide a valid URL.' }, { status: 400 });
  }

  // Instagram blocks server-side crawlers — inform the user
  if (/instagram\.com|instagr\.am/i.test(url)) {
    return Response.json({ error: 'instagram_not_supported', message: "Instagram links can't be auto-extracted. Use Add Manually in the Planner instead." }, { status: 422 });
  }

  // Try to fetch the page HTML
  let html = '';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0; +https://ruchakaahar.app)' },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (e) {
    return Response.json({ error: 'fetch_failed', message: 'Could not open that link. Make sure it is a public recipe page.' }, { status: 422 });
  }

  // Extract Open Graph / basic metadata
  const ogTitle   = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || '';
  const ogImage   = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || '';
  const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const name = (ogTitle || pageTitle).split('|')[0].split('-')[0].split('–')[0].trim();

  if (!name) {
    return Response.json({ error: 'no_content', message: 'Could not find dish info on this page.' }, { status: 422 });
  }

  // Try AI extraction if OpenAI key is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Give AI the page title + first 2000 chars of visible text
      const visibleText = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').slice(0, 2000);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Extract dish info from this recipe page. Return ONLY valid JSON with keys: name (string), cal (number, total calories per serving), protein (number, grams), carbs (number, grams), fiber (number, grams). If you cannot determine a value use 0.\n\nPage content:\n${visibleText}`,
        }],
        max_tokens: 150,
        temperature: 0,
      });

      const raw = completion.choices[0]?.message?.content?.trim() || '';
      const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0];
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        return Response.json({
          dish: {
            id: Date.now(),
            name: parsed.name || name,
            img: ogImage || '',
            cal: Number(parsed.cal) || 0,
            protein: Number(parsed.protein) || 0,
            carbs: Number(parsed.carbs) || 0,
            fiber: Number(parsed.fiber) || 0,
            desc: `"Added from ${new URL(url).hostname}"`,
            ingredients: [],
            steps: [],
          },
        });
      }
    } catch (e) {
      console.error('OpenAI extraction failed:', e.message);
    }
  }

  // Fallback: return dish with name + image, calories unknown (user can edit)
  return Response.json({
    dish: {
      id: Date.now(),
      name,
      img: ogImage || '',
      cal: 0, protein: 0, carbs: 0, fiber: 0,
      desc: `"Added from ${new URL(url).hostname}"`,
      ingredients: [], steps: [],
    },
    needsNutrition: true,
    message: 'Dish added! Nutrition info could not be extracted — you can update it manually.',
  });
}
