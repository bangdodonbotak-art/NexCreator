"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Hero landing — SATU client island: nav pill + headline sinematik +
 * visual 3D. Sisanya di app/page.tsx adalah server component.
 * Badge berisi kalimat manfaat, bukan jargon versi/fase.
 *
 * Fit-to-screen (2026-11-10): section min-h-svh full-bleed, Aurora
 * (React Bits) menutupi seluruh hero, ponsel 3D di bawah headline
 * mengisi sisa viewport (flex-1) — bukan tinggi svh tetap — supaya
 * terlihat di first viewport. Tema hitam-biru: royal = CTA, azure = aksen.
 */

/** Aurora React Bits — latar hero full-bleed, lazy-load seperti Hero3D. */
const Aurora = dynamic(() => import("@/components/landing/Aurora"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-full w-full bg-black" />,
});

/** 3D hero lazy-load: First Load JS landing tidak ikut membengkak. */
const Hero3D = dynamic(() => import("@/components/landing/Hero3D"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
    >
      <div className="relative flex aspect-[9/16] h-[78%] items-center justify-center rounded-2xl border border-line bg-panel">
        <span className="h-10 w-10 motion-safe:animate-pulse rounded-full bg-royal/40" />
      </div>
    </div>
  ),
});

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
            className={line.accent ? "block text-azure" : "block"}
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

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  return (
    <>
      {/* Header — pill minimal mengambang (Jiro + Superhuman) */}
      <header className="fixed inset-x-0 top-3 z-40 px-4 md:top-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full border border-white/10 bg-ink/80 py-2 pl-3 pr-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex min-h-9 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-azure"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-royal/15 text-azure ring-1 ring-royal/30">
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
                className="rounded-full px-3 py-2 text-sm text-mist transition-colors duration-150 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              asChild
              className="min-h-9 rounded-full px-3 text-mist hover:text-white"
            >
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button
              asChild
              className="min-h-9 rounded-full bg-royal px-4 text-white hover:bg-royal-bright hover:royal-glow-sm"
            >
              <Link href="/app/command">Buka Studio</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO — full-bleed fit-to-screen: Aurora menutupi seluruh hero,
          headline + CTA di tengah, ponsel 3D ~62svh di bawahnya. */}
      <section className="relative flex min-h-svh flex-col overflow-hidden">
        {/* Latar Aurora (React Bits, shader WebGL2, palet biru). Fallback
            statis: gradient biru untuk reduced-motion / sebelum load. */}
        <div aria-hidden="true" className="absolute inset-0">
          {reduceMotion ? (
            <div className="h-full w-full bg-[radial-gradient(60rem_30rem_at_50%_0%,rgba(37,99,235,0.35),transparent_60%),radial-gradient(40rem_20rem_at_85%_20%,rgba(96,165,250,0.2),transparent_60%)]" />
          ) : (
            <Aurora
              colorStops={["#0B1E4B", "#2563EB", "#60A5FA"]}
              amplitude={1.6}
              blend={0.5}
              speed={1.0}
              height={0.55}
              scale={1}
              glow={0.8}
              brightness={1.1}
              layers={2}
              direction="top"
              mouseInteraction
              intro
            />
          )}
        </div>
        {/* Vignette gelap supaya teks tetap terbaca di atas Aurora.
            Bagian atas sengaja ringan (black/25) agar pita Aurora tetap
            tegas — headline berada di tengah (via-transparent). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70"
        />

        <div className="hero-short relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-24 md:px-6 md:pt-28">
          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Badge
                variant="outline"
                className="rounded-full border-royal/50 bg-royal/10 text-royal-soft"
              >
                Video affiliate tanpa tampil kamera
              </Badge>
            </motion.div>
            <div className="mt-4">
              <StaggeredHeadline />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: EASE }}
              className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-mist md:text-lg"
            >
              Riset produk winning, racik naskah ATM, dan catat komisi nyata —
              tanpa tampil kamera.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45, ease: EASE }}
              className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="min-h-12 w-full rounded-full bg-royal px-6 text-white hover:bg-royal-bright hover:royal-glow sm:w-auto"
              >
                <Link href="/app/command">
                  Mulai di Command Center <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="#modul"
                className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-fog transition-colors duration-150 hover:bg-white/5"
              >
                Lihat 6 modul <ArrowDown className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/80 px-3 py-1.5 text-xs text-mist">
                <Target className="h-3.5 w-3.5 text-royal-bright" />
                Target (GOAL): Rp5.000.000/bulan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-royal/40 bg-royal/10 px-3 py-1.5 text-xs text-azure">
                Data berlabel Real / Manual / Estimasi
              </span>
            </motion.div>
          </div>

          {/* Satu visual dominan: ponsel 3D hyper-realistic. Wadah flex-1
              mengisi sisa viewport (bukan h-[62svh] tetap) supaya ponsel
              terlihat di first viewport pada 1280×800 dan 1919×998;
              min-h menjaga ponsel tetap layak di layar kecil. */}
          <div className="relative mx-auto mt-4 flex min-h-[260px] w-full max-w-xl flex-1">
            <Hero3D scrollProgress={scrollYProgress} />
          </div>
          <div className="relative pb-3 pt-1 text-center">
            <Link
              href="#masalah"
              aria-label="Lanjut ke Bab 1 — masalahnya"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs text-mist transition-colors duration-150 hover:text-white"
            >
              Scroll ke bawah
              <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
