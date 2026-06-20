// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Waduh, URL atau Anon Key Supabase belum di-setup di .env bro!");
}

// PASTIKAN ADA KATA 'export' DI DEPAN SINI
export const supabase = createClient(supabaseUrl, supabaseAnonKey);