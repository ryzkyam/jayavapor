"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

interface CustomerMember {
  id: string;
  name: string;
  telegramChatId: string | null;
  points: number;
  tier: string | null;
  preference: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RewardItem {
  id: string;
  title: string;
  pointsRequired: number;
  stock: number;
  description: string;
}

export default function RewardsPage() {
  const [members, setMembers] = useState<CustomerMember[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]); // ⚡ Dikosongkan agar murni ambil dari DB Supabase
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchMember, setSearchMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [pointsToAdd, setPointsToAdd] = useState<number | "">("");

  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ⚡ FETCH KEDUA TABEL SEKALIGUS (Customer & RewardCatalog)
async function fetchInitialData() {
  setIsLoading(true);
  try {
    // 1. Fetch Customer dan RewardCatalog dari Supabase
    const [customerRes, rewardRes] = await Promise.all([
      supabase.from("Customer").select("*").order("name", { ascending: true }),
      supabase.from("RewardCatalog").select("*")
    ]);

    if (customerRes.error) console.error("Customer Fetch Error:", customerRes.error);
    setMembers(customerRes.data || []);

    let rewardItems: RewardItem[] = [];

    // 2. Jika ada data dari Supabase tabel RewardCatalog
    if (rewardRes.data && rewardRes.data.length > 0) {
      rewardItems = rewardRes.data.map((item: any) => ({
        id: item.id || String(Math.random()),
        title: item.title || item.name || "Voucher Diskon",
        pointsRequired: Number(item.pointsRequired ?? item.points_required ?? item.points ?? 0),
        stock: item.stock ?? item.stok ?? 999, // Fallback ke 999 jika setting diskon tidak pakai stok
        description: item.description || `Diskon Rp ${(item.discountValue || item.discount_value || 0).toLocaleString("id-ID")}`
      }));
    } else {
      // 3. FALLBACK: Jika Setting menyimpan ke LocalStorage
      const localData = localStorage.getItem("reward_catalog") || localStorage.getItem("membership_rewards");
      if (localData) {
        const parsed = JSON.parse(localData);
        rewardItems = parsed.map((item: any, idx: number) => ({
          id: item.id || `local_${idx}`,
          title: item.title || item.name || item.namaReward || "Voucher Diskon",
          pointsRequired: Number(item.pointsRequired || item.points || item.jumlahPoin || 0),
          stock: item.stock ?? 999,
          description: item.description || (item.discountValue ? `Diskon Rp ${Number(item.discountValue).toLocaleString("id-ID")}` : "Voucher Penukaran Poin")
        }));
      }
    }

    setRewards(rewardItems);
  } catch (err: any) {
    console.error("Fetch Data Error:", err);
    triggerAlert(`Gagal memuat data: ${err.message || 'Error tidak diketahui'}`, "error");
  } finally {
    setIsLoading(false);
  }
}

  function triggerAlert(message: string, type: "success" | "error" = "success") {
    setAlertConfig({ show: true, message, type });
    setTimeout(() => {
      setAlertConfig((prev) => ({ ...prev, show: false }));
    }, 3000);
  }

  const currentSelectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  const filteredMembersDropdown = useMemo(() => {
    if (!searchMember) return members;
    return members.filter((m) => m.name.toLowerCase().includes(searchMember.toLowerCase()));
  }, [members, searchMember]);

  // FUNGSI MANIPULASI/SUNTIK POIN MANUAL
 

