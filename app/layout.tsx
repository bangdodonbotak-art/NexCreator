import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/app/Providers";

const SITE_URL = "https://nexcreator.vercel.app";
const SITE_TITLE = "NexCreator AI V5 — Virtual Creator Studio TikTok Affiliate";
const SITE_DESC =
  "Studio kreator virtual untuk TikTok Affiliate tanpa tampil di depan kamera: riset produk, naskah ATM, production pack 9:16, jadwal posting, dan laporan komisi. Fase A: script + rakit manual di CapCut.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: "NexCreator",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  icons: {
    icon: "/favicon.svg",
  },
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
