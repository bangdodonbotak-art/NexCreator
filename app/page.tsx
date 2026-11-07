"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Clapperboard,
  LayoutDashboard,
  PenLine,
  Radar,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MODULES = [
  {
    icon: LayoutDashboard,
    title: "Command Center",
    desc: "Agregat nyata dari data kamu: produk, antrean, draft naskah, dan status setup Supabase / Gemini / Telegram.",
  },
  {
    icon: Radar,
    title: "Hunter",
    desc: "Riset produk TikTok Shop: komisi per unit, penjualan 7 hari, skor viral, dan tandai produk winning.",
  },
  {
    icon: PenLine,
    title: "Script ATM",
    desc: "Generator naskah Amati-Tiru-Modifikasi 6 archetype dengan filter klaim berlebihan dan Hook Lab A/B.",
  },
  {
    icon: Clapperboard,
    title: "Studio 9:16",
    desc: "Preview vertikal dengan safe-zone TikTok, simulasi ritme caption, dan export production pack JSON + TXT.",
  },
  {
    icon: CalendarClock,
    title: "Publisher",
    desc: "Antrean video dengan slot 12:15 / 17:30 / 20:00 WIB dan laporan Telegram. Posting akhir tetap manual.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Komisi nyata hanya dari input manual harian Seller Center. Target Rp5.000.000/bulan, tanpa angka palsu.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080C14] text-[#E8EEF7]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight">NexCreator</span>
            <span className="block text-[11px] font-medium text-[#8A97AD]">AI V5 · Virtual Creator Studio</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="min-h-11 text-[#8A97AD] hover:text-white">
            <Link href="/auth/login">Masuk</Link>
          </Button>
          <Button asChild className="min-h-11 bg-emerald-500 text-[#04150D] hover:bg-emerald-400">
            <Link href="/app/command">
              Buka Studio <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Hero */}
        <section className="py-14 text-center md:py-20">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            >
              V5 · Fase A — Script + Production Pack + Jadwal Manual
            </Badge>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Studio kreator virtual untuk{" "}
              <span className="text-emerald-400">TikTok Affiliate</span> — tanpa
              tampil di depan kamera.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#8A97AD] md:text-lg">
              Riset produk winning, racik naskah ATM, siapkan production pack
              9:16, jadwalkan posting, dan catat komisi nyata. Semua angka
              berlabel jelas: Real, Manual, atau Estimasi — tidak ada yang
              dipalsukan.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="min-h-12 w-full bg-emerald-500 text-[#04150D] hover:bg-emerald-400 sm:w-auto"
              >
                <Link href="/app/command">
                  Mulai di Command Center <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-12 w-full border-[#182339] bg-[#0E1524] text-[#E8EEF7] hover:bg-[#182339] sm:w-auto"
              >
                <Link href="#modul">Lihat 6 modul</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Jujur soal Fase A/B */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Card className="border-[#182339] bg-[#0E1524]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-300">
                <CheckCircle2 className="h-5 w-5" /> Fase A — Sudah jalan di V5
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-[#8A97AD]">
              <p>• Naskah ATM lokal 6 archetype + Gemini 2.5-flash bila API key diset.</p>
              <p>• Production pack JSON + TXT untuk dirakit di CapCut 5–8 menit.</p>
              <p>• Antrean + jadwal posting manual, laporan Telegram harian.</p>
              <p>• Komisi nyata dari input manual Seller Center, target Rp5.000.000/bulan.</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30 bg-[#0E1524]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-amber-300">
                <CircleAlert className="h-5 w-5" /> Fase B — Belum, dan sengaja belum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-[#8A97AD]">
              <p>• Render video GPU (FFmpeg + LivePortrait + F5-TTS) butuh worker di luar Vercel.</p>
              <p>• Auto-post TikTok butuh otorisasi seller + 15 video manual pertama yang terbukti konversi.</p>
              <p>• Syarat mulai Fase B: &gt;5 video/hari dan komisi terverifikasi Rp500.000 pertama.</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Modul */}
        <section id="modul" className="py-14 md:py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            Enam modul, satu alur kerja
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[#8A97AD] md:text-base">
            Dari riset produk sampai laporan komisi — tiap langkah datanya nyata
            dan bisa dilacak sumbernya.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.title}
                {...fadeUp}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Card className="h-full border-[#182339] bg-[#0E1524] transition-colors hover:border-emerald-500/40">
                  <CardHeader>
                    <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <m.icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-base">{m.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-[#8A97AD]">{m.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Keamanan */}
        <section className="pb-16">
          <Card className="border-[#182339] bg-[#0E1524]">
            <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-semibold">Aman dari v4: RLS per-user, tanpa key di browser</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#8A97AD]">
                  Data tiap pengguna terisolasi lewat Row Level Security
                  (auth.uid() = user_id). Tidak ada Gemini key atau token
                  Telegram yang disimpan di localStorage, dan tidak ada
                  panggilan API langsung dari browser — semua lewat proxy
                  server.
                </p>
              </div>
              <Button asChild className="min-h-11 shrink-0 bg-emerald-500 text-[#04150D] hover:bg-emerald-400">
                <Link href="/app/command">Buka Studio</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-[#182339] py-6 text-center text-xs text-[#8A97AD]">
        NexCreator AI V5 · Dibangun dengan Next.js 15 + Supabase · Posting akhir
        dilakukan lewat aplikasi TikTok.
      </footer>
    </div>
  );
}
