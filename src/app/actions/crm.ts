// src/app/actions/crm.ts
'use server'

import { supabase } from "../../../lib/supabase";
import { sendTelegramMessage } from "../../../lib/telegram"; // Nanti kita buat helper ini setelah ini

export async function blastSegmentedPromo(preference: string, templateMessage: string) {
  // 1. Tarik data customer dari Supabase berdasarkan segmen preferensi vape mereka
  const { data: targetedCustomers, error } = await supabase
    .from('Customer')
    .select('*')
    .eq('preference', preference);

  if (error || !targetedCustomers) {
    throw new Error("Gagal menarik data segmen customer: " + error?.message);
  }

  let successCount = 0;

  // 2. Loop untuk kirim pesan terpersonalisasi ke tiap customer via Telegram
  for (const customer of targetedCustomers) {
    // Teknik CRM: Mengubah tag [nama] di template menjadi nama asli customer
    const personalizedText = templateMessage.replace(/\[nama\]/g, customer.name);

    // Kirim pesan lewat Bot Telegram menggunakan Telegram Chat ID
    const tgResponse = await sendTelegramMessage(customer.telegramChatId, personalizedText);

    // 3. Catat log pengiriman ke tabel TgLog di Supabase buat bahan audit skripsi
    await supabase
      .from('TgLog')
      .insert([{
        customerId: customer.id,
        message: personalizedText,
        status: tgResponse.success ? 'SENT' : 'FAILED',
        type: 'SEGMENTED'
      }]);

    if (tgResponse.success) successCount++;
  }

  return { success: true, totalSent: successCount };
}