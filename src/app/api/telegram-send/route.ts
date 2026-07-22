import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Ambil data dari body request yang dikirim dari halaman Retention
    const { chatId, customerName, preference } = await request.json();
    
    // 2. Ambil TOKEN dari .env.local yang sudah lo set
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "Bot Token belum di-setup di .env.local" },
        { status: 500 }
      );
    }

    // 3. Template pesan personal
    const pesanPromo = `Halo Kak ${customerName}! 👋\n\nLama nih gak kelihatan mampir di Jaya Vapor. Kebetulan kita lagi ada restock varian rasa *${preference || "Umum"}* favorit Kakak loh! ✨\n\nKhusus hari ini, tunjukkan pesan ini ke kasir dan dapatkan *Diskon Potongan Langsung Rp 10.000* untuk pembelanjaan berikutnya. Ditunggu kedatangannya ya Kak! 💨`;

    // 4. Kirim ke API Telegram
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: pesanPromo,
        parse_mode: "Markdown", 
      }),
    });

    const resData = await res.json();

    // 5. Cek respon dari Telegram
    if (!resData.ok) {
      return NextResponse.json(
        { error: resData.description || "Gagal mengirim pesan ke Telegram" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}