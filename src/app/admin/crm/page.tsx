'use server' // Menggunakan Server Component karena Next.js 16 default-nya bisa langsung render UI

import { blastSegmentedPromo } from "../../actions/crm";

export default async function CrmPage() {
  // Ini fungsi handler lokal untuk form submission di Server Component (Form Actions)
  async function handleBlast(formData: FormData) {
    'use server'
    const preference = formData.get('preference') as string;
    const message = formData.get('message') as string;

    if (!preference || !message) return;

    try {
      const res = await blastSegmentedPromo(preference, message);
      console.log(`[CRM Blast] Sukses mengirim ke ${res.totalSent} pelanggan!`);
    } catch (err) {
      console.error("Gagal melakukan blast:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Jaya Vapor — CRM Blast Engine
          </h1>
          <p className="text-gray-400 mt-2">
            Sistem Segmentasi Pelanggan Otomatis & Penyiaran Promo via Bot Telegram Resmi
          </p>
        </div>

        {/* Form Container */}
        <form action={handleBlast} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 shadow-2xl">
          
          {/* Input 1: Pilihan Segmentasi Preferensi */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Segmentasi Pelanggan (Preferensi)
            </label>
            <select 
              name="preference" 
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">-- Pilih Segmen Rasa / Device --</option>
              <option value="FRUITY">FRUITY (Pecinta Liquid Dingin/Buah)</option>
              <option value="CREAMY">CREAMY (Pecinta Liquid Manis/Kue)</option>
              <option value="PODS">PODS User</option>
              <option value="MOD">MOD User</option>
              <option value="COIL_COTTON">Maintenance (Coil & Cotton)</option>
            </select>
          </div>

          {/* Input 2: Template Teks Pesan */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Template Pesan Promosi
              </label>
              <span className="text-xs text-gray-500 bg-gray-950 px-2 py-1 rounded border border-gray-800">
                Gunakan <code className="text-blue-400">[nama]</code> untuk personalisasi nama
              </span>
            </div>
            <textarea
              name="message"
              required
              rows={6}
              placeholder="Contoh: Halo bro [nama]! Ada liquid baru nih yang pas banget sama selera kamu. Mampir yuk ke Jaya Vapor hari ini dan dapatkan diskon khusus member..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>

          {/* Info Tambahan Akademis */}
          <div className="p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg">
            <p className="text-xs text-blue-400 leading-relaxed">
              💡 <strong>Catatan Pengujian Skripsi:</strong> Sistem ini akan memfilter database Supabase secara *real-time* sesuai kategori preferensi yang dipilih, mengonversi tag personalisasi nama, lalu menyiarkannya secara asinkron menggunakan protokol HTTP POST Telegram Bot API.
            </p>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer text-center"
          >
            Luncurkan Blast Telegram 🚀
          </button>

        </form>
      </div>
    </div>
  );
}