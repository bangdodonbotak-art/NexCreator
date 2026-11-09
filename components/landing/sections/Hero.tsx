"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Hero landing — SATU client island: nav pill + headline sinematik +
 * visual 3D. Sisanya di app/page.tsx adalah server component.
 * Badge berisi kalimat manfaat, bukan jargon versi/fase.
 */

/** 3D hero lazy-load: First Load JS landing tidak ikut membengkak. */
const Hero3D = dynamic(() => import("@/components/landing/Hero3D"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
    >
      <div className="relative flex aspect-[9/16] h-[78%] items-center justify-center rounded-2xl border border-line bg-panel">
        <span className="h-10 w-10 motion-safe:animate-pulse rounded-full bg-emerald-500/40" />
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

export default function Hero() {
  return (
    <>
      {/* Header — pill minimal mengambang (Jiro + Superhuman) */}
      <header className="fixed inset-x-0 top-3 z-40 px-4 md:top-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full border border-white/10 bg-ink/80 py-2 pl-3 pr-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex min-h-9 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-gold/30">
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
              className="min-h-9 rounded-full bg-gold px-4 text-gold-ink hover:bg-gold-bright hover:gold-glow-sm"
            >
              <Link href="/app/command">Buka Studio</Link>
            </Button>
          </div>
        </div>
      </header>

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
              className="rounded-full border-gold/50 bg-gold/10 text-gold-soft"
            >
              Video affiliate tanpa tampil kamera
            </Badge>
          </motion.div>
          <div className="mt-6">
            <StaggeredHeadline />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: EASE }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mist md:text-lg"
          >
            Riset produk winning, racik naskah ATM, dan catat komisi nyata —
            tanpa tampil kamera.
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
              className="min-h-12 w-full rounded-full bg-gold px-6 text-gold-ink hover:bg-gold-bright hover:gold-glow sm:w-auto"
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
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/80 px-3 py-1.5 text-xs text-mist">
              <Target className="h-3.5 w-3.5 text-gold" />
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
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs text-mist transition-colors duration-150 hover:text-white"
          >
            Scroll ke bawah
            <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" />
          </Link>
        </div>
      </section>
    </>
  );
}
