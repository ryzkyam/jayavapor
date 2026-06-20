import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Masukkan IP laptop lu di sini (tanpa port :3000)
  allowedDevOrigins: ['192.168.1.6'],

  experimental: {
    // Opsi experimental lainnya di sini jika ada
  }
};

export default nextConfig;