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
  <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 p-6 md:p-10">
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-400">
          Telegram CRM Engine
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-light tracking-tight text-slate-50">
          Jaya Vapor CRM Blast Center
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Kelola segmentasi pelanggan, personalisasi pesan promosi, dan
          distribusikan notifikasi otomatis melalui Telegram Bot berdasarkan
          preferensi pelanggan secara real-time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Channel
          </p>

          <h3 className="mt-2 text-lg font-semibold text-emerald-400">
            Telegram Bot
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Personalization
          </p>

          <h3 className="mt-2 text-lg font-semibold text-slate-100">
            Dynamic Variables
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Segmentation
          </p>

          <h3 className="mt-2 text-lg font-semibold text-slate-100">
            Preference-Based
          </h3>
        </div>
      </div>

      {/* Form */}
      <form
        action={handleBlast}
        className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl shadow-black/20"
      >
        <div className="space-y-8">

          {/* Segment Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Target Segmentasi Pelanggan
            </label>

            <select
              name="preference"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 text-slate-100 outline-none transition-all focus:border-emerald-500"
            >
              <option value="">-- Pilih Segmen Pelanggan --</option>

              <option value="FRUITY">
                FRUITY — Pecinta Liquid Buah & Dingin
              </option>

              <option value="CREAMY">
                CREAMY — Pecinta Liquid Manis & Dessert
              </option>

              <option value="PODS">
                PODS — Pengguna Pod System
              </option>

              <option value="MOD">
                MOD — Pengguna Mod Device
              </option>

              <option value="COIL_COTTON">
                COIL & COTTON — Pengguna Maintenance Kit
              </option>
            </select>
          </div>

          {/* Message */}
          <div>
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="text-sm font-medium text-slate-300">
                Template Pesan Promosi
              </label>

              <div className="inline-flex w-fit items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                Gunakan [nama] untuk personalisasi
              </div>
            </div>

            <textarea
              name="message"
              required
              rows={8}
              placeholder="Contoh: Halo [nama]! Ada koleksi baru yang sesuai dengan preferensi kamu. Dapatkan promo spesial member hanya minggu ini di Jaya Vapor."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* Information Panel */}
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-emerald-400">
                💡
              </div>

              <div>
                <h4 className="text-sm font-medium text-emerald-400">
                  Catatan Pengujian Skripsi
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Sistem akan melakukan segmentasi pelanggan secara real-time
                  berdasarkan preferensi pembelian yang tersimpan di database
                  Supabase, mengganti variabel personalisasi seperti
                  <span className="mx-1 rounded bg-slate-800 px-2 py-1 text-emerald-400">
                    [nama]
                  </span>
                  dan mengirimkan notifikasi melalui Telegram Bot API secara
                  asinkron.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            Luncurkan Blast Telegram 🚀
          </button>
        </div>
      </form>

    </div>
  </div>
);
}