import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Export a configured supabase client if keys are present, or null as a fallback indicator
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Helper to check if standard Supabase Auth is enabled in the active environment.
 */
export const isSupabaseAuthEnabled = (): boolean => {
  return !!supabase;
};
