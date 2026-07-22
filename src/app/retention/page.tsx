"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  telegramChatId: string;
  points: number;
  tier: string;
  preference: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  customerId: string;
  createdAt: string;
  finalAmount: number;
}

interface RetentionCustomer extends Customer {
  lastTransactionDate: string | null;
  daysSinceLastActive: number;
  status: "AKTIF" | "BUTUH_PERHATIAN" | "RISIKO_CHURN";
}

export default function RetentionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchRetentionData();
  }, []);

  function triggerAlert(message: string, type: "success" | "error" = "success") {
    setAlertConfig({ show: true, message, type });
    setTimeout(() => {
      setAlertConfig((prev) => ({ ...prev, show: false }));
    }, 4000);
  }

  async function fetchRetentionData() {
    setIsLoading(true);
    try {
      // 1. Ambil semua customer (abaikan akun guest untuk analisis retention)
      const { data: customerData, error: custError } = await supabase
        .from("Customer")
        .select("*")
        .neq("id", "cust_guest_umum");
      
      if (custError) throw custError;

      // 2. Ambil semua transaksi untuk dipetakan tanggal terakhir belanjanya
      const { data: txData, error: txError } = await supabase
        .from("Transaction")
        .select("id, customerId, createdAt, finalAmount")
        .order("createdAt", { ascending: false });

      if (txError) throw txError;

      setCustomers(customerData || []);
      setTransactions(txData || []);
    } catch (error: any) {
      console.error("Gagal memuat data retention:", error);
      triggerAlert("Gagal memuat analisis data: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  // 🧠 Algoritma Pemrosesan Data Retention & Recency
  const processedData = useMemo<RetentionCustomer[]>(() => {
    const targetDate = new Date();

    return customers.map((customer) => {
      // Cari transaksi terbaru milik customer ini
      const userTxs = transactions.filter((t) => t.customerId === customer.id);
      const lastTx = userTxs[0]; // Karena sudah diorder dari yang terbaru di DB query

      let lastTransactionDate = null;
      let daysSinceLastActive = 999; // Default jika tidak pernah bertransaksi sama sekali

      if (lastTx) {
        lastTransactionDate = lastTx.createdAt;
        const txDate = new Date(lastTx.createdAt);
        const timeDiff = Math.abs(targetDate.getTime() - txDate.getTime());
        daysSinceLastActive = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      }

      // Klasifikasi status retensi pelanggan
      let status: "AKTIF" | "BUTUH_PERHATIAN" | "RISIKO_CHURN" = "AKTIF";
      if (daysSinceLastActive > 60) {
        status = "RISIKO_CHURN";
      } else if (daysSinceLastActive > 30) {
        status = "BUTUH_PERHATIAN";
      }

      return {
        ...customer,
        lastTransactionDate,
        daysSinceLastActive,
        status,
      };
    });
  }, [customers, transactions]);

  // Statistik ringkasan untuk dashboard atas
  const stats = useMemo(() => {
    const total = processedData.length;
    const aktif = processedData.filter((c) => c.status === "AKTIF").length;
    const perhatian = processedData.filter((c) => c.status === "BUTUH_PERHATIAN").length;
    const churn = processedData.filter((c) => c.status === "RISIKO_CHURN").length;

    return { total, aktif, perhatian, churn };
  }, [processedData]);

  // Filter list berdasarkan tab status yang dipilih kasir
  const filteredData = useMemo(() => {
    if (filterStatus === "ALL") return processedData;
    return processedData.filter((c) => c.status === filterStatus);
  }, [processedData, filterStatus]);

  // 🚀 Eksekusi Kirim Pesan Real ke Bot Telegram via API Route Handler
  async function handleSendRetentionPromo(customer: RetentionCustomer) {
    if (!customer.telegramChatId || customer.telegramChatId === "0" || customer.telegramChatId.trim() === "") {
      triggerAlert(`Gagal: ${customer.name} tidak mempunyai Telegram Chat ID yang valid di database.`, "error");
      return;
    }

    setProcessingId(customer.id);
    try {
      const response = await fetch("/api/telegram-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: customer.telegramChatId,
          customerName: customer.name,
          preference: customer.preference,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        triggerAlert(`Campaign Retention berhasil terkirim ke Telegram ${customer.name}!`, "success");
      } else {
        throw new Error(data.error || "Gagal mengirim blast");
      }
    } catch (err: any) {
      console.error("Gagal trigger API route telegram:", err);
      triggerAlert(`Gagal kirim: ${err.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  }

  const menus = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Members", href: "/members" },
    { label: "Rewards & Points", href: "/rewards" },
    { label: "Product Catalog", href: "/catalog" },
    { label: "POS Kasir", href: "/admin/pos" },
    { label: "Telegram Campaigns", href: "/admin/crm" },
    { label: "Retention", href: "/retention" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 font-sans antialiased relative overflow-hidden">
      
      {/* Alert Notification Toast */}
      {alertConfig.show && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full">
          <div className={`rounded-xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 ${
            alertConfig.type === "success" ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400" : "bg-rose-950/80 border-rose-500/30 text-rose-400"
          }`}>
            <div className="text-base mt-0.5">{alertConfig.type === "success" ? "✓" : "⚠️"}</div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Retention System</p>
              <p className="text-sm font-medium mt-0.5 text-slate-100">{alertConfig.message}</p>
            </div>
          </div>
        </div>
      )}

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
            {menus.map((item) => (
              <Link key={item.label} href={item.href} className={`block px-4 py-3 rounded-xl border text-[11px] uppercase tracking-widest transition-all duration-300 ${item.href === "/retention" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-100"}`}>{item.label}</Link>
            ))}
          </nav>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden rounded-xl border border-slate-800 bg-slate-900 p-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Customer Analytics</p>
              <h2 className="text-2xl md:text-3xl font-light">Retention & Churn Pelanggan</h2>
            </div>
          </div>
        </header>

        {/* 📊 STATS SUMMARY */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Teranalisis</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{stats.total} <span className="text-xs font-normal text-slate-500">Member</span></p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Aktif (&lt; 30 Hari)</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.aktif}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Butuh Perhatian (30-60 Hari)</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{stats.perhatian}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
            <p className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Risiko Churn (&gt; 60 Hari)</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{stats.churn}</p>
          </div>
        </div>

        {/* 📑 TAB FILTERS */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          {[
            { label: "Semua Member", value: "ALL" },
            { label: "Aktif", value: "AKTIF" },
            { label: "Butuh Perhatian", value: "BUTUH_PERHATIAN" },
            { label: "Risiko Tinggi (Kabur)", value: "RISIKO_CHURN" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider border font-bold transition ${
                filterStatus === tab.value
                  ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                  : "bg-transparent border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🗂️ DATA TABLE */}
        {isLoading ? (
          <div className="text-center text-slate-500 py-20 animate-pulse text-xs uppercase tracking-wider">Menghitung matriks aktivitas pelanggan...</div>
        ) : (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="p-4">Nama Pelanggan</th>
                    <th className="p-4">Tier & Preferensi</th>
                    <th className="p-4">Terakhir Belanja</th>
                    <th className="p-4">Status Retensi</th>
                    <th className="p-4 text-right">Aksi Penyelamatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-10 text-slate-600 uppercase tracking-widest text-[11px]">Tidak ada member di segmen ini</td>
                    </tr>
                  ) : (
                    filteredData.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-900/30 transition">
                        <td className="p-4">
                          <p className="font-bold text-slate-200 text-sm">{customer.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">ID: {customer.id}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-950 px-2 py-0.5 border border-slate-800 text-[10px] rounded text-slate-400 font-medium mr-1.5">{customer.tier}</span>
                          <span className="text-emerald-400 font-medium">{customer.preference}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-300">
                            {customer.lastTransactionDate ? new Date(customer.lastTransactionDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Belum Pernah"}
                          </p>
                          <p className={`text-[10px] mt-0.5 ${customer.daysSinceLastActive > 30 ? "text-rose-400/80" : "text-slate-500"}`}>
                            {customer.daysSinceLastActive === 999 ? "Tidak tercatat aktif" : `${customer.daysSinceLastActive} hari yang lalu`}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-extrabold border ${
                            customer.status === "AKTIF" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            customer.status === "BUTUH_PERHATIAN" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
                          }`}>
                            {customer.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleSendRetentionPromo(customer)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition ${
                              customer.status === "AKTIF"
                                ? "border-slate-800 text-slate-500 cursor-not-allowed bg-slate-950/20"
                                : processingId === customer.id
                                ? "border-emerald-500 text-emerald-400 bg-slate-900 animate-pulse"
                                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black shadow-md"
                            }`}
                            disabled={customer.status === "AKTIF" || processingId === customer.id}
                          >
                            {processingId === customer.id ? "⏳ Sending..." : "💬 Blast Telegram Promo"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}