"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // ➕ DITAMBAHKAN UNTUK ROUTING LOGOUT
import Link from "next/link";

interface Product {
  id: string | number;
  name: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CustomerMember {
  id: string;
  name: string;
  points: number;
  telegramChatId?: string;
  tier?: string;
  preference?: string;
}

export default function POSPage() {
  const router = useRouter(); // ➕ DITAMBAHKAN UNTUK ROUTING LOGOUT

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [customers, setCustomers] = useState<CustomerMember[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(""); 
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);

  const POINT_RATIO = 10000;

  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  function triggerAlert(message: string, type: "success" | "error" = "success") {
    setAlertConfig({ show: true, message, type });
    setTimeout(() => {
      setAlertConfig((prev) => ({ ...prev, show: false }));
    }, 4000);
  }

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("product").select("*");
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Supabase error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from("Customer")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Gagal mengambil data member:", error);
    }
  }

  // Ambil data detail customer yang sedang dipilih di dropdown
  const selectedCustomerDetail = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Cek apakah beneran member asli (bukan Kosong & bukan data Guest Umum)
  const isMemberAsli = useMemo(() => {
    if (!selectedCustomerId) return false;
    if (selectedCustomerId === "cust_guest_umum") return false;
    if (selectedCustomerDetail?.name?.toLowerCase() === "guest") return false;
    return true;
  }, [selectedCustomerId, selectedCustomerDetail]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    const currentStock = product.stock ?? 999;
    setCart((prev) => {
      const existing = prev.find((item: CartItem) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= currentStock) {
          triggerAlert(`Stok untuk ${product.name} sudah mencapai batas maksimum!`, "error");
          return prev;
        }
        return prev.map((item: CartItem) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (currentStock <= 0) {
        triggerAlert(`Stok ${product.name} habis!`, "error");
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string | number, amount: number) => {
    const targetProduct = products.find((p) => p.id === id);
    const maxStock = targetProduct?.stock ?? 999;

    setCart((prev) => {
      return prev
        .map((item: CartItem) => {
          if (item.id === id) {
            const nextQty = item.quantity + amount;
            if (nextQty > maxStock) {
              triggerAlert(`Stok hanya tersedia ${maxStock} pcs`, "error");
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item: CartItem) => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((item: CartItem) => item.id !== id));
  };

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  }, [cart]);

  // Hitung potensi poin berjalan (Hanya kalkulasi jika yang dipilih adalah member asli)
  const pointsEarned = useMemo(() => {
    if (!isMemberAsli) return 0;
    return Math.floor(totalPrice / POINT_RATIO);
  }, [totalPrice, isMemberAsli]);

  async function handleCheckout() {
    if (cart.length === 0) return;
    
    setIsCheckoutProcessing(true);
    try {
      let finalCustomerId = selectedCustomerId;

      // Logika Penentuan ID Customer untuk Non-Member / Guest
      if (!finalCustomerId) {
        const guestUser = customers.find((c) => c.name.toLowerCase() === "guest");
        if (guestUser) {
          finalCustomerId = guestUser.id;
        } else {
          finalCustomerId = "cust_guest_umum"; 
        }
      }

      // Validasi Stok Sebelum Tembus ke DB
      for (const item of cart as CartItem[]) {
        const dbProduct = products.find((p) => p.id === item.id);
        if (dbProduct && dbProduct.stock !== undefined && dbProduct.stock < item.quantity) {
          throw new Error(`Stok produk "${item.name}" tidak mencukupi (Sisa: ${dbProduct.stock})`);
        }
      }

      const generatedTransactionId = "tx_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      
      // KUNCI POIN MUTLAK: Jika member asli dapet poin, jika non-member/guest dipaksa 0!
      const finalPointsPayload = isMemberAsli ? pointsEarned : 0;

      // 1. Insert ke tabel Transaction
      const { error: txError } = await supabase.from("Transaction").insert([
        {
          id: generatedTransactionId,
          customerId: finalCustomerId, 
          totalAmount: totalPrice,
          discount: 0,                 
          finalAmount: totalPrice,      
          pointsEarned: finalPointsPayload
        },
      ]);

      if (txError) throw txError;

      // 2. Insert ke tabel TransactionItem
      const transactionItemsPayload = cart.map((item: CartItem) => ({
        id: "txi_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        transactionId: generatedTransactionId,
        productId: item.id,
        quantity: item.quantity,
        priceAtSale: item.price,         
        totalPrice: item.price * item.quantity   
      }));

      const { error: itemsError } = await supabase.from("TransactionItem").insert(transactionItemsPayload);
      if (itemsError) throw itemsError;

      // 3. Potong Stok Produk di Database
      for (const item of cart as CartItem[]) {
        const currentProd = products.find((p) => p.id === item.id);
        if (currentProd && currentProd.stock !== undefined) {
          const sisaStokBaru = Math.max(0, currentProd.stock - item.quantity);
          await supabase.from("product").update({ stock: sisaStokBaru }).eq("id", item.id);
        }
      }

      // 4. Tambah Saldo Poin & Catat Log (HANYA JIKA MEMBER ASLI)
      if (isMemberAsli && finalPointsPayload > 0) {
        if (selectedCustomerDetail) {
          const totalPointsBaru = (selectedCustomerDetail.points || 0) + finalPointsPayload;

          await supabase
            .from("Customer")
            .update({ points: totalPointsBaru, updatedAt: new Date().toISOString() })
            .eq("id", selectedCustomerId);

          const generatedLogId = "log_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
          await supabase.from("PointLog").insert([
            {
              id: generatedLogId,
              customerId: selectedCustomerId,
              transactionId: generatedTransactionId,
              points: finalPointsPayload,
              action: "EARNED",     
              description: `Mendapatkan poin dari transaksi POS kasir #${generatedTransactionId}`,
              createdAt: new Date().toISOString()
            },
          ]);
        }
      }

      triggerAlert(
        `Transaksi Sukses! Total: Rp ${totalPrice.toLocaleString("id-ID")} ${
          isMemberAsli ? `| Member mendapatkan +${finalPointsPayload} Pts!` : ""
        }`,
        "success"
      );

      // Reset State Kasir Ke Semula
      setCart([]);
      setSelectedCustomerId("");
      await fetchCustomers(); 
      await fetchProducts();  

    } catch (err: any) {
      console.error("Checkout gagal:", err);
      triggerAlert(`Gagal memproses transaksi: ${err.message || err}`, "error");
    } finally {
      setIsCheckoutProcessing(false);
    } 
  }

  // ➕ HANDLER BARU: LOGOUT
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.clear();
      router.push("/admin/login");
    } catch (err: any) {
      console.error("Gagal logout:", err.message);
    }
  };

  const menus = [
    { label: "Tambah Produk", href: "/dashboard" },
    { label: "Members", href: "/members" },
    { label: "Rewards & Points", href: "/rewards" },
    { label: "Product Catalog", href: "/catalog" },
    { label: "POS Kasir", href: "/admin/pos" },
    { label: "Telegram Campaigns", href: "/admin/crm" },
    { label: "Riwatat Transaksi", href: "/admin/transactions" },
    { label: "Retention", href: "/retention" },
    { label: "Settings", href: "/settings" },
    { label: "Logout", action: handleLogout }, // ➕ DIUBAH AGAR MEMANGGIL HANDLER LOGOUT
  ];
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 font-sans antialiased relative">
      
      {/* Custom Alert Toast Notification */}
      {alertConfig.show && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full">
          <div className={`rounded-xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 ${
            alertConfig.type === "success" ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400" : "bg-rose-950/80 border-rose-500/30 text-rose-400"
          }`}>
            <div className="text-base mt-0.5">{alertConfig.type === "success" ? "✓" : "⚠️"}</div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Kasir System</p>
              <p className="text-sm font-medium mt-0.5 text-slate-100">{alertConfig.message}</p>
            </div>
            <button onClick={() => setAlertConfig((prev) => ({ ...prev, show: false }))} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
  {/* Sidebar Navigation */}
<aside className={`fixed lg:relative z-50 w-72 h-full bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col justify-between transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
  <div>
    <div className="flex items-center gap-3 mb-12 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">⚡</div>
      <div>
        <h1 className="text-sm font-semibold tracking-[0.2em] uppercase">Jaya Vapor</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">CRM & POS System</p>
      </div>
    </div>
    <nav className="space-y-2">
      {menus.map((item) => {
        // Jika item memiliki action (seperti Logout), render sebagai <button>
        if (item.action) {
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full text-left px-4 py-3 rounded-xl border border-transparent text-[11px] uppercase tracking-widest text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer"
            >
              {item.label}
            </button>
          );
        }

        // Jika item navigasi biasa, render sebagai <Link>
        return (
          <Link
            key={item.label}
            href={item.href || "#"}
            className={`block px-4 py-3 rounded-xl border text-[11px] uppercase tracking-widest transition-all duration-300 ${
              item.href === "/admin/pos"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  </div>
</aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Catalog Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-[40vh] lg:pb-10">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden rounded-xl border border-slate-800 bg-slate-900 p-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Point of Sales</p>
              <h2 className="text-2xl md:text-3xl font-light">Kasir Jaya Vapor</h2>
            </div>
          </div>
          <input type="text" placeholder="Cari produk..." className="w-40 md:w-72 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm outline-none focus:border-emerald-500 placeholder:text-slate-600" onChange={(e) => setSearchQuery(e.target.value)} />
        </header>

        {isLoading ? (
          <div className="text-center text-slate-500 py-20 animate-pulse text-xs uppercase tracking-wider">Memuat produk dari database...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => addToCart(p)} className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/50 p-4 hover:border-emerald-500/30 transition-all group relative">
                <div className="absolute top-6 right-6 z-10 bg-slate-950/80 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md font-medium text-slate-400">Stok: {p.stock !== undefined ? p.stock : "∞"}</div>
                <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-slate-950">
                  <img src={p.imageUrl || "https://placehold.co/400x400/0f172a/64748b?text=No+Image"} alt={p.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400/0f172a/64748b?text=No+Image"; }} />
                </div>
                <h3 className="text-sm font-semibold truncate text-slate-200">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.category?.replace("_", " ") || "Umum"}</p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-emerald-400 font-bold text-sm">Rp {Number(p.price || 0).toLocaleString("id-ID")}</p>
                  <span className="text-[10px] uppercase text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800/80 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition">+ Add</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart & Checkout Area */}
      <aside className="fixed bottom-0 left-0 right-0 h-[42vh] lg:h-full border-t border-slate-800 bg-slate-950/95 p-4 lg:relative lg:w-96 lg:border-t-0 lg:border-l lg:p-8 z-40 flex flex-col justify-between">
        <div className="flex flex-col h-full overflow-hidden">
          
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs uppercase text-slate-400 tracking-wider">Current Order</h3>
            <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">{totalItems} Items</span>
          </div>

          {/* DROPDOWN PILIH MEMBER */}
          <div className="mb-4 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">👤 Profil Pelanggan / Member</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Non-Member (Guest / Umum) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.name.toLowerCase() === 'guest' ? '(Umum)' : `(Saldo: ${c.points || 0} Pts)`}</option>
              ))}
            </select>

            {/* DYNAMIC CARD LOG-DETAIL MEMBER (Hanya muncul jika item terpilih) */}
            {selectedCustomerDetail && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 relative animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 truncate max-w-[150px]">{selectedCustomerDetail.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Telegram ID: {selectedCustomerDetail.telegramChatId || "-"}</p>
                    <p className="text-[10px] text-slate-500">Preferensi: <span className="text-emerald-500 font-medium">{selectedCustomerDetail.preference || "UMUM"}</span></p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">{selectedCustomerDetail.tier || "BRONZE"}</span>
                </div>
                
                <div className="border-t border-slate-800/60 my-2 pt-2 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Loyalty Points</p>
                    <p className="text-lg font-black text-emerald-400">
                      {/* Poin berjalan dikunci mati ke 0 jika yang aktif di detail berstatus non-member asli */}
                      {isMemberAsli ? pointsEarned : 0} <span className="text-xs font-normal text-slate-400">Pts</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 hover:text-white cursor-pointer transition">Detail Member →</span>
                </div>
              </div>
            )}

            {/* Hint Poin Berjalan (Hanya kelap-kelip jika benar-benar member resmi) */}
            {isMemberAsli && pointsEarned > 0 && (
              <p className="text-[10px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1 animate-pulse">
                <span>✨</span> Transaksi ini menghasilkan +{pointsEarned} Pts Loyalty!
              </p>
            )}
          </div>

          {/* List Items in Cart */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3">
            {cart.length === 0 ? (
              <p className="text-center text-slate-600 text-xs py-8">Belum ada produk dipilih</p>
            ) : (
              cart.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between items-center border border-slate-800/60 p-2.5 rounded-xl bg-slate-900/20">
                  <div className="max-w-[140px] truncate">
                    <p className="text-xs truncate font-medium text-slate-200">{item.name}</p>
                    <p className="text-[11px] text-slate-500">Rp {Number(item.price * item.quantity).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-900 transition">-</button>
                      <span className="text-[11px] px-1 text-slate-300 min-w-[12px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-900 transition">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-slate-600 hover:text-rose-500 p-1 transition">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer Total */}
          <div className="border-t border-slate-800/80 pt-3 bg-slate-950">
            <div className="flex justify-between mb-3 items-center">
              <span className="text-xs text-slate-400">Total Tagihan</span>
              <span className="font-bold text-lg text-emerald-400">Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
            <button 
              disabled={cart.length === 0 || isCheckoutProcessing}
              onClick={handleCheckout}
              className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/5"
            >
              {isCheckoutProcessing ? "Memproses Transaksi..." : "Proses Pembayaran"}
            </button>
          </div>

        </div>
      </aside>
    </div>
  );
}