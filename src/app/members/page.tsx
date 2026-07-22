"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface CustomerMember {
  id: string;
  name: string;
  telegramChatId?: string;
  points?: number;
  tier?: string;
  preference?: string;
  createdAt?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<CustomerMember[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form input member baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTelegramId, setNewTelegramId] = useState("");
  const [newRegion, setNewRegion] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🛠️ STATE BARU UNTUK CUSTOM NOTIFIKASI ALERT
  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // 🛠️ STATE BARU UNTUK CUSTOM DELETE CONFIRMATION MODAL
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    show: boolean;
    memberId: string;
    memberName: string;
  }>({ show: false, memberId: "", memberName: "" });

  useEffect(() => {
    fetchMembers();
  }, []);

  // Fungsi helper untuk panggil custom alert
  function triggerAlert(message: string, type: "success" | "error" = "success") {
    setAlertConfig({ show: true, message, type });
    // Auto close dalam 3 detik
    setTimeout(() => {
      setAlertConfig((prev) => ({ ...prev, show: false }));
    }, 3000);
  }

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("Customer").select("*");
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Fungsi untuk submit data member baru
  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return triggerAlert("Nama member wajib diisi!", "error");

    setIsSubmitting(true);
    try {
      const generatedId = "cust_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

      const { data, error } = await supabase
        .from("Customer")
        .insert([
          {
            id: generatedId,
            name: newName,
            telegramChatId: newTelegramId || null,
            preference: newRegion || null, 
            points: 0,
          },
        ])
        .select();

      if (error) {
        console.error("Detail Error Supabase:", error);
        triggerAlert(`Gagal: ${error.message}`, "error");
        return;
      }

      // 🎉 PAKAI CUSTOM ALERT
      triggerAlert("Member baru berhasil ditambahkan!", "success");
      
      setNewName("");
      setNewTelegramId("");
      setNewRegion("");
      setIsModalOpen(false);

      fetchMembers();
    } catch (err: any) {
      console.error("Gagal menambah member:", err);
      triggerAlert("Terjadi kesalahan sistem.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Trigger modal hapus custom
  function askDeleteMember(id: string, name: string) {
    setDeleteModalConfig({ show: true, memberId: id, memberName: name });
  }

  // Fungsi eksekusi hapus setelah dikonfirmasi di modal custom
  async function confirmDeleteMember() {
    const { memberId, memberName } = deleteModalConfig;
    setDeleteModalConfig((prev) => ({ ...prev, show: false }));

    try {
      const { error } = await supabase
        .from("Customer")
        .delete()
        .eq("id", memberId);

      if (error) {
        triggerAlert(`Gagal menghapus member: ${error.message}`, "error");
        return;
      }

      // 🎉 PAKAI CUSTOM ALERT
      triggerAlert(`Member "${memberName}" berhasil dihapus!`, "success");
      fetchMembers();
    } catch (err: any) {
      console.error("Error delete:", err);
      triggerAlert("Terjadi kesalahan sistem saat menghapus.", "error");
    }
  }

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 p-6 md:p-10 relative">

      {/* ================= 🛠️ CUSTOM TOP ALERT BANNER ================= */}
      {alertConfig.show && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full animate-slide-in">
          <div className={`rounded-xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 ${
            alertConfig.type === "success" 
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-950/80 border-rose-500/30 text-rose-400"
          }`}>
            <div className="text-base mt-0.5">{alertConfig.type === "success" ? "✓" : "⚠️"}</div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Notification</p>
              <p className="text-sm font-medium mt-0.5 text-slate-100">{alertConfig.message}</p>
            </div>
            <button 
              onClick={() => setAlertConfig((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            CRM System
          </p>
          <h1 className="text-3xl font-light">Members (Customers)</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari nama member..."
            className="w-full md:w-72 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-emerald-500 placeholder:text-slate-500"
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-emerald-500 text-black px-5 py-3 text-sm font-semibold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 whitespace-nowrap"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
          <p className="text-xs text-slate-500">Total Members</p>
          <h2 className="text-2xl font-bold text-emerald-400">{members.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
          <p className="text-xs text-slate-500">Active Today</p>
          <h2 className="text-2xl font-bold text-slate-100">{Math.floor(members.length * 0.3)}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
          <p className="text-xs text-slate-500">VIP Members</p>
          <h2 className="text-2xl font-bold text-emerald-400">
            {members.filter((m) => m.tier?.toUpperCase() === "VIP").length}
          </h2>
        </div>
      </div>

      {/* GRID LIST MEMBER */}
      {isLoading ? (
        <div className="text-center text-slate-500 py-20 animate-pulse text-sm tracking-wider">
          MEMUAT DATA MEMBER DARI DATABASE...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.length === 0 ? (
            <div className="text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl p-8 text-center col-span-full">
              Tidak ada member yang cocok dengan pencarian
            </div>
          ) : (
            filteredMembers.map((m) => (
              <div
                key={m.id}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-emerald-500/30 transition duration-300"
              >
                {/* TOMBOL HAPUS (✕) */}
                <button
                  onClick={() => askDeleteMember(m.id, m.name)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 transition-colors p-1 text-xs"
                  title="Hapus Member"
                >
                  ✕
                </button>

                <div className="flex items-center justify-between mb-4 pr-6">
                  <h3 className="font-semibold text-lg truncate max-w-[150px] text-slate-100">
                    {m.name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/10 uppercase">
                    {m.tier || "REGULAR"}
                  </span>
                </div>

                <div className="space-y-1.5 mb-5">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-500">🔹 Telegram ID:</span> 
                    <span className="font-mono text-slate-300">{m.telegramChatId || "-"}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-500">🔹 Preferensi:</span> 
                    <span className="text-emerald-400 font-medium uppercase text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{m.preference || "-"}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Loyalty Points</p>
                    <p className="text-emerald-400 font-bold text-base">
                      {m.points || 0} <span className="text-xs font-normal text-slate-500">Pts</span>
                    </p>
                  </div>
                  <Link
                    href={`/member/${m.id}`}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-all"
                  >
                    Detail Member →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= MODAL POP-UP ADD MEMBER ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-3">
              <h2 className="text-xl font-semibold text-slate-50">Registrasi Member Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">ID Telegram</label>
                <input
                  type="text"
                  placeholder="Contoh: 6281234567"
                  value={newTelegramId}
                  onChange={(e) => setNewTelegramId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Preferensi Rasa Liquid</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Preferensi --</option>
                  <option value="FRUITY">FRUITY</option>
                  <option value="CREAMY">CREAMY</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 text-black px-5 py-3 text-xs uppercase tracking-wider font-bold hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🛠️ CUSTOM MODAL POP-UP CONFIRM HAPUS MEMBER ================= */}
      {deleteModalConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/20 bg-slate-950 p-6 shadow-2xl text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl font-bold mx-auto mb-4 border border-rose-500/20">
              ⚠️
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Hapus Member?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Apakah lo beneran yakin mau menghapus member <span className="text-rose-400 font-semibold">"{deleteModalConfig.memberName}"</span>? Tindakan ini permanen.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteModalConfig((prev) => ({ ...prev, show: false }))}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="flex-1 rounded-xl bg-rose-500 text-white px-4 py-3 text-xs uppercase tracking-wider font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-500/10"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}