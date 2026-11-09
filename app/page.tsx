"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clapperboard,
  FileSearch,
  Hourglass,
  LayoutDashboard,
  PenLine,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CountUp from "@/components/landing/CountUp";
import LenisProvider from "@/components/landing/LenisProvider";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";

/** 3D hero lazy-load: First Load JS landing tidak ikut membengkak. */
const Hero3D = dynamic(() => import("@/components/landing/Hero3D"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
    >
      <div className="relative flex aspect-[9/16] h-[78%] items-center justify-center rounded-2xl border border-[#182339] bg-[#0E1524]">
        <span className="h-10 w-10 animate-pulse rounded-full bg-emerald-500/40" />
      </div>
    </div>
  ),
});

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

const PAINS = [
  {
    icon: Hourglass,
    title: "Riset makan waktu berjam-jam",
    desc: "Buka tutup TikTok Shop, catat harga dan komisi di banyak tempat, lalu lupa produk mana yang sudah dicek.",
  },
  {
    icon: FileSearch,
    title: "Naskah asal-asalan, rawan klaim",
    desc: "Hook yang ditiru mentah-mentah berisiko kena moderasi TikTok Shop — akun affiliate bisa kena strike.",
  },
  {
    icon: Wallet,
    title: "Komisi tercecer, tak terlacak",
    desc: "Tanpa catatan harian yang rapi, sulit tahu video mana yang benar-benar menghasilkan dan mana yang tidak.",
  },
];

const JOURNEY = [
  {
    step: "01",
    title: "Riset produk winning",
    desc: "Hunter menyaring produk TikTok Shop berdasarkan komisi, penjualan 7 hari, dan skor viral — lalu tandai yang winning.",
  },
  {
    step: "02",
    title: "Racik naskah ATM",
    desc: "Pilih 1 dari 6 archetype, generate hook 0–3 detik, dan loloskan filter klaim berlebihan sebelum lanjut.",
  },
  {
    step: "03",
    title: "Siapkan production pack",
    desc: "Studio 9:16 mengekspor JSON + TXT untuk dirakit di CapCut dalam 5–8 menit — tanpa render GPU di server.",
  },
  {
    step: "04",
    title: "Jadwalkan & catat komisi",
    desc: "Publisher mengantrekan video di slot 12:15 / 17:30 / 20:00 WIB, Analytics mencatat komisi nyata tiap hari.",
  },
];

