import Link from "next/link";
import {
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
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "@/components/landing/CountUp";
import Hero from "@/components/landing/sections/Hero";
import LenisProvider from "@/components/landing/LenisProvider";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";

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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-bright">
        {eyebrow}
      </p>
      <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-3 text-sm leading-relaxed text-mist md:text-base">
          {desc}
        </p>
      ) : null}
      <div className="royal-hairline mx-auto mt-6 h-px w-24" />
    </Reveal>
  );
}

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="min-h-screen overflow-x-clip bg-ink text-fog">
        <ScrollProgress />
        {/* Mesh gradient + noise halus */}
        <div aria-hidden="true" className="mesh-royal pointer-events-none fixed inset-0" />
        <div aria-hidden="true" className="noise-overlay pointer-events-none fixed inset-0" />

        <div className="relative">
          <Hero />

          <main>
            {/* MARQUEE */}
            <div
              aria-label="Ringkasan fitur NexCreator"
              className="relative overflow-hidden border-y border-line bg-panel-deep/80 py-3.5"
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
                        className="flex items-center gap-8 whitespace-nowrap text-sm font-medium tracking-wide text-mist"
                      >
                        {item}
                        <span className="text-royal-bright" aria-hidden="true">
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
                    <Card className="h-full border-line bg-panel/90">
                      <CardHeader>
                        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300 ring-1 ring-royal/25">
                          <p.icon className="h-5 w-5" />
                        </span>
                        <CardTitle className="font-display text-lg">
                          {p.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-mist">
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
              className="scroll-mt-20 border-y border-line bg-panel-deep/60"
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
                    className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent lg:block"
                  />
                  <ol className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {JOURNEY.map((j, i) => (
                      <Reveal key={j.step} delay={i * 0.08}>
                        <li className="relative">
                          <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-royal/40 bg-panel font-display text-xl font-semibold text-royal-bright">
                            {j.step}
                          </span>
                          <h3 className="mt-4 text-base font-semibold">
                            {j.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-mist">
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
                    className="min-h-12 rounded-full bg-royal px-6 text-white hover:bg-royal-bright hover:royal-glow"
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
                      <Card className="group h-full border-line bg-panel/90 transition-all duration-300 hover:-translate-y-1 hover:border-royal/50 hover:royal-glow">
                        <CardHeader>
                          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-royal/15 text-azure ring-1 ring-royal/25 transition-all duration-300 group-hover:bg-royal/25">
                            <m.icon className="h-5 w-5" />
                          </span>
                          <CardTitle className="font-display text-lg">
                            {m.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed text-mist">
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
                <Card className="overflow-hidden border-royal/30 bg-panel/90">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-royal/15 text-royal-bright ring-1 ring-royal/30">
                        <Target className="h-6 w-6" />
                      </span>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-semibold">
                          Target bulan ini:{" "}
                          <CountUp to={5000000} prefix="Rp" />
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-mist">
                          Ini target (GOAL), bukan pendapatan — komisi dihitung
                          hanya dari snapshot manual Seller Center yang kamu
                          input di Analytics. Belum ada snapshot komisi
                          tercatat, jadi progresnya mulai dari Rp0.
                        </p>
                        <div
                          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line"
                          role="img"
                          aria-label="Progres target komisi: 0 persen — belum ada snapshot komisi tercatat"
                        >
                          <div className="h-full w-0 rounded-full bg-gradient-to-r from-royal to-azure" />
                        </div>
                        <p className="mt-2 text-xs text-mist">
                          Progres 0% · Label data: Manual
                        </p>
                      </div>
                      <Button
                        asChild
                        className="min-h-11 shrink-0 rounded-full bg-royal px-5 text-white hover:bg-royal-bright hover:royal-glow-sm"
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
                <Card className="border-line bg-panel/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-azure">
                      <CheckCircle2 className="h-5 w-5" /> Fase A — Sudah jalan
                      di V5
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm leading-relaxed text-mist">
                    <p>• Naskah ATM lokal 6 archetype + Gemini 2.5-flash bila API key diset.</p>
                    <p>• Production pack JSON + TXT untuk dirakit di CapCut 5–8 menit.</p>
                    <p>• Antrean + jadwal posting manual, laporan Telegram harian.</p>
                    <p>• Komisi nyata dari input manual Seller Center, target Rp5.000.000/bulan.</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-panel/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-300">
                      <CircleAlert className="h-5 w-5" /> Fase B — Belum, dan
                      sengaja belum
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm leading-relaxed text-mist">
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
                <Card className="border-line bg-panel/90">
                  <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold">
                        Aman dari v4: RLS per-user, tanpa key di browser
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-mist">
                        Data tiap pengguna terisolasi lewat Row Level Security
                        (auth.uid() = user_id). Tidak ada Gemini key atau token
                        Telegram yang disimpan di localStorage, dan tidak ada
                        panggilan API langsung dari browser — semua lewat proxy
                        server.
                      </p>
                    </div>
                    <Button
                      asChild
                      className="min-h-11 shrink-0 rounded-full bg-royal px-5 text-white hover:bg-royal-bright hover:royal-glow-sm"
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
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal to-transparent"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-bright">
                    Klimaks · Mulai hari ini
                  </p>
                  <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                    Video pertamamu, tanpa tampil kamera.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist md:text-base">
                    Riset satu produk winning, racik satu naskah ATM, dan
                    ekspor production pack pertamamu — semuanya dari satu
                    studio.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      asChild
                      size="lg"
                      className="min-h-12 w-full rounded-full bg-royal px-6 text-white hover:bg-royal-bright hover:royal-glow sm:w-auto"
                    >
                      <Link href="/app/command">
                        Mulai di Command Center <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="min-h-12 w-full border-line bg-panel/80 text-fog hover:bg-line sm:w-auto"
                    >
                      <Link href="/auth/login">Masuk / Daftar</Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            </section>
          </main>

          <footer className="border-t border-line py-10 text-xs text-mist">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="font-display text-base font-semibold text-fog">
                  NexCreator
                </p>
                <nav
                  aria-label="Navigasi footer"
                  className="flex flex-wrap items-center justify-center gap-1"
                >
                  {[
                    { href: "#alur", label: "Alur" },
                    { href: "#modul", label: "Modul" },
                    { href: "#fase", label: "Fase" },
                    { href: "/auth/login", label: "Masuk" },
                    { href: "/app/command", label: "Buka Studio" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-2 text-xs transition-colors duration-150 hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <p className="mt-6 text-center leading-relaxed">
                Fase A aktif — script + production pack + jadwal manual. Fase B
                (render GPU + auto-post) menunggu komisi Rp500.000 pertama yang
                terverifikasi.
              </p>
              <p className="mt-2 text-center">
                NexCreator AI V5 · Dibangun dengan Next.js 15 + Supabase · Posting
                akhir dilakukan lewat aplikasi TikTok.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </LenisProvider>
  );
}
