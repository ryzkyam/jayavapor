"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("product").select("*");
    setProducts(data || []);
  }

  return (
    <div className="flex h-screen bg-[#0b0c0e] text-[#f3f4f6] font-sans overflow-hidden antialiased">
      {/* Sidebar - Tema Premium */}
      <aside className={`fixed lg:relative z-50 w-64 h-full bg-[#0e1013] border-r border-gray-900 p-6 flex flex-col justify-between transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div>
          <div className="flex items-center gap-3 mb-12 px-2">
             <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/50 rounded flex items-center justify-center text-amber-500 font-bold">⚡</div>
             <h1 className="font-semibold text-sm tracking-[0.2em] uppercase text-white">Jaya Vapor</h1>
          </div>
          <nav className="space-y-2 text-[11px] uppercase tracking-widest text-gray-400">
             {["Dashboard", "Members", "Rewards & Points", "Product Catalog", "POS Kasir", "WhatsApp Campaigns", "Retention", "Settings"].map((item) => (
               <div key={item} className={`px-4 py-3 rounded border ${item === "POS Kasir" ? "bg-amber-500/5 border-amber-500/30 text-amber-500" : "border-transparent hover:border-gray-800 hover:text-white transition"}`}>
                 {item}
               </div>
             ))}
          </nav>
        </div>
      </aside>

      {/* Backdrop Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
            <button className="lg:hidden p-2 border border-gray-900 rounded bg-[#0e1013]" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
            <h2 className="text-xl md:text-2xl font-light tracking-tight">Point of Sales</h2>
            <input 
              type="text"
              placeholder="Cari produk..."
              className="bg-[#0e1013] border border-gray-900 rounded px-4 py-2 text-xs w-32 md:w-64 outline-none focus:border-amber-500 transition"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </header>

        {/* Product Grid - Kartu Minimalis */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
              <div key={p.id} onClick={() => setCart([...cart, p])} className="bg-[#121418] border border-gray-900 p-3 md:p-4 cursor-pointer hover:border-amber-500/50 transition-all group">
                <div className="aspect-square bg-[#0b0c0e] mb-3 overflow-hidden border border-gray-900">
                  <img src={p.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                </div>
                <h3 className="text-[10px] md:text-xs font-medium truncate">{p.name}</h3>
                <p className="text-[10px] md:text-xs mt-1 text-amber-500 font-mono">Rp{p.price.toLocaleString()}</p>
              </div>
            ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <aside className="fixed bottom-0 w-full lg:relative lg:w-80 bg-[#0e1013] border-t lg:border-t-0 lg:border-l border-gray-900 p-4 md:p-8 flex flex-col max-h-[30vh] lg:max-h-full">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-6 hidden lg:block">Current Order ({cart.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-4 hidden lg:block">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[11px]">
              <span className="truncate w-40 text-gray-300">{item.name}</span>
              <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-gray-600 hover:text-red-500 uppercase">Remove</button>
            </div>
          ))}
        </div>
        <button className="w-full border border-amber-500/50 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-500 hover:text-black transition">
          Bayar Rp {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
        </button>
      </aside>
    </div>
  );
}