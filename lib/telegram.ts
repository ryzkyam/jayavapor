// src/lib/telegram.ts

export async function sendTelegramMessage(chatId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown", // Mendukung cetak tebal (*) dan miring (_) di Telegram
      }),
    });

    const data = await response.json();
    // Jika 'ok' bernilai true, berarti pesan sukses terkirim ke Telegram API
    return { success: data.ok === true, data };
  } catch (error) {
    console.error("Telegram API Error:", error);
    return { success: false, error };
  }
}