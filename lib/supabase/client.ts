import { createClient } from "@supabase/supabase-js";

function cleanSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = cleanSupabaseUrl(rawUrl);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

