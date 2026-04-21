// lib/supabase.js
// Browser-side Supabase client (uses anon key — respects RLS)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase env vars. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnon);
