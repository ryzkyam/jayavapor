// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

const handleLogin = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (loading) return;

  setLoading(true);
  setErrorMessage(null);

  try {
    console.log("=== LOGIN START ===");
    console.log("Email:", email.trim());

    // ============================================
    // 1. SUPABASE AUTH
    // ============================================

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    console.log("AUTH DATA:", authData);
    console.log("AUTH ERROR:", authError);

    if (authError) {
      console.error("SUPABASE AUTH ERROR:", authError);

      throw new Error(
        authError.message ||
        "Login Supabase gagal."
      );
    }

    if (!authData?.user) {
      throw new Error(
        "Login berhasil tetapi data user tidak ditemukan."
      );
    }

    console.log(
      "AUTH BERHASIL:",
      authData.user.id
    );

    // ============================================
    // 2. AMBIL DATA USER
    // ============================================

    const {
      data: userData,
      error: userError,
    } = await supabase
      .from("User")
      .select("id, name, role")
      .eq("id", authData.user.id)
      .maybeSingle();

    console.log("USER DATA:", userData);
    console.log("USER ERROR:", userError);

    if (userError) {
      console.error(
        "DATABASE USER ERROR:",
        userError
      );

      throw new Error(
        userError.message ||
        `Gagal mengambil profil user. Code: ${userError.code || "UNKNOWN"}`
      );
    }

    if (!userData) {
      throw new Error(
        "Akun berhasil login, tetapi data user tidak ditemukan."
      );
    }

    // ============================================
    // 3. CEK ROLE
    // ============================================

    console.log("USER ROLE:", userData.role);

    const role = String(userData.role).toUpperCase();

    if (
      role !== "ADMIN" &&
      role !== "CASHIER"
    ) {
      await supabase.auth.signOut();

      throw new Error(
        `Role "${userData.role}" tidak memiliki akses ke sistem.`
      );
    }

    // ============================================
    // 4. CEK SESSION
    // ============================================

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log(
      "SESSION:",
      sessionData
    );

    console.log(
      "SESSION ERROR:",
      sessionError
    );

    if (sessionError) {
      throw new Error(
        sessionError.message
      );
    }

    if (!sessionData.session) {
      throw new Error(
        "Login berhasil tetapi session tidak tersimpan."
      );
    }

    // ============================================
    // 5. LOGIN BERHASIL
    // ============================================

    console.log("================================");
    console.log("LOGIN BERHASIL");
    console.log("User:", userData.name);
    console.log("Role:", userData.role);
    console.log("Session OK");
    console.log("================================");

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    window.location.href = "/admin/pos";

  } catch (error: unknown) {

    console.error(
      "================================"
    );

    console.error(
      "LOGIN CATCH ERROR:",
      error
    );

    console.error(
      "ERROR TYPE:",
      typeof error
    );

    console.error(
      "ERROR JSON:",
      JSON.stringify(error, null, 2)
    );

    console.error(
      "================================"
    );

    // ============================================
    // ERROR HANDLER YANG AMAN
    // ============================================

    if (error instanceof Error) {
      setErrorMessage(
        error.message
      );

    } else if (
      typeof error === "object" &&
      error !== null
    ) {
      const errorObject =
        error as Record<string, unknown>;

      const message =
        typeof errorObject.message === "string"
          ? errorObject.message
          : typeof errorObject.error_description === "string"
            ? errorObject.error_description
            : typeof errorObject.msg === "string"
              ? errorObject.msg
              : "Terjadi kesalahan saat login.";

      setErrorMessage(message);

    } else {
      setErrorMessage(
        "Terjadi kesalahan sistem saat mencoba login."
      );
    }

  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070A0F] p-4 text-slate-100 font-sans">
      {/* Container Form */}
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0F172A]/80 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="text-emerald-500 text-2xl">⚡</span>
            <h1 className="text-2xl font-black tracking-wider text-white">
              JAYA VAPOR
            </h1>
          </div>
          <p className="text-xs font-semibold tracking-widest text-emerald-500 uppercase">
            CRM & POS SYSTEM
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wide text-slate-400 uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jayavapor.com"
              className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-wide text-slate-400 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold tracking-wide text-slate-950 transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "MASUK KE KASIR"}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center text-[10px] tracking-wider text-slate-600 uppercase">
          Authorization Required • Staff Only
        </div>
      </div>
    </div>
  );
}