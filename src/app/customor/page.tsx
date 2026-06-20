"use client";

import { useState } from "react";

export default function CustomerResponsivePage() {
  return (
    <div className="min-h-screen bg-[#060708] text-[#f3f4f6]">
      
      {/* 
         LAYOUT RESPONSIVE:
         - Mobile: Pakai grid tunggal (stack)
         - Desktop (lg): Pakai grid 3 kolom (Sidebar | Main | Stats/Cart) 
      */}
      <div className="lg:grid lg:grid-cols-[280px_1fr_350px] min-h-screen">
        
        {/* SIDEBAR (Hanya muncul di Desktop) */}
        <aside className="hidden lg:flex flex-col border-r border-gray-900 bg-[#0e1013] p-8">
           <h1 className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-12">Jaya Vapor</h1>
           <nav className="space-y-6 text-xs uppercase tracking-widest text-gray-400">
             {["Dashboard", "Catalog", "Rewards", "Profile"].map(item => (
               <div key={item} className="cursor-pointer hover:text-white transition">{item}</div>
             ))}
           </nav>
        </aside>

        {/* MAIN CONTENT (Responsive) */}
        <main className="p-6 md:p-12 overflow-y-auto">
           {/* Header & Stats (Tetap rapi di semua layar) */}
           <header className="mb-12">
             <h2 className="text-2xl font-light">Budi Santoso</h2>
             <p className="text-gray-500 text-xs uppercase tracking-widest">Platinum Member</p>
           </header>

           {/* Grid Produk: Mobile 2 kol, Desktop 4 kol */}
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-[#0e1013] border border-gray-900 p-4 rounded hover:border-amber-500/30 transition">
                  <div className="aspect-square bg-[#121418] mb-4"></div>
                  <p className="text-xs">Fruity Series #{i}</p>
                </div>
              ))}
           </div>
        </main>

        {/* SIDEBAR KANAN / CART (Muncul di Desktop, jadi drawer/fixed di Mobile) */}
        <aside className="border-l border-gray-900 bg-[#0e1013] p-8 hidden lg:block">
           <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-8">Points Summary</h3>
           <div className="bg-amber-500/5 border border-amber-500/30 p-6 rounded">
              <p className="text-3xl font-light text-amber-500">12,400</p>
              <p className="text-[10px] text-gray-400 uppercase">Available Points</p>
           </div>
        </aside>

      </div>

      {/* BOTTOM NAV (Hanya muncul di Mobile) */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-[#0e1013] border-t border-gray-900 flex justify-around p-4 text-[10px] uppercase">
        {["Home", "Shop", "Rewards", "Profile"].map(item => (
          <div key={item} className="text-gray-500">{item}</div>
        ))}
      </nav>
    </div>
  );
}