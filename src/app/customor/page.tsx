"use client";

import { useState } from "react";

export default function CustomerHomePage() {
  const [points] = useState(12400);

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f3f4f6] font-sans p-4 pb-24">
      
      {/* Header Profile */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Welcome back,</p>
          <h2 className="text-lg font-medium">Budi Santoso</h2>
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-xs font-bold bg-[#0e1013]">BS</div>
      </header>

      {/* Member Card - Mengikuti tema premium */}
      <div className="bg-[#0e1013] border border-gray-900 p-6 rounded-lg mb-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-amber-500/20">⚡</div>
        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Tier</p>
        <h3 className="text-amber-500 font-bold mb-6 flex items-center gap-2">
          ★ Platinum
        </h3>
        <p className="text-[9px] uppercase tracking-widest text-gray-500">Jaya Vapor Points</p>
        <p className="text-3xl font-light tracking-tight">{points.toLocaleString()} <span className="text-sm text-gray-600">Pts</span></p>
        <p className="text-[10px] text-gray-600 mt-4 tracking-widest">ID: JV-9821</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {["Redeem", "Catalog", "My Flavors"].map((item) => (
          <div key={item} className="bg-[#0e1013] border border-gray-900 p-4 rounded text-center hover:border-amber-500/30 transition">
            <div className="text-amber-500 mb-2">○</div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">{item}</p>
          </div>
        ))}
      </div>

      {/* For You Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium uppercase tracking-widest text-white">For You (Fruity)</h3>
          <button className="text-[10px] text-amber-500 uppercase tracking-widest">See All</button>
        </div>
        
        <div className="space-y-3">
          {[
            { name: "Fruity Series", price: 110000, pts: 110 },
            { name: "Iceberg Mango", price: 120000, pts: 120 },
            { name: "Vaporesso XROS 4", price: 350000, pts: 350 },
          ].map((item, i) => (
            <div key={i} className="bg-[#0e1013] border border-gray-900 p-4 rounded flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">{item.name} (30ml)</p>
                <p className="text-xs text-amber-500">Rp {item.price.toLocaleString()}</p>
              </div>
              <div className="text-[9px] border border-gray-800 px-2 py-1 text-gray-500">+{item.pts} pts</div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Section */}
      <div className="border border-amber-500/30 bg-amber-500/5 p-6 rounded-lg text-center">
        <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-2">Promo Khusus Anda!</p>
        <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">Tukarkan 2000 poin dengan diskon 20% untuk pembelian liquid fruity apapun minggu ini.</p>
        <button className="w-full border border-amber-500 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black transition">
          Claim Promo
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0e1013] border-t border-gray-900 flex justify-around p-4 text-[9px] uppercase tracking-widest text-gray-500">
        {["Home", "Shop", "QR", "Rewards", "Profile"].map((nav) => (
          <div key={nav} className={`text-center ${nav === "Home" ? "text-amber-500" : ""}`}>
            <div className="mb-1">{nav === "QR" ? "⊞" : "○"}</div>
            {nav}
          </div>
        ))}
      </nav>
    </div>
  );
}