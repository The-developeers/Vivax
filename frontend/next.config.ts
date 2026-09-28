import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // As fotos já vêm prontas do Supabase Storage. Desativa o otimizador
    // embutido do Next.js (que usa processos-filho via jest-worker e falha
    // de forma intermitente no Windows com "exceeding retry limit").
    unoptimized: true,
  },
};

export default nextConfig;
