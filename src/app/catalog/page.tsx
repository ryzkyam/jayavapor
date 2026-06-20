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
    <div className="min-h-screen bg-[#0b0c0e] text-[#f3f4f6] font-sans antialiased selection:bg-amber-500 selection:text-black">
      
      {/* Top Subtle Announcement Bar */}
      <div className="border-b border-gray-900 bg-[#0e1013] py-2 text-center text-xs tracking-widest text-gray-500 uppercase">
        Jaya Vapor Live Inventory System v1.0
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Elegant Header */}
        <header className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-sm font-semibold tracking-[0.3em] text-amber-500 uppercase mb-3">
            The Collection
          </h1>
          <p className="text-3xl font-light tracking-tight text-white sm:text-4xl">
            JAYA VAPOR
          </p>
          <div className="h-[1px] w-12 bg-amber-500/50 mx-auto my-6"></div>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            Eksplorasi lini liquid premium dan perangkat hardware terbaik. Seluruh stok terintegrasi langsung secara real-time dengan sistem kasir kami.
          </p>
        </header>

        {/* Minimalist Navigation Filter */}
        <nav className="flex flex-wrap justify-center gap-3 mb-12 border-b border-gray-900 pb-6">
          {categories.map((cat) => {
            const isActive = (category || "") === cat.value;
            return (
              <a
                key={cat.name}
                href={cat.value ? `/catalog?category=${cat.value}` : "/catalog"}
                className={`px-5 py-2 text-xs tracking-wider uppercase transition-all duration-300 border ${
                  isActive
                    ? "border-amber-500 bg-amber-500/5 text-amber-500 font-medium"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {cat.name}
              </a>
            );
          })}
        </nav>

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto text-center p-6 border border-red-900/30 bg-red-950/10 rounded mb-16">
            <p className="text-xs tracking-wide text-red-400 uppercase">Connection Error</p>
            <p className="text-xs text-gray-500 mt-1">Gagal memuat katalog: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && (!products || products.length === 0) && (
          <div className="text-center py-24 border border-dashed border-gray-900 mb-16">
            <span className="text-xs tracking-widest text-gray-500 uppercase block mb-2">No Items Found</span>
            <p className="text-xs text-gray-600 font-light">Stok untuk kategori ini sedang kosong.</p>
          </div>
        )}

        {/* Premium Product Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 mb-24">
          {products?.map((product: Product) => (
            <div key={product.id} className="group relative flex flex-col justify-between">
              
              {/* Image Thumbnail Container */}
              <div className="w-full aspect-square bg-[#121418] border border-gray-900 overflow-hidden relative transition-colors duration-300 group-hover:border-gray-700">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-center object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs tracking-widest text-gray-600 uppercase font-light">
                    No Image
                  </div>
                )}
                
                {/* Minimalist Category Tag */}
                <span className="absolute top-3 left-3 text-[9px] tracking-widest text-gray-400 bg-[#0b0c0e]/90 border border-gray-800 px-2 py-0.5 uppercase">
                  {product.category.replace('_', ' ')}
                </span>
              </div>

              {/* Product Info Section */}
              <div className="mt-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-200 tracking-wide group-hover:text-amber-500 transition-colors duration-300">
                    <span className="absolute inset-0" />
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">
                    {product.description || "Premium hand-selected item from Jaya Vapor collection."}
                  </p>
                </div>

                {/* Pricing & Stock Status */}
                <div className="mt-4 pt-3 border-t border-gray-900/60 flex items-baseline justify-between">
                  <p className="text-sm font-medium tracking-wide text-white">
                    IDR {product.price.toLocaleString("id-ID")}
                  </p>
                  
                  <span className={`text-[10px] tracking-wider uppercase font-medium ${
                    product.stock <= 5 
                      ? "text-rose-400" 
                      : "text-gray-400"
                  }`}>
                    {product.stock <= 5 ? `Low Stock (${product.stock})` : `In Stock (${product.stock})`}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        <hr className="border-gray-900 my-16" />

        {/* BRAND VALUE METRICS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 text-center md:text-left">
          <div className="p-6 border border-gray-900/50 bg-[#0e1013]/40">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">01 / Authenticity Guaranteed</h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">Kami menjamin 100% keaslian semua produk liquid, device, dan aksesoris yang kami kurasi langsung dari distributor resmi.</p>
          </div>
          <div className="p-6 border border-gray-900/50 bg-[#0e1013]/40">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">02 / Real-time Integration</h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">Katalog terhubung langsung dengan sistem Point of Sales (POS) toko. Apa yang Anda lihat adalah cerminan akurat stok fisik kami.</p>
          </div>
          <div className="p-6 border border-gray-900/50 bg-[#0e1013]/40">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">03 / CRM Tiered Rewards</h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">Kumpulkan poin di setiap transaksi kasir untuk meningkatkan level keanggotaan Anda dan dapatkan penawaran khusus via Telegram.</p>
          </div>
        </section>

        {/* INTERACTIVE FAQ SECTION */}
        <section className="max-w-3xl mx-auto mb-24">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-center uppercase text-amber-500 mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-900 pb-4">
              <h3 className="text-sm font-medium text-gray-200 mb-2">Apakah stok di katalog web ini selalu akurat?</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">Ya. Sistem katalog menggunakan arsitektur real-time data fetching dari database pusat yang ter-update otomatis setiap kali kasir memproses penjualan di toko.</p>
            </div>
            <div className="border-b border-gray-900 pb-4">
              <h3 className="text-sm font-medium text-gray-200 mb-2">Bagaimana cara mendaftar menjadi member Jaya Vapor?</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">Anda cukup menyebutkan nama dan nomor telepon/ID Telegram kepada staf kasir kami saat melakukan transaksi langsung di outlet fisik kami.</p>
            </div>
            <div className="border-b border-gray-900 pb-4">
              <h3 className="text-sm font-medium text-gray-200 mb-2">Bagaimana sistem tingkatan member (tiering) bekerja?</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">Sistem secara otomatis mengkalkulasi akumulasi poin belanja Anda. Tingkatan akan otomatis naik (dari Bronze, Silver, ke Gold) memicu diskon khusus yang dipersonalisasi.</p>
            </div>
          </div>
        </section>

      </div>

      {/* PREMIUM FOOTER SECTION */}
      <footer className="border-t border-gray-900 bg-[#060708] text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-white tracking-wider">JAYA VAPOR</h5>
            <p className="font-light text-gray-500 leading-relaxed text-[11px]">
              Platform ekosistem retail vape modern dengan integrasi Omni-channel POS & Customer Relationship Management otomatis.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">Store Hours</h5>
            <ul className="space-y-2 font-light text-[11px]">
              <li>Monday - Friday: 12:00 - 22:00</li>
              <li>Saturday - Sunday: 13:00 - 24:00</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">Academic Context</h5>
            <p className="font-light text-[11px] leading-relaxed">
              Project Tugas Akhir / Skripsi<br />
              Program Studi Sistem Informasi<br />
              Universitas Gunadarma
            </p>
          </div>
          <div>
            <h5 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">System Integrity</h5>
            <div className="inline-flex items-center gap-2 bg-[#0b0c0e] border border-gray-900 px-3 py-1.5 rounded text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
        <div className="border-t border-[#101216] bg-[#040506] py-6 text-center text-[11px] font-light text-gray-600">
          &copy; {new Date().getFullYear()} Jaya Vapor Management System. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}