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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
