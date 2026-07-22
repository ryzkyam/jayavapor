'use server'

import { supabase } from "../../../lib/supabase";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // FIX 1: Ubah "Product" menjadi "product" (huruf kecil) agar sesuai dengan tabel Postgres
  let query = supabase.from("product").select("*").gt("stock", 0);
  
  if (category) {
    query = query.eq("category", category);
  }
  
  const { data: products, error } = await query;

  // FIX 2: Sesuaikan value kategori dengan hasil pg_enum database lu (image_9268ac.png)
  const categories = [
    { name: "All Products", value: "" },
    { name: "Fruity Series", value: "LIQUID_FRUITY" },
    { name: "Creamy Series", value: "LIQUID_CREAMY" },
    { name: "Devices", value: "PODS" },
    { name: "Mod", value: "MOD" },
    { name: "Coils & Cartridges", value: "CATRIDGE_COIL" },
    { name: "Accessories", value: "ACCESSORIES" },
  ];
return (
  <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black">

    {/* Top Announcement Bar */}
    <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md py-2 text-center text-xs tracking-widest text-slate-400 uppercase">
      Jaya Vapor Live Inventory System v1.0
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <header className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-sm font-semibold tracking-[0.3em] text-emerald-400 uppercase mb-3">
          The Collection
        </h1>

        <p className="text-3xl font-light tracking-tight text-slate-50 sm:text-4xl">
          JAYA VAPOR
        </p>

        <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto my-6" />

        <p className="text-sm text-slate-400 font-light leading-relaxed">
          Eksplorasi lini liquid premium dan perangkat hardware terbaik.
          Seluruh stok terintegrasi langsung secara real-time dengan sistem
          kasir kami.
        </p>
      </header>

      {/* Navigation Filter */}
      <nav className="flex flex-wrap justify-center gap-3 mb-12 border-b border-slate-800 pb-6">
        {categories.map((cat) => {
          const isActive = (category || "") === cat.value;

          return (
            <a
              key={cat.name}
              href={cat.value ? `/catalog?category=${cat.value}` : "/catalog"}
              className={`px-5 py-2 rounded-full text-xs tracking-wider uppercase transition-all duration-300 border ${
                isActive
                  ? "border-emerald-500 bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/20"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-slate-50"
              }`}
            >
              {cat.name}
            </a>
          );
        })}
      </nav>

      {/* Error State */}
      {error && (
        <div className="max-w-md mx-auto text-center p-6 border border-red-500/20 bg-red-500/10 rounded-2xl mb-16">
          <p className="text-xs tracking-wide text-red-400 uppercase">
            Connection Error
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Gagal memuat katalog: {error.message}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!error && (!products || products.length === 0) && (
        <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl mb-16">
          <span className="text-xs tracking-widest text-slate-400 uppercase block mb-2">
            No Items Found
          </span>

          <p className="text-sm text-slate-500">
            Stok untuk kategori ini sedang kosong.
          </p>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 mb-24">
        {products?.map((product: Product) => (
          <div
            key={product.id}
            className="group relative flex flex-col justify-between rounded-2xl p-4 bg-slate-900/40 backdrop-blur-sm border border-slate-800 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/30 hover:bg-slate-900/70"
          >
            {/* Image Container */}
            <div className="w-full aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative transition-all duration-300 group-hover:border-emerald-500/40 group-hover:shadow-xl group-hover:shadow-emerald-500/10">

              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs tracking-widest text-slate-500 uppercase">
                  No Image
                </div>
              )}

              <span className="absolute top-3 left-3 rounded-full text-[10px] tracking-wider text-emerald-300 bg-slate-950/90 border border-emerald-500/20 px-3 py-1 uppercase backdrop-blur-md">
                {product.category.replace("_", " ")}
              </span>
            </div>

            {/* Product Info */}
            <div className="mt-4 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100 tracking-wide group-hover:text-emerald-400 transition-colors duration-300">
                  <span className="absolute inset-0" />
                  {product.name}
                </h3>

                <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {product.description ||
                    "Premium hand-selected item from Jaya Vapor collection."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <p className="text-lg font-bold tracking-wide text-slate-50">
                  IDR {product.price.toLocaleString("id-ID")}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    product.stock <= 5
                      ? "bg-red-500/15 text-red-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {product.stock <= 5
                    ? `Low Stock (${product.stock})`
                    : `In Stock (${product.stock})`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-slate-800 my-16" />

      {/* Value Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 text-center md:text-left">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            01 / Authenticity Guaranteed
          </h4>

          <p className="text-sm text-slate-400 leading-relaxed">
            Kami menjamin 100% keaslian semua produk liquid, device, dan
            aksesoris yang kami kurasi langsung dari distributor resmi.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            02 / Real-time Integration
          </h4>

          <p className="text-sm text-slate-400 leading-relaxed">
            Katalog terhubung langsung dengan sistem Point of Sales (POS) toko.
            Apa yang Anda lihat adalah cerminan akurat stok fisik kami.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            03 / CRM Tiered Rewards
          </h4>

          <p className="text-sm text-slate-400 leading-relaxed">
            Kumpulkan poin di setiap transaksi kasir untuk meningkatkan level
            keanggotaan Anda dan dapatkan penawaran khusus via Telegram.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto mb-24">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-center uppercase text-emerald-400 mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              title: "Apakah stok di katalog web ini selalu akurat?",
              desc: "Ya. Sistem katalog menggunakan arsitektur real-time data fetching dari database pusat yang ter-update otomatis setiap kali kasir memproses penjualan di toko.",
            },
            {
              title: "Bagaimana cara mendaftar menjadi member Jaya Vapor?",
              desc: "Anda cukup menyebutkan nama dan nomor telepon atau ID Telegram kepada staf kasir kami saat melakukan transaksi langsung di outlet fisik kami.",
            },
            {
              title: "Bagaimana sistem tingkatan member bekerja?",
              desc: "Sistem secara otomatis mengkalkulasi akumulasi poin belanja Anda. Tingkatan akan otomatis naik dan memicu diskon khusus yang dipersonalisasi.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="border-b border-slate-800 pb-4"
            >
              <h3 className="text-sm font-medium text-slate-100 mb-2">
                {faq.title}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed">
                {faq.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>

    {/* Footer */}
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        <div className="space-y-3">
          <h5 className="text-sm font-medium text-slate-50 tracking-wider">
            JAYA VAPOR
          </h5>

          <p className="text-[11px] leading-relaxed text-slate-400">
            Platform ekosistem retail vape modern dengan integrasi Omni-channel
            POS & Customer Relationship Management otomatis.
          </p>
        </div>

        <div>
          <h5 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-3">
            Store Hours
          </h5>

          <ul className="space-y-2 text-[11px]">
            <li>Monday - Friday: 12:00 - 22:00</li>
            <li>Saturday - Sunday: 13:00 - 24:00</li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-3">
            Tentang Kami
          </h5>

          <p className="text-[11px] leading-relaxed">
            <br />
            <br />
          </p>
        </div>

        <div>
          <h5 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-3">
            System Integrity
          </h5>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-[10px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-[11px] text-slate-500">
        &copy; {new Date().getFullYear()} Jaya Vapor Management System. All
        Rights Reserved.
      </div>
    </footer>
  </div>
);
}