"use server";

import { createClient } from "@supabase/supabase-js";

export async function addMemberAction(newName: string, newTelegramId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Di sisi server, service role key ini dijamin 100% kebaca dan aman
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: "Konfigurasi variabel .env Supabase belum lengkap di server." };
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const generatedId = "cust_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    const { error } = await adminSupabase
      .from("Customer")
      .insert([
        {
          id: generatedId,
          name: newName,
          telegramChatId: newTelegramId || null,
          points: 0,
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server internal." };
  }
}