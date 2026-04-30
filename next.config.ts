import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    // Whitelist хостов для next/image — иначе изображения из CMS-баннеров
    // (Unsplash и т.п.) не отрендерятся и упадут с invalid src.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      // Локальные uploads уже работают по умолчанию (same-origin).
    ],
  },
};

export default nextConfig;
