<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# jayavapor

PRODUCT REQUIREMENT DOCUMENT (PRD)1. Tujuan ProdukMembangun sistem CRM tersentralisasi untuk Jaya Vapor guna meningkatkan retensi pelanggan melalui segmentasi otomatis (preferensi vape), program loyalitas (membership & poin), dan otomatisasi follow-up menggunakan WhatsApp Gateway.2. User PersonaAdmin / Kasir: Menginput transaksi belanja, memantau riwayat member, dan mengelola stok produk.Owner / Marketer: Melihat visualisasi retensi, membuat template promo, dan melakukan blast message berdasarkan preferensi produk pelanggan.3. Ruang Lingkup Fitur (Scope)MVP (Minimum Viable Product):Sistem Kasir (Input transaksi multi-item & perhitungan poin).Otomatisasi Leveling Membership (Bronze, Silver, Gold).Dashboard Segmentasi & Broadcast WhatsApp (Berdasarkan jenis liquid/device).Sistem Reminder Otomatis (Cron Job 30 hari tanpa transaksi).🛠️ FUNCTIONAL SPECIFICATION DOCUMENT (FSD)1. Alur Kerja Sistem (Flowchart Logika Bisnis)[Transaksi Masuk] 
       │
       ▼
[Hitung Total Belanja] ──► [Potong Stok di Tabel Product]
       │
       ▼
[Generate Poin Baru] ──► [Simpan ke PointLog] ──► [Update Total Poin Customer]
       │
       ▼
[Sistem Cek Total Poin] ──► Poin > 500? ──► Tier = GOLD
                        ──► Poin > 200? ──► Tier = SILVER
                        ──► Poin < 200? ──► Tier = BRONZE
2. Spesifikasi Fungsional KomponenModulFungsi KhususOutput SistemKasir & TransaksiInput transaksi menggunakan TransactionItemStok berkurang, PointLog terisi, Poin bertambah.Membership EngineEvaluasi berkala jumlah poin akumulatif pelangganPerubahan otomatis pada status Tier (Customer).WhatsApp BlastKirim pesan massal dengan string replacement [nama]Data tersimpan di WaLog dengan status SENT / FAILED.Cron RetentionAutomation script mendeteksi Last Transaction $> 30$ hariKirim pesan pengingat otomatis ke WhatsApp pelanggan.📊 SOFTWARE REQUIREMENT SPECIFICATION (SRS)1. Kebutuhan Non-Fungsional (Non-Functional Requirements)Keamanan (Security): Autentikasi menggunakan Supabase Auth (Admin login). API Key WhatsApp Gateway diletakkan di sisi server (.env), dilarang bocor ke client-side.Skalabilitas & Performa: State management menggunakan fitur bawaan Next.js Server Actions untuk meminimalkan beban loading pada client.Keandalan (Reliability): Integrasi API eksternal (WA Gateway) dibungkus dalam blok try-catch dengan penanganan log gagal di tabel WaLog agar sistem kasir tidak crash jika kuota WA habis.2. Dokumen Kebutuhan Antarmuka (UI/UX Requirement)Dashboard Utama: Menampilkan metric card total pelanggan, total transaksi bulan ini, dan grafik rasio retensi pelanggan (pelanggan aktif vs pelanggan pasif).Form Transaksi Kasir: Bersifat dinamis (bisa tambah baris produk sesuka hati memakai state array React).3. Teknologi Stack yang Digunakan (Tech Stack)Framework: Next.js (App Router, TypeScript)Database: PostgreSQL (Hosted via Supabase)ORM: Prisma ORMStyling: Tailwind CSS & Shadcn/ui (untuk dashboard cepat & rapi)Scheduler: Vercel Cron Jobs / Trigger.dev (untuk penembak otomatis reminder 30 hari)💡 Tips Penggunaan Dokumen Ini buat Bab 3 Skripsi:PRD bisa lu pakai buat bahan menulis di sub-bab "Latar Belakang Batasan Masalah".FSD sangat berguna pas lu ngegambar Use Case Diagram dan Activity Diagram.SRS bisa langsung lu salin untuk isi sub-bab "Analisis Kebutuhan Sistem (Perangkat Keras & Perangkat Lunak)".
>>>>>>> 8ee4a3ac26a1107a434cb568ed4a0dd396ac7792
