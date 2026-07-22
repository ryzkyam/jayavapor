"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface Transaction {
  id: string;
  customerId: string | null;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  pointsEarned: number;
  createdAt: string;
  // 🛠️ FIX: Kembalikan ke 'Customer' Kapital dan gunakan format Object tunggal (bukan array [])
  Customer: {
    name: string;
  } | null;
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  async function fetchTransactionHistory() {
    setLoading(true);
    try {
      // 🛠️ FIX: Gunakan 'Customer ( name )' dengan C kapital agar relasi di database match
      const { data, error } = await supabase
        .from("Transaction")
        .select(`
          id,
          customerId,
          totalAmount,
          discount,
          finalAmount,
          pointsEarned,
          createdAt,
          Customer ( name )
        `)
        .order("createdAt", { ascending: false }); // Transaksi terbaru di atas

      if (error) throw error;
      
      // Paksa casting data ke type Transaction[] agar TypeScript tenang
      setTransactions((data as unknown as Transaction[]) || []);
    } catch (err) {
      console.error("Gagal mengambil riwayat transaksi:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter pencarian berdasarkan ID Transaksi atau Nama Member
  const filteredTransactions = transactions.filter((tx) => {
    const txIdMatch = tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 🛠️ FIX: Akses langsung ke tx.Customer.name karena sekarang sudah berupa Object tunggal
    const customerName = tx.Customer ? tx.Customer.name : "";
    const customerNameMatch = customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return txIdMatch || customerNameMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Riwayat Transaksi</h1>
          <p className="text-gray-400 text-sm">Daftar seluruh transaksi penjualan kasir</p>
        </div>
        
        {/* Input Pencarian */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Cari ID transaksi / nama member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat data transaksi...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-gray-800 rounded-xl border border-gray-700">
          Tidak ada riwayat transaksi yang ditemukan.
        </div>
      ) : (
        /* Tabel Riwayat */
        <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900 text-gray-300 text-sm font-semibold">
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">ID Transaksi</th>
                <th className="p-4">Pelanggan / Member</th>
                <th className="p-4 text-right">Total Kotor</th>
                <th className="p-4 text-right">Potongan</th>
                <th className="p-4 text-right">Total Akhir</th>
                <th className="p-4 text-center">Poin Didapat</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 divide-y divide-gray-700 text-sm">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-700/50 transition-colors">
                  {/* Tanggal & Waktu */}
                  <td className="p-4 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  
                  {/* ID Transaksi */}
                  <td className="p-4 font-mono text-xs text-blue-400 max-w-[150px] truncate">
                    {tx.id}
                  </td>
                  
                  {/* Nama Pelanggan / Member */}
                  <td className="p-4">
                    {/* 🛠️ FIX: Cek data object langsung menggunakan tx.Customer.name */}
                    {tx.Customer ? (
                      <span className="bg-blue-900/40 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                        🙋‍♂️ {tx.Customer.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Guest (Non-Member)</span>
                    )}
                  </td>
                  
                  {/* Total Kotor */}
                  <td className="p-4 text-right whitespace-nowrap">
                    Rp {tx.totalAmount.toLocaleString("id-ID")}
                  </td>
                  
                  {/* Potongan / Diskon */}
                  <td className="p-4 text-right text-red-400 whitespace-nowrap">
                    -Rp {tx.discount.toLocaleString("id-ID")}
                  </td>
                  
                  {/* Total Akhir */}
                  <td className="p-4 text-right font-semibold text-green-400 whitespace-nowrap">
                    Rp {tx.finalAmount.toLocaleString("id-ID")}
                  </td>
                  
                  {/* Poin Perolehan */}
                  <td className="p-4 text-center font-medium text-yellow-500">
                    {tx.pointsEarned > 0 ? `+${tx.pointsEarned} Pts` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}   