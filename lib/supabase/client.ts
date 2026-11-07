import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client browser Supabase. Mengembalikan null bila env belum diset —
 * app tetap jalan dalam Mode Demo Lokal (localStorage `nexcreator-v5`).
 * Anon key bersifat publik; keamanan ditegakkan RLS per-user di database.
 */
export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