  // ⚡ FUNGSI REDEEM REWARD (DENGAN SINKRONISASI STOK KE DATABASE SUPABASE)
  async function handleRedeemReward(reward: RewardItem) {
    if (!selectedMemberId || !currentSelectedMember) return triggerAlert("Pilih member terlebih dahulu!", "error");
    if (currentSelectedMember.points < reward.pointsRequired) return triggerAlert("Poin tidak cukup!", "error");
    if (reward.stock <= 0) return triggerAlert("Stok habis!", "error");

    const konfirmasi = confirm(`Tukarkan ${reward.pointsRequired} Pts milik "${currentSelectedMember.name}" dengan "${reward.title}"?`);
    if (!konfirmasi) return;

    setIsProcessing(true);
    try {
      const sisaPoinBaru = currentSelectedMember.points - reward.pointsRequired;
      const sisaStokBaru = reward.stock - 1;

      // 1. Potong Poin Customer
      const { error: customerError } = await supabase
        .from("Customer")
        .update({ points: sisaPoinBaru, updatedAt: new Date().toISOString() })
        .eq("id", selectedMemberId);

      if (customerError) throw customerError;

      // 2. Potong Stok Hadiah di RewardCatalog Supabase
      const { error: rewardError } = await supabase
        .from("RewardCatalog")
        .update({ stock: sisaStokBaru })
        .eq("id", reward.id);

      if (rewardError) throw rewardError;

      // 3. Catat Riwayat ke PointLog
      const generatedLogId = "log_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      await supabase
        .from("PointLog")
        .insert([
          {
            id: generatedLogId,
            customerId: selectedMemberId,
            transactionId: null,
            points: -reward.pointsRequired,
            action: "REDEEM",
            description: `Penukaran reward: ${reward.title}`,
          }
        ]);

      triggerAlert(`Berhasil menukarkan ${reward.title}!`, "success");
      fetchInitialData(); // Refresh UI secara utuh
    } catch (err: any) {
      console.error(err);
      triggerAlert(`Gagal memproses penukaran: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 p-6 md:p-10 relative">
      
      {/* CUSTOM TOP ALERT BANNER */}
      {alertConfig.show && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full animate-slide-in">
          <div className={`rounded-xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 ${
            alertConfig.type === "success" ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400" : "bg-rose-950/80 border-rose-500/30 text-rose-400"
          }`}>
            <div className="text-base mt-0.5">{alertConfig.type === "success" ? "✓" : "⚠️"}</div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Loyalty Notification</p>
              <p className="text-sm font-medium mt-0.5 text-slate-100">{alertConfig.message}</p>
            </div>
            <button onClick={() => setAlertConfig((prev) => ({ ...prev, show: false }))} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">CRM Gamification</p>
          <h1 className="text-3xl font-light">Rewards & Loyalty Points</h1>
        </div>
        <button 
          onClick={fetchInitialData}
          disabled={isLoading}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition"
        >
          {isLoading ? "Refreshing..." : "🔄 Sync Data"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* PANEL UTAMA: PANEL KASIR */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <span>🛒</span> Panel Manajemen Kasir
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Cari & Pilih Member</label>
                <input
                  type="text"
                  placeholder="Ketik nama untuk memfilter..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500 mb-2 placeholder:text-slate-600"
                />
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    setPointsToAdd("");
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Klik untuk Pilih Member --</option>
                  {filteredMembersDropdown.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.points || 0} Pts)
                    </option>
                  ))}
                </select>
              </div>

              {currentSelectedMember ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5 mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Active Customer Profile</p>
                  <h3 className="text-xl font-semibold text-slate-100 truncate">{currentSelectedMember.name}</h3>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Tier Level</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        {currentSelectedMember.tier || "REGULAR"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase">Total Saldo Poin</p>
                      <p className="text-2xl font-black text-emerald-400">
                        {currentSelectedMember.points || 0} <span className="text-xs font-normal text-slate-400">Pts</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                  Silakan pilih member di atas untuk mengaktifkan aksi manipulasi poin.
                </div>
              )}
            </div>
          </div>

          {/* FORM SUNTIK POIN MANUAL */}
     
        </div>

        {/* KATALOG HADIAH */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <span>🎁</span> Katalog Penukaran Hadiah
          </h2>

          {isLoading ? (
            <div className="text-center text-slate-500 py-20 animate-pulse text-sm tracking-wider">
              MEMUAT KATALOG HADIAH...
            </div>
          ) : rewards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center text-slate-500 text-sm">
              Belum ada item hadiah yang ditambahkan. Silakan tambahkan lewat Halaman Setting.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const isPointsInadequate = currentSelectedMember ? currentSelectedMember.points < reward.pointsRequired : false;
                const isOutOfStock = reward.stock <= 0;

                return (
                  <div
                    key={reward.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition duration-300 ${
                      isOutOfStock ? "border-slate-900 bg-slate-950/40 opacity-50" : "border-slate-800 bg-slate-900/40 hover:border-emerald-500/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base text-slate-100 leading-snug">
                          {reward.title}
                        </h3>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                          {reward.pointsRequired} Pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {reward.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-auto">
                      <span className="text-xs text-slate-500">
                        Stok: <span className={reward.stock > 0 ? "text-slate-300" : "text-rose-500 font-bold"}>{reward.stock} Pcs</span>
                      </span>

                      <button
                        disabled={isProcessing || !selectedMemberId || isPointsInadequate || isOutOfStock}
                        onClick={() => handleRedeemReward(reward)}
                        className={`text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition ${
                          !selectedMemberId ? "bg-slate-800 text-slate-500 cursor-not-allowed" : isPointsInadequate ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-not-allowed" : isOutOfStock ? "bg-slate-950 text-slate-600 cursor-not-allowed" : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg"
                        }`}
                      >
                        {!selectedMemberId ? "Pilih Member" : isOutOfStock ? "Out of Stock" : isPointsInadequate ? "Poin Kurang" : "Tukarkan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}