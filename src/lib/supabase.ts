import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// El juego es offline-first: sin credenciales funciona igual, solo sin sync.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
  console.warn(
    'Supabase sin configurar (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY): el juego corre solo en local.'
  );
}
