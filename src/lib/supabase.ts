import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://jodlahwwtogsufygwfpr.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
} catch (error) {
  console.warn('Falha ao inicializar o cliente Supabase. Operando em modo de dados locais com persistência.', error);
}

export const isSupabaseConfigured = () => Boolean(supabase);
