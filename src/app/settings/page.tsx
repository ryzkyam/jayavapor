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
  Bell,
  ShieldCheck,
  RefreshCw,
  LucideIcon,
} from 'lucide-react';

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

  // --- DUMMY STATES ---
  const [store, setStore] = useState<StoreData>({
    name: 'Kopi Nusantara POS',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    receiptHeader: 'Selamat Datang di Kopi Nusantara!',
    receiptFooter: 'Terima kasih atas kunjungan Anda 🙏',
  });

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
    spendForPoint: 10000, // Rp 10.000 = 1 Point
    pointValue: 1000, // 1 Point = Rp 1.000
    minRedemptionPoints: 10,
  });

  const [telegram, setTelegram] = useState<TelegramData>({
    enabled: true,
    botToken: '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ',
    chatId: '-100987654321',
    notifyLowStock: true,
    notifyDailyReport: true,
  });

  const [account, setAccount] = useState<AccountData>({
    name: 'Admin Toko',
    email: 'admin@kopinusantara.id',
    role: 'Owner / Administrator',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  // --- HANDLER SIMPAN ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nanti di sini tinggal tambahkan query Supabase / API Call
    // contoh: await supabase.from('settings').upsert(...)

    showToast('Pengaturan berhasil disimpan!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- MENU ITEMS ---
  const menuItems: { id: TabType; label: string; icon: LucideIcon }[] = [
    { id: 'store', label: 'Informasi Toko', icon: Store },
    { id: 'pos', label: 'Pengaturan POS', icon: ShoppingCart },
    { id: 'membership', label: 'Membership', icon: Award },
    { id: 'telegram', label: 'Telegram CRM', icon: Send },
    { id: 'account', label: 'Akun Pengguna', icon: User },
    { id: 'system', label: 'Tentang Sistem', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-400 mt-1">Kelola preferensi toko, POS, integrasi, dan akun dalam satu tempat.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Menu */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
            
            {/* 1. INFORMASI TOKO */}
            {activeTab === 'store' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-400" /> Informasi Toko
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Detail toko ini akan dicetak pada struk transaksi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nama Toko</label>
                    <input
                      type="text"
                      value={store.name}
                      onChange={(e) => setStore({ ...store, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={store.phone}
                      onChange={(e) => setStore({ ...store, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Alamat Lengkap</label>
                  <textarea
                    rows={3}
                    value={store.address}
                    onChange={(e) => setStore({ ...store, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Pesan Header Struk</label>
                    <input
                      type="text"
                      value={store.receiptHeader}
                      onChange={(e) => setStore({ ...store, receiptHeader: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Pesan Footer Struk</label>
                    <input
                      type="text"
                      value={store.receiptFooter}
                      onChange={(e) => setStore({ ...store, receiptFooter: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
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
                    <ShoppingCart className="w-5 h-5 text-blue-400" /> Pengaturan POS
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Konfigurasi pajak, biaya layanan, dan perilaku kasir.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Pajak / PPN (%)</label>
                    <input
                      type="number"
                      value={pos.taxPercent}
                      onChange={(e) => setPos({ ...pos, taxPercent: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Service Charge (%)</label>
                    <input
                      type="number"
                      value={pos.serviceChargePercent}
                      onChange={(e) => setPos({ ...pos, serviceChargePercent: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Metode Pembayaran Utama</label>
                    <select
                      value={pos.defaultPayment}
                      onChange={(e) => setPos({ ...pos, defaultPayment: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="cash">Tunai (Cash)</option>
                      <option value="qris">QRIS</option>
                      <option value="debit">Kartu Debit/Kredit</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Batas Minimal Peringatan Stok</label>
                    <input
                      type="number"
                      value={pos.lowStockThreshold}
                      onChange={(e) => setPos({ ...pos, lowStockThreshold: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Cetak Struk Otomatis</div>
                      <div className="text-xs text-slate-400">Otomatis mencetak struk saat pembayaran dikonfirmasi.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pos.autoPrintReceipt}
                      onChange={(e) => setPos({ ...pos, autoPrintReceipt: e.target.checked })}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Notifikasi Stok Menipis</div>
                      <div className="text-xs text-slate-400">Tampilkan peringatan jika stok produk hampir habis.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pos.enableStockAlert}
                      onChange={(e) => setPos({ ...pos, enableStockAlert: e.target.checked })}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 3. MEMBERSHIP */}
            {activeTab === 'membership' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" /> Program Membership
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Atur perolehan dan penukaran poin pelanggan.</p>
                </div>

                <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Aktifkan Program Poin Loyalty</div>
                    <div className="text-xs text-slate-400">Pelanggan mengumpulkan poin dari setiap belanja.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={membership.enabled}
                    onChange={(e) => setMembership({ ...membership, enabled: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                {membership.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Belanja Minimal (Rp) = 1 Poin</label>
                      <input
                        type="number"
                        value={membership.spendForPoint}
                        onChange={(e) => setMembership({ ...membership, spendForPoint: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Nilai 1 Poin (Rp Diskon)</label>
                      <input
                        type="number"
                        value={membership.pointValue}
                        onChange={(e) => setMembership({ ...membership, pointValue: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Min. Poin Boleh Ditukar</label>
                      <input
                        type="number"
                        value={membership.minRedemptionPoints}
                        onChange={(e) => setMembership({ ...membership, minRedemptionPoints: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. TELEGRAM CRM */}
            {activeTab === 'telegram' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-400" /> Telegram CRM & Notification
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Kirim ringkasan harian dan notifikasi stok langsung ke Telegram.</p>
                </div>

                <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Integrasi Telegram Active</div>
                    <div className="text-xs text-slate-400">Hubungkan sistem POS dengan Telegram Bot API.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegram.enabled}
                    onChange={(e) => setTelegram({ ...telegram, enabled: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                {telegram.enabled && (
                  <>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Telegram Bot Token</label>
                        <input
                          type="password"
                          value={telegram.botToken}
                          onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Telegram Group / Chat ID</label>
                        <input
                          type="text"
                          value={telegram.chatId}
                          onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
                        <div>
                          <div className="text-sm font-medium text-slate-200">Kirim Peringatan Stok Tipis</div>
                          <div className="text-xs text-slate-400">Otomatis chat ke Telegram jika item melebihi threshold.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={telegram.notifyLowStock}
                          onChange={(e) => setTelegram({ ...telegram, notifyLowStock: e.target.checked })}
                          className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer">
                        <div>
                          <div className="text-sm font-medium text-slate-200">Kirim Laporan Omzet Harian</div>
                          <div className="text-xs text-slate-400">Rangkuman penjualan dikirim setiap jam tutup toko.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={telegram.notifyDailyReport}
                          onChange={(e) => setTelegram({ ...telegram, notifyDailyReport: e.target.checked })}
                          className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 5. AKUN PENGGUNA */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" /> Profil & Akun Pengguna
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Kelola informasi login dan kata sandi akun Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Nama Pengguna</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => setAccount({ ...account, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Email Login</label>
                    <input
                      type="email"
                      value={account.email}
                      onChange={(e) => setAccount({ ...account, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200">Ubah Kata Sandi</h3>
                  
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Password saat ini"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="password"
                        placeholder="Password baru"
                        value={passwords.newPass}
                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="Konfirmasi password baru"
                        value={passwords.confirmPass}
                        onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. TENTANG SISTEM */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" /> Informasi Sistem POS
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Detail versi perangkat lunak dan konektivitas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400">Versi Aplikasi</div>
                    <div className="text-lg font-bold text-slate-100 mt-1">v2.4.0-Beta</div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400">Database Status</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Connected (Supabase)
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Pembaruan Sistem</div>
                  <p className="text-xs text-slate-400">Aplikasi POS Anda menggunakan versi terbaru dengan pembaruan keamanan otomatis.</p>
                  <button
                    type="button"
                    onClick={() => showToast('Sistem sudah menggunakan versi terbaru.')}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Cek Pembaruan
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}