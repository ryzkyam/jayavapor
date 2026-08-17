'use client';

import React, { useState } from 'react';
import {
  Store,
  ShoppingCart,
  Award,
  Send,
  User,
  Info,
  Save,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  LucideIcon,
  Plus,
  Trash2,
  Gift,
} from 'lucide-react';
import { supabase } from "@/lib/supabase";

// --- TYPES ---
type TabType = 'store' | 'pos' | 'membership' | 'telegram' | 'account' | 'system';

interface StoreData {
  name: string;
  phone: string;
  address: string;
  receiptHeader: string;
  receiptFooter: string;
}

interface PosData {
  taxPercent: number;
  serviceChargePercent: number;
  defaultPayment: string;
  autoPrintReceipt: boolean;
  enableStockAlert: boolean;
  lowStockThreshold: number;
}

interface MembershipData {
  enabled: boolean;
  spendForPoint: number;
  pointValue: number;
  minRedemptionPoints: number;
}

interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  discountAmount: number;
}

interface TelegramData {
  enabled: boolean;
  botToken: string;
  chatId: string;
  notifyLowStock: boolean;
  notifyDailyReport: boolean;
}

interface AccountData {
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('store');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- DUMMY STATES ---
  const [store, setStore] = useState<StoreData>({
    name: 'Jaya Vapor',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    receiptHeader: 'Selamat Datang di Jaya Vapor!',
    receiptFooter: 'Terima kasih atas kunjungan Anda 🙏',
  });
  React.useEffect(() => {
  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from("RewardCatalog")
      .select("*");

    if (!error && data) {
      const mappedRewards: LoyaltyReward[] = data.map((item) => {
        // Ekstrak nominal diskon dari deskripsi atau hitung
        const match = item.description?.match(/\d[\d.]*/g);
        const discountValue = match ? Number(match.join('').replace(/\./g, '')) : 0;

        return {
          id: item.id,
          name: item.title,
          pointsRequired: item.pointsRequired,
          discountAmount: discountValue,
        };
      });
      setRewards(mappedRewards);
    }
  };

  fetchRewards();
}, []);

  const [pos, setPos] = useState<PosData>({
    taxPercent: 11,
    serviceChargePercent: 5,
    defaultPayment: 'cash',
    autoPrintReceipt: true,
    enableStockAlert: true,
    lowStockThreshold: 10,
  });

  const [membership, setMembership] = useState<MembershipData>({
    enabled: true,
    spendForPoint: 10000,
    pointValue: 1000,
    minRedemptionPoints: 10,
  });

  const [rewards, setRewards] = useState<LoyaltyReward[]>([
    { id: '1', name: 'Voucher Diskon Rp 10.000', pointsRequired: 10, discountAmount: 10000 },
    { id: '2', name: 'Voucher Diskon Rp 50.000', pointsRequired: 45, discountAmount: 50000 },
  ]);

  const [newReward, setNewReward] = useState({
    name: '',
    pointsRequired: '',
    discountAmount: '',
  });

  const [telegram, setTelegram] = useState<TelegramData>({
    enabled: true,
    botToken: '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ',
    chatId: '-100987654321',
    notifyLowStock: true,
    notifyDailyReport: true,
  });

  const [account, setAccount] = useState<AccountData>({
    name: 'Admin Jaya Vapor',
    email: 'adminjayavapor@gmail.com',
    role: 'Owner / Administrator',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  // --- HANDLERS ---
  const handleAddReward = () => {
    if (!newReward.name || !newReward.pointsRequired || !newReward.discountAmount) {
      showToast('Harap isi semua kolom penukaran poin!');
      return;
    }

    const item: LoyaltyReward = {
      id: Date.now().toString(),
      name: newReward.name,
      pointsRequired: Number(newReward.pointsRequired),
      discountAmount: Number(newReward.discountAmount),
    };

    setRewards([...rewards, item]);
    setNewReward({ name: '', pointsRequired: '', discountAmount: '' });
    showToast('Katalog penukaran poin berhasil ditambahkan!');
  };

  const handleDeleteReward = async (id: string) => {
    try {
      setRewards((prev) => prev.filter((r) => r.id !== id));

      if (id && id.length > 5) {
        const { error } = await supabase
          .from("RewardCatalog")
          .delete()
          .eq("id", id);

        if (error) console.error("Gagal hapus dari Supabase:", error.message);
      }

      showToast('Katalog penukaran berhasil dihapus!');
    } catch (err: any) {
      showToast(`Gagal menghapus: ${err.message}`);
    }
  };

  // --- HANDLER SIMPAN (SINKRONISASI KE SUPABASE) ---
const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    // 1. Ambil seluruh ID yang ada di Supabase saat ini
    const { data: existingData, error: fetchError } = await supabase
      .from("RewardCatalog")
      .select("id");

    if (fetchError) throw fetchError;

    // 2. Hapus semua data lama jika ada
    if (existingData && existingData.length > 0) {
      const idsToDelete = existingData.map((item) => item.id);
      const { error: deleteError } = await supabase
        .from("RewardCatalog")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) throw deleteError;
    }

    // 3. Masukkan data terbaru dari State UI
    if (rewards.length > 0) {
      const payload = rewards.map((r) => ({
        title: r.name,
        pointsRequired: Number(r.pointsRequired),
        stock: 999,
        description: `Diskon Potongan Langsung Rp ${Number(r.discountAmount).toLocaleString("id-ID")}`
      }));

      const { error: insertError } = await supabase
        .from("RewardCatalog")
        .insert(payload);

      if (insertError) throw insertError;
    }

    showToast('Pengaturan & Katalog Hadiah berhasil disinkronkan!');
  } catch (err: any) {
    console.error("Save Error:", err);
    showToast(`Gagal menyimpan: ${err.message || 'Error tidak diketahui'}`);
  } finally {
    setIsSaving(false);
  }
};
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const menuItems: { id: TabType; label: string; icon: LucideIcon }[] = [
    { id: 'store', label: 'Informasi Toko', icon: Store },
    { id: 'pos', label: 'Pengaturan POS', icon: ShoppingCart },
    { id: 'membership', label: 'Membership', icon: Award },
    { id: 'telegram', label: 'Telegram CRM', icon: Send },
    { id: 'account', label: 'Akun Pengguna', icon: User },
    { id: 'system', label: 'Tentang Sistem', icon: Info },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#0B0F17] min-h-screen text-slate-100">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#10B981] text-white px-4 py-3 rounded-xl shadow-xl transition-all animate-bounce text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-400 text-sm mt-1">Kelola konfigurasi toko, transaksi POS, membership, dan integrasi CRM.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* TAB NAVIGATION */}
        <aside className="w-full md:w-64 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-[#161F2E] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-[#111726] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSave}>
            {/* 1. INFORMASI TOKO */}
            {activeTab === 'store' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#10B981]" /> Informasi Profil Toko
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Detail ini akan dicetak pada struk fisik transaksi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nama Toko</label>
                    <input
                      type="text"
                      value={store.name}
                      onChange={(e) => setStore({ ...store, name: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nomor Telepon</label>
                    <input
                      type="text"
                      value={store.phone}
                      onChange={(e) => setStore({ ...store, phone: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Alamat Lengkap</label>
                  <textarea
                    rows={3}
                    value={store.address}
                    onChange={(e) => setStore({ ...store, address: e.target.value })}
                    className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Pesan Header Struk</label>
                    <input
                      type="text"
                      value={store.receiptHeader}
                      onChange={(e) => setStore({ ...store, receiptHeader: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Pesan Footer Struk</label>
                    <input
                      type="text"
                      value={store.receiptFooter}
                      onChange={(e) => setStore({ ...store, receiptFooter: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PENGATURAN POS */}
            {activeTab === 'pos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#10B981]" /> Parameter Kasir & Pajak
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Atur persentase kalkulasi checkout dan sistem peringatan stok.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Pajak (PB1 / PPN %)</label>
                    <input
                      type="number"
                      value={pos.taxPercent}
                      onChange={(e) => setPos({ ...pos, taxPercent: Number(e.target.value) })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Service Charge (%)</label>
                    <input
                      type="number"
                      value={pos.serviceChargePercent}
                      onChange={(e) => setPos({ ...pos, serviceChargePercent: Number(e.target.value) })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Batas Alert Stok Menipis</label>
                  <input
                    type="number"
                    value={pos.lowStockThreshold}
                    onChange={(e) => setPos({ ...pos, lowStockThreshold: Number(e.target.value) })}
                    className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>
            )}

            {/* 3. MEMBERSHIP & LOYALTY */}
            {activeTab === 'membership' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#10B981]" /> Program Poin & Loyalty
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Konfigurasi rasio perolehan poin belanja pelanggan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Kelipatan Belanja Untuk 1 Poin (Rp)</label>
                    <input
                      type="number"
                      value={membership.spendForPoint}
                      onChange={(e) => setMembership({ ...membership, spendForPoint: Number(e.target.value) })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nilai Tukar Per Poin (Rp)</label>
                    <input
                      type="number"
                      value={membership.pointValue}
                      onChange={(e) => setMembership({ ...membership, pointValue: Number(e.target.value) })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                {/* KATALOG REWARD */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#10B981]" /> Katalog Penukaran Poin
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#070913] p-4 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      placeholder="Nama Hadiah/Voucher"
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      className="bg-[#111726] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                    />
                    <input
                      type="number"
                      placeholder="Poin Dibutuhkan"
                      value={newReward.pointsRequired}
                      onChange={(e) => setNewReward({ ...newReward, pointsRequired: e.target.value })}
                      className="bg-[#111726] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Nominal Diskon (Rp)"
                        value={newReward.discountAmount}
                        onChange={(e) => setNewReward({ ...newReward, discountAmount: e.target.value })}
                        className="w-full bg-[#111726] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                      />
                      <button
                        type="button"
                        onClick={handleAddReward}
                        className="bg-[#10B981] hover:bg-[#059669] text-white p-2 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {rewards.map((rw) => (
                      <div key={rw.id} className="flex items-center justify-between p-3 bg-[#070913] border border-slate-800/60 rounded-xl text-xs">
                        <div>
                          <p className="font-semibold text-white">{rw.name}</p>
                          <p className="text-slate-400">{rw.pointsRequired} Poin = Diskon Rp {rw.discountAmount.toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(rw.id)}
                          className="text-rose-400 hover:text-rose-300 p-1.5 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. TELEGRAM CRM */}
            {activeTab === 'telegram' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#10B981]" /> Integrasi Telegram Bot
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Kirim laporan harian dan alert stok otomatis ke grup Telegram.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Bot Token</label>
                    <input
                      type="text"
                      value={telegram.botToken}
                      onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Chat ID / Group ID</label>
                    <input
                      type="text"
                      value={telegram.chatId}
                      onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. AKUN PENGGUNA */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[#10B981]" /> Profil Pengguna & Keamanan
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Perbarui informasi kredensial login Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nama Lengkap</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => setAccount({ ...account, name: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Email Login</label>
                    <input
                      type="email"
                      value={account.email}
                      onChange={(e) => setAccount({ ...account, email: e.target.value })}
                      className="w-full bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Ubah Kata Sandi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="password"
                      placeholder="Password Lama"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                    <input
                      type="password"
                      placeholder="Password Baru"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className="bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                    <input
                      type="password"
                      placeholder="Konfirmasi Password Baru"
                      value={passwords.confirmPass}
                      onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                      className="bg-[#070913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. TENTANG SISTEM */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#10B981]" /> Tentang Sistem POS
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Informasi versi dan lisensi aplikasi.</p>
                </div>

                <div className="p-4 bg-[#070913] rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p><span className="font-semibold text-white">Versi Aplikasi:</span> v1.0.0</p>
                  <p><span className="font-semibold text-white">Status Server:</span> Supabase Cloud Connected</p>
                </div>
              </div>
            )}

            {/* SUBMIT ACTION BUTTON */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}