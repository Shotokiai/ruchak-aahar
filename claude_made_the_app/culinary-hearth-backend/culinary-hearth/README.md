# The Culinary Hearth — Setup Guide

## Step 1 — Supabase (5 min)
1. supabase.com → New Project → name it "culinary-hearth"
2. SQL Editor → New Query → paste supabase/schema.sql → Run
3. Settings → API → copy Project URL, anon key, service_role key

## Step 2 — Google OAuth (5 min)
1. console.cloud.google.com → Credentials → OAuth 2.0 Client ID
2. Redirect URIs: http://localhost:3000/api/auth/callback/google
3. Copy Client ID + Client Secret

⚠️ TESTING MODE FIX:
- OAuth Consent Screen → Test users → add your email → Save
- OR click "Publish App" to allow anyone (no review needed for basic scopes)

## Step 3 — Other keys
- OPENAI_API_KEY: platform.openai.com → API Keys
- APIFY_API_TOKEN: console.apify.com → Settings → API tokens
- SPOONACULAR_API_KEY: spoonacular.com/food-api/console
- NEXTAUTH_SECRET: run "openssl rand -base64 32" in terminal

## Step 4 — Run
npm install
cp .env.example .env.local   # fill in all values
npm run dev
# open http://localhost:3000

## Step 5 — Deploy to Vercel
npm i -g vercel && vercel
# Add all env vars in Vercel dashboard → Settings → Environment Variables

## API Pipeline (URL import)
URL → url_cache check → Apify scrape → GPT-4o dish name → Spoonacular nutrition → save to DB
Same URL processed only once (cached) = zero duplicate API costs

## Calorie Formula (Mifflin-St Jeor)
BMR = 10×weight_kg + 6.25×height_cm - 5×age + 5 (male)
Maintenance = BMR × {sedentary:1.2, light:1.375, moderate:1.55}
Target = Maintenance + {lean:-400, fit:0, athletic:+250}
