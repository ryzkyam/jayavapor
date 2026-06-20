"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("product").select("*");
    setProducts(data || []);
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f3f4f6] font-sans p-6">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 text-sm">Manage your vape devices, liquids, and accessories.</p>
        </div>
        {/* Tombol Ungu persis screenshot */}
        <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20">
          + Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-[#121418] border border-[#1f2937] rounded-xl px-4 py-3 flex items-center">
          <span className="text-gray-500 mr-3">🔍</span>
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            className="w-full bg-transparent outline-none text-sm text-white"
          />
        </div>
        <button className="border border-[#1f2937] bg-[#121418] px-5 py-3 rounded-xl text-sm hover:border-gray-600 transition">Filter Category</button>
        <button className="border border-[#1f2937] bg-[#121418] px-5 py-3 rounded-xl text-sm hover:border-gray-600 transition">Price</button>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-[#121418] border border-[#1f2937] rounded-2xl p-5 hover:border-[#8b5cf6]/50 transition-all cursor-pointer">
            {/* Card Content */}
            <div className="h-36 bg-[#0b0c0e] rounded-xl mb-4 flex items-center justify-center border border-[#1f2937] overflow-hidden">
               {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <span className="text-[#8b5cf6] text-3xl">📦</span>}
            </div>
            
            <div className="space-y-1">
              <p className="text-[#8b5cf6] text-[10px] font-bold tracking-widest uppercase">{p.category}</p>
              <h3 className="font-semibold text-sm">{p.name}</h3>
            </div>

            <div className="flex justify-between items-end mt-4">
              <span className="font-bold text-sm">Rp {p.price.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500">{p.stock} in stock</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}