const MARQUEE = [
  "Riset Produk",
  "Naskah ATM",
  "Production Pack 9:16",
  "Jadwal Manual",
  "Komisi Nyata",
  "Tanpa Tampil Kamera",
  "RLS Per-User",
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Headline stagger per baris — tiap baris <8 kata. */
function StaggeredHeadline() {
  const reduceMotion = useReducedMotion();
  const lines: { text: string; accent?: boolean }[] = [
    { text: "Studio kreator virtual" },
    { text: "untuk TikTok Affiliate", accent: true },
    { text: "— tanpa tampil kamera." },
  ];
  return (
    <h1 className="font-display text-balance text-center text-5xl font-semibold leading-[1.05] tracking-tight md:text-[4rem]">
      {lines.map((line, li) => (
        <span key={line.text} className="block overflow-hidden pb-1">
          <motion.span
            className={line.accent ? "block text-emerald-400" : "block"}
            initial={reduceMotion ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + li * 0.09, ease: EASE }}
          >
            {line.text}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
        {eyebrow}
      </p>
      <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-3 text-sm leading-relaxed text-[#8A97AD] md:text-base">
          {desc}
        </p>
      ) : null}
      <div className="gold-hairline mx-auto mt-6 h-px w-24" />
    </Reveal>
  );
}

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="min-h-screen overflow-x-clip bg-[#080C14] text-[#E8EEF7]">
        <ScrollProgress />
        {/* Mesh gradient + noise halus */}
        <div aria-hidden="true" className="mesh-hero pointer-events-none fixed inset-0" />
        <div aria-hidden="true" className="noise-overlay pointer-events-none fixed inset-0" />

        <div className="relative">
          {/* Header — pill minimal mengambang (Jiro + Superhuman) */}
          <header className="fixed inset-x-0 top-3 z-40 px-4 md:top-4">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full border border-white/10 bg-[#080C14]/80 py-2 pl-3 pr-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <Link
                href="/"
                className="flex min-h-9 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-[#C9A227]/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="font-display text-[17px] font-semibold tracking-tight">
                  NexCreator
                </span>
              </Link>
              <nav
                aria-label="Navigasi utama"
                className="hidden items-center gap-1 md:flex"
              >
                {[
                  { href: "#alur", label: "Alur" },
                  { href: "#modul", label: "Modul" },
                  { href: "#fase", label: "Fase" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-2 text-sm text-[#8A97AD] transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  asChild
                  className="min-h-9 rounded-full px-3 text-[#8A97AD] hover:text-white"
                >
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button
                  asChild
                  className="min-h-9 rounded-full bg-[#C9A227] px-4 text-[#1A1405] hover:bg-[#D9B83A] hover:shadow-[0_12px_28px_-10px_rgba(201,162,39,0.55)]"
                >
                  <Link href="/app/command">Buka Studio</Link>
                </Button>
              </div>
            </div>
          </header>

          <main>
            {/* HERO — sinematik full-bleed, pola Linear (Supahero):
                satu headline tengah + satu kalimat + SATU CTA + SATU visual. */}
            <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 md:px-6 md:pt-36">
              <div
                aria-hidden="true"
                className="hero-glow pointer-events-none absolute inset-0"
              />
              <div className="relative text-center">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <Badge
                    variant="outline"
                    className="rounded-full border-[#C9A227]/50 bg-[#C9A227]/10 text-[#E7C95C]"
                  >
                    V5 · Fase A — Script + Production Pack + Jadwal Manual
                  </Badge>
                </motion.div>
                <div className="mt-6">
                  <StaggeredHeadline />
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: EASE }}
                  className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#8A97AD] md:text-lg"
                >
                  Riset produk winning, racik naskah ATM, dan catat komisi
                  nyata — tanpa tampil kamera.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45, ease: EASE }}
                  className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
                >
                  <Button
                    asChild
                    size="lg"
                    className="min-h-12 w-full rounded-full bg-[#C9A227] px-6 text-[#1A1405] hover:bg-[#D9B83A] hover:shadow-[0_16px_36px_-12px_rgba(201,162,39,0.55)] sm:w-auto"
                  >
                    <Link href="/app/command">
                      Mulai di Command Center <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    href="#modul"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-[#E8EEF7] transition-colors duration-150 hover:bg-white/5"
                  >
                    Lihat 6 modul <ArrowDown className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#182339] bg-[#0E1524]/80 px-3 py-1.5 text-xs text-[#8A97AD]">
                    <Target className="h-3.5 w-3.5 text-[#C9A227]" />
                    Target (GOAL): Rp5.000.000/bulan
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                    Data berlabel Real / Manual / Estimasi
                  </span>
                </motion.div>
              </div>

              {/* Satu visual dominan di bawah headline — ruang dicadangkan
                  agar CLS tetap kecil */}
              <div className="relative mx-auto mt-10 h-[440px] max-w-md sm:h-[500px] lg:h-[540px]">
                <div className="glass absolute inset-x-6 top-8 bottom-8 rounded-[2rem] md:inset-x-2" />
                <div className="absolute inset-0">
                  <Hero3D />
                </div>
              </div>
              <div className="relative mt-2 text-center">
                <Link
                  href="#masalah"
                  aria-label="Lanjut ke Bab 1 — masalahnya"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs text-[#8A97AD] transition-colors duration-150 hover:text-white"
                >
                  Scroll ke bawah
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </Link>
              </div>
            </section>

            {/* MARQUEE */}
            <div
              aria-label="Ringkasan fitur NexCreator"
              className="relative overflow-hidden border-y border-[#182339] bg-[#0A0F1C]/80 py-3.5"
            >
              <div className="marquee flex w-max items-center gap-8">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex items-center gap-8"
                  >
                    {MARQUEE.map((item) => (
                      <span
                        key={`${copy}-${item}`}
                        className="flex items-center gap-8 whitespace-nowrap text-sm font-medium tracking-wide text-[#8A97AD]"
                      >
                        {item}
                        <span className="text-[#C9A227]" aria-hidden="true">
                          ◆
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* BAB 1 — MASALAH */}
            <section
              id="masalah"
              className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24"
            >
              <SectionHeading
                eyebrow="Bab 1 · Masalahnya"
                title="Affiliate tanpa wajah itu menjanjikan — tapi berantakan kalau manual"
                desc="Tiga hal yang paling sering bikin kreator berhenti di tengah jalan, sebelum videonya sempat menghasilkan."
              />
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {PAINS.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.08}>
                    <Card className="h-full border-[#182339] bg-[#0E1524]/90">
                      <CardHeader>
                        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300 ring-1 ring-[#C9A227]/25">
                          <p.icon className="h-5 w-5" />
                        </span>
                        <CardTitle className="font-display text-lg">
                          {p.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-[#8A97AD]">
                          {p.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* BAB 2 — PERJALANAN, sebagai stepper onboarding (Mobbin) */}
            <section
              id="alur"
              className="scroll-mt-20 border-y border-[#182339] bg-[#0A0F1C]/60"
            >
              <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                <SectionHeading
                  eyebrow="Bab 2 · Alurnya"
                  title="Empat langkah, satu alur kerja"
                  desc="Dari riset sampai laporan komisi — tiap langkah datanya nyata dan bisa dilacak sumbernya."
                />
                <div className="relative mt-12">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent lg:block"
                  />
                  <ol className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {JOURNEY.map((j, i) => (
                      <Reveal key={j.step} delay={i * 0.08}>
                        <li className="relative">
                          <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A227]/40 bg-[#0E1524] font-display text-xl font-semibold text-[#C9A227]">
                            {j.step}
                          </span>
                          <h3 className="mt-4 text-base font-semibold">
                            {j.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#8A97AD]">
                            {j.desc}
                          </p>
                        </li>
                      </Reveal>
                    ))}
                  </ol>
                </div>
                <Reveal className="mt-12 text-center" delay={0.1}>
                  <Button
                    asChild
                    size="lg"
                    className="min-h-12 rounded-full bg-[#C9A227] px-6 text-[#1A1405] hover:bg-[#D9B83A] hover:shadow-[0_16px_36px_-12px_rgba(201,162,39,0.55)]"
                  >
                    <Link href="/app/command">
                      Coba alurnya sekarang <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Reveal>
              </div>
            </section>

            {/* BAB 3 — 6 MODUL */}
            <section id="modul" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
              <SectionHeading
                eyebrow="Bab 3 · Solusinya"
                title="Enam modul, satu alur kerja"
                desc="Arahkan kursor ke kartu untuk melihatnya miring — tiap modul adalah langkah nyata di alur di atas."
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [perspective:1200px]">
                {MODULES.map((m, i) => (
                  <Reveal key={m.title} delay={i * 0.06} className="h-full">
                    <TiltCard className="h-full">
                      <Card className="group h-full border-[#182339] bg-[#0E1524]/90 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_18px_40px_-16px_rgba(16,185,129,0.35)]">
                        <CardHeader>
                          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-[#C9A227]/20 transition-all duration-300 group-hover:bg-emerald-500/25">
                            <m.icon className="h-5 w-5" />
                          </span>
                          <CardTitle className="font-display text-lg">
                            {m.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed text-[#8A97AD]">
                            {m.desc}
                          </p>
                        </CardContent>
                      </Card>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* TARGET — GOAL, bukan pendapatan */}
            <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
              <Reveal>
                <Card className="overflow-hidden border-[#C9A227]/30 bg-[#0E1524]/90">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#C9A227]/15 text-[#C9A227] ring-1 ring-[#C9A227]/30">
                        <Target className="h-6 w-6" />
                      </span>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-semibold">
                          Target bulan ini:{" "}
                          <CountUp to={5000000} prefix="Rp" />
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#8A97AD]">
                          Ini target (GOAL), bukan pendapatan — komisi dihitung
                          hanya dari snapshot manual Seller Center yang kamu
                          input di Analytics. Belum ada snapshot komisi
                          tercatat, jadi progresnya mulai dari Rp0.
                        </p>
                        <div
                          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#182339]"
                          role="img"
                          aria-label="Progres target komisi: 0 persen — belum ada snapshot komisi tercatat"
                        >
                          <div className="h-full w-0 rounded-full bg-gradient-to-r from-[#10B981] to-[#C9A227]" />
                        </div>
                        <p className="mt-2 text-xs text-[#8A97AD]">
                          Progres 0% · Label data: Manual
                        </p>
                      </div>
                      <Button
                        asChild
                        className="min-h-11 shrink-0 rounded-full bg-[#C9A227] px-5 text-[#1A1405] hover:bg-[#D9B83A] hover:shadow-[0_12px_28px_-10px_rgba(201,162,39,0.55)]"
                      >
                        <Link href="/app/analytics">Catat komisi</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </section>

            {/* FASE A / B — jujur */}
            <section
              id="fase"
              className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 md:px-6"
            >
              <Reveal className="grid gap-4 md:grid-cols-2">
                <Card className="border-[#182339] bg-[#0E1524]/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" /> Fase A — Sudah jalan
                      di V5
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm leading-relaxed text-[#8A97AD]">
                    <p>• Naskah ATM lokal 6 archetype + Gemini 2.5-flash bila API key diset.</p>
                    <p>• Production pack JSON + TXT untuk dirakit di CapCut 5–8 menit.</p>
                    <p>• Antrean + jadwal posting manual, laporan Telegram harian.</p>
                    <p>• Komisi nyata dari input manual Seller Center, target Rp5.000.000/bulan.</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-[#0E1524]/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-300">
                      <CircleAlert className="h-5 w-5" /> Fase B — Belum, dan
                      sengaja belum
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm leading-relaxed text-[#8A97AD]">
                    <p>• Render video GPU (FFmpeg + LivePortrait + F5-TTS) butuh worker di luar Vercel.</p>
                    <p>• Auto-post TikTok butuh otorisasi seller + 15 video manual pertama yang terbukti konversi.</p>
                    <p>• Syarat mulai Fase B: &gt;5 video/hari dan komisi terverifikasi Rp500.000 pertama.</p>
                  </CardContent>
                </Card>
              </Reveal>
            </section>

            {/* KEAMANAN */}
            <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
              <Reveal>
                <Card className="border-[#182339] bg-[#0E1524]/90">
                  <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold">
                        Aman dari v4: RLS per-user, tanpa key di browser
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#8A97AD]">
                        Data tiap pengguna terisolasi lewat Row Level Security
                        (auth.uid() = user_id). Tidak ada Gemini key atau token
                        Telegram yang disimpan di localStorage, dan tidak ada
                        panggilan API langsung dari browser — semua lewat proxy
                        server.
                      </p>
                    </div>
                    <Button
                      asChild
                      className="min-h-11 shrink-0 rounded-full bg-[#C9A227] px-5 text-[#1A1405] hover:bg-[#D9B83A] hover:shadow-[0_12px_28px_-10px_rgba(201,162,39,0.55)]"
                    >
                      <Link href="/app/command">Buka Studio</Link>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            </section>

            {/* CTA AKHIR */}
            <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
              <Reveal>
                <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center md:py-20">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227] to-transparent"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                    Klimaks · Mulai hari ini
                  </p>
                  <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                    Video pertamamu, tanpa tampil kamera.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#8A97AD] md:text-base">
                    Riset satu produk winning, racik satu naskah ATM, dan
                    ekspor production pack pertamamu — semuanya dari satu
                    studio.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      asChild
                      size="lg"
                      className="min-h-12 w-full rounded-full bg-[#C9A227] px-6 text-[#1A1405] hover:bg-[#D9B83A] hover:shadow-[0_16px_36px_-12px_rgba(201,162,39,0.55)] sm:w-auto"
                    >
                      <Link href="/app/command">
                        Mulai di Command Center <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="min-h-12 w-full border-[#182339] bg-[#0E1524]/80 text-[#E8EEF7] hover:bg-[#182339] sm:w-auto"
                    >
                      <Link href="/auth/login">Masuk / Daftar</Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            </section>
          </main>

          <footer className="border-t border-[#182339] py-6 text-center text-xs text-[#8A97AD]">
            NexCreator AI V5 · Dibangun dengan Next.js 15 + Supabase · Posting
            akhir dilakukan lewat aplikasi TikTok.
          </footer>
        </div>
      </div>
    </LenisProvider>
  );
}
