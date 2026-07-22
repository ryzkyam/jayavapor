"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase"; 
import { Plus, Package, Layers, BarChart3, AlertCircle, X, Loader2, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string; 
  price: number;
  stock: number;
  imageUrl: string;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk melacak apakah sedang "Tambah" atau "Edit"
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);



  // States form input murni sesuai ERD
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('LIQUID_FRUITY'); 
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('Product')
      .select('id, name, sku, category, price, stock, imageUrl')
      .order('name', { ascending: true });

    if (!error && data) {
      setProducts(data);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi untuk buka modal "Tambah Baru"
  function openAddModal() {
    setEditingProduct(null);
    setName('');
    setSku('');
    setCategory('LIQUID_FRUITY');
    setPrice('');
    setStock('');
    setImageUrl('');
    setIsModalOpen(true);
  }

  // Fungsi untuk buka modal "Edit / Update" saat kartu produk diklik
  function openEditModal(product: Product) {
    setEditingProduct(product);
    setName(product.name || '');
    setSku(product.sku || '');
    setCategory(product.category || 'LIQUID_FRUITY');
    setPrice(product.price ? product.price.toString() : '');
    setStock(product.stock ? product.stock.toString() : '');
    setImageUrl(product.imageUrl || '');
    setIsModalOpen(true);
  }

  // Handle Create & Update jadi satu form handler
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      alert("Harga dan Stok harus angka!");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim() || null,
      category: category, 
      price: parsedPrice,
      stock: parsedStock,
      imageUrl: imageUrl.trim() || null 
    };

    if (editingProduct) {
      // --- FUNGSI UPDATE ---
      const { error } = await supabase
        .from('Product')
        .update(payload)
        .eq('id', editingProduct.id);

      setIsSubmitting(false);

      if (!error) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        console.error("Error Update Supabase:", error);
        alert(`Gagal mengupdate: ${error.message}`);
      }
    } else {
      // --- FUNGSI CREATE ---
      const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const { error } = await supabase
        .from('Product')
        .insert([{ id: generateId(), ...payload }]);

      setIsSubmitting(false);

      if (!error) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        console.error("Error Create Supabase:", error);
        alert(`Gagal menyimpan: ${error.message}`);
      }
    }
  }

  // --- FUNGSI DELETE ---
  async function handleDeleteProduct() {
    if (!editingProduct) return;
    
    const confirmDelete = window.confirm(`Yakin mau hapus produk "${editingProduct.name}"?`);
    if (!confirmDelete) return;

    setIsDeleting(true);

    const { error } = await supabase
      .from('Product')
      .delete()
      .eq('id', editingProduct.id);

    setIsDeleting(false);

    if (!error) {
      setIsModalOpen(false);
      fetchProducts();
    } else {
      console.error("Error Delete Supabase:", error);
      alert(`Gagal menghapus: ${error.message}`);
    }
  }

  const totalItems = products.length;
  const totalStockFisik = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const outOfStockItems = products.filter(p => (p.stock || 0) === 0).length;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 min-h-screen bg-[#090f1c] border-r border-slate-900 p-6 flex flex-col justify-between hidden md:flex flex-shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-base">⚡</div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Jaya Vapor</h2>
              <p className="text-[10px] text-slate-500 font-medium">CRM & POS SYSTEM</p>
            </div>
          </div>

          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block px-2 mb-2">Main Menu</span>
            <a href="#" className="block px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition">Dashboard</a>
            <a href="#" className="block px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition">Members</a>
            <a href="#" className="block px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition">Rewards & Points</a>
            <a href="#" className="block px-3 py-2.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-sm">Product Catalog</a>
            <a href="#" className="block px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition">POS Kasir</a>
          </nav>
        </div>
        <div className="text-[10px] text-slate-600 font-mono px-2">v0.1.0</div>
      </aside>

      {/* CONTAINER CONTENT */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="border-b border-slate-900 bg-[#090f1c]/50 backdrop-blur px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Inventory Management</span>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Katalog Operasional Produk</h1>
          </div>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold px-4 py-2 rounded-lg transition text-xs shadow-lg shadow-emerald-500/10"
          >
            <Plus size={14} strokeWidth={3} />
            Tambah Produk Baru
          </button>
        </header>

        <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* STATS BENTO */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#090f1c] border border-slate-900 rounded-xl p-4 flex items-center gap-3 shadow-md">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10"><Package size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Varian</p>
                <p className="text-lg font-black text-white">{totalItems}</p>
              </div>
            </div>
            <div className="bg-[#090f1c] border border-slate-900 rounded-xl p-4 flex items-center gap-3 shadow-md">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/10"><Layers size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Stok Fisik</p>
                <p className="text-lg font-black text-white">{totalStockFisik} Pcs</p>
              </div>
            </div>
            <div className="bg-[#090f1c] border border-slate-900 rounded-xl p-4 flex items-center gap-3 shadow-md">
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/10"><BarChart3 size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Stok Habis</p>
                <p className={`text-lg font-black ${outOfStockItems > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{outOfStockItems}</p>
              </div>
            </div>
          </section>

          {/* CATALOG DATA */}
          {products.length === 0 ? (
            <div className="border border-dashed border-slate-900 rounded-xl p-12 text-center bg-[#090f1c]/10 max-w-md mx-auto flex flex-col items-center justify-center">
              <AlertCircle className="text-slate-600 mb-2" size={28} />
              <p className="text-slate-300 font-semibold text-xs">Tabel Database Product Masih Kosong</p>
            </div>
          ) : (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => openEditModal(product)}
                  className="bg-[#090f1c] border border-slate-900 rounded-xl overflow-hidden hover:border-slate-700 hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between shadow-lg"
                >
                  <div className="relative aspect-square w-full bg-slate-950 border-b border-slate-900/40">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950 text-[10px]">
                        <Package size={20} className="mb-1" />
                        No Image
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                      {product.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-xs text-white line-clamp-1">{product.name}</h3>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {product.sku || '-'}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-900/50 flex items-center justify-between gap-1">
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Harga</p>
                        <p className="text-xs font-black text-emerald-400">Rp {Number(product.price || 0).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Stok</p>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">{product.stock || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>

      {/* BOX MODAL (TAMBAH / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#090f1c] border border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-900">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${editingProduct ? 'bg-amber-500' : 'bg-emerald-500'}`}></span> 
                {editingProduct ? 'Edit Box Produk' : 'Input Box Produk'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3 text-[11px]">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Produk</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#050911] border border-slate-800 p-2 rounded-lg text-white focus:border-emerald-500 outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">SKU Barcode</label>
                  <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full bg-[#050911] border border-slate-800 p-2 rounded-lg text-white focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kategori</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#050911] border border-slate-800 p-2 rounded-lg text-white focus:border-emerald-500 outline-none transition cursor-pointer">
                    <option value="LIQUID_FRUITY">Liquid Fruity</option>
                    <option value="LIQUID_CREAMY">Liquid Creamy</option>
                    <option value="PODS">Pods</option>
                    <option value="MOD">Mod</option>
                    <option value="CATRIDGE_COIL">Cartridge / Coil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Harga Jual (Rp)</label>
                  <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-[#050911] border border-slate-800 p-2 rounded-lg text-white focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Stok Awal / Saat Ini</label>
                  <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-[#050911] border border-slate-800 p-2 rounded-lg text-white focus:border-emerald-500 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">URL Link Gambar</label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-[#050911] border border-slate-800 p-2 rounded-lg text-white focus:border-emerald-500 outline-none transition" />
              </div>

              {/* ACTION BUTTONS PANEL */}
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-900 mt-4">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-semibold transition text-slate-300">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} className={`flex-1 py-2 rounded-lg font-bold text-slate-950 transition flex items-center justify-center gap-1 ${editingProduct ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : editingProduct ? 'Update Produk' : 'Simpan Produk'}
                  </button>
                </div>

                {/* TOMBOL DELETE (Hanya muncul pas mode Edit) */}
                {editingProduct && (
                  <button 
                    type="button" 
                    onClick={handleDeleteProduct} 
                    disabled={isDeleting}
                    className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 border border-rose-500/20"
                  >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Hapus Produk Dari Katalog
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}