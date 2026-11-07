import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/app/Providers";

export const metadata: Metadata = {
  title: "NexCreator AI V5 — Virtual Creator Studio TikTok Affiliate",
  description:
    "Studio kreator virtual untuk TikTok Affiliate tanpa tampil di depan kamera: riset produk, naskah ATM, production pack 9:16, jadwal posting, dan laporan komisi. Fase A: script + rakit manual di CapCut.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark">
      <head>
        {/* Cormorant + Montserrat via <link>: build tidak fetch font (fallback
            system font tetap jalan bila link gagal dimuat). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
