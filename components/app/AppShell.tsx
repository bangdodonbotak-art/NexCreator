"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  Clapperboard,
  LayoutDashboard,
  PenLine,
  Radar,
  Search,
  Sparkles,
  CircleAlert,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { CmdPalette } from "@/components/app/CmdPalette";
import { useNexStore, isSupabaseEnvPresent } from "@/lib/store";
import type { SetupStatus } from "@/lib/env";

const NAV = [
  { href: "/app/command", label: "Command", icon: LayoutDashboard, key: "1" },
  { href: "/app/hunter", label: "Hunter", icon: Radar, key: "2" },
  { href: "/app/script", label: "Script", icon: PenLine, key: "3" },
  { href: "/app/studio", label: "Studio", icon: Clapperboard, key: "4" },
  { href: "/app/publisher", label: "Publisher", icon: CalendarClock, key: "5" },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3, key: "6" },
];

export function AppShell({
  children,
  setup,
}: {
  children: React.ReactNode;
  setup: SetupStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const sampleLoaded = useNexStore((s) => s.sampleLoaded);
  const clearSample = useNexStore((s) => s.clearSample);
  const pushToast = useNexStore((s) => s.pushToast);
  const supabaseEnv = isSupabaseEnvPresent();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (typing) return;
      const item = NAV.find((n) => n.key === e.key);
      if (item) router.push(item.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const statusChip = (label: string, ok: boolean) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-[#182339] bg-[#0E1524] text-[#8A97AD]",
      )}
      title={ok ? `${label} terhubung` : `${label} belum diset`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-400" : "bg-[#8A97AD]")} />
      {label}: {ok ? "Terhubung" : "Belum diset"}
    </span>
  );

  return (
    <div className="flex min-h-screen bg-[#080C14] text-[#E8EEF7]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[#182339] bg-[#0A0F1C] md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 pb-5 pt-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight">NexCreator</span>
            <span className="block text-[11px] font-medium text-[#8A97AD]">AI V5 · Studio</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1 px-3" aria-label="Navigasi utama">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-[#8A97AD] hover:bg-[#182339] hover:text-[#E8EEF7]",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                <kbd className="rounded border border-[#182339] bg-[#080C14] px-1.5 py-0.5 text-[10px] text-[#8A97AD]">
                  {item.key}
                </kbd>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-[#182339] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A97AD]">
            Status setup
          </p>
          <div className="flex flex-wrap gap-1.5">
            {statusChip("Supabase", setup.supabase)}
            {statusChip("Gemini", setup.gemini)}
            {statusChip("Telegram", setup.telegram)}
          </div>
          <p className="text-[11px] leading-relaxed text-[#8A97AD]">
            Fase A: script + production pack, rakit di CapCut, posting manual
            via aplikasi TikTok.
          </p>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-30 border-b border-[#182339] bg-[#080C14]/90 backdrop-blur">
          <div className="flex min-h-14 items-center gap-2 px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 md:hidden">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-bold">NexCreator V5</span>
            </Link>
            <div className="flex-1" />
            <Button
              variant="outline"
              onClick={() => setPaletteOpen(true)}
              className="min-h-11 gap-2 border-[#182339] bg-[#0E1524] text-[#8A97AD] hover:text-white"
              aria-label="Buka palet perintah"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Cari perintah…</span>
              <kbd className="hidden rounded border border-[#182339] bg-[#080C14] px-1.5 py-0.5 text-[10px] sm:inline">
                Ctrl K
              </kbd>
            </Button>
          </div>
          {/* Navigasi mobile */}
          <nav
            className="flex gap-1 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden"
            aria-label="Navigasi utama mobile"
          >
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium",
                    active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-[#8A97AD] hover:bg-[#182339]",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {!supabaseEnv && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 md:px-6">
            <p className="flex flex-wrap items-center gap-2 text-xs leading-relaxed text-amber-200">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>
                <strong>Mode Demo Lokal</strong> — Supabase belum terhubung
                (proyek masih paused). Data tersimpan di browser ini saja
                (localStorage <code>nexcreator-v5</code>), tanpa secret apa pun.
              </span>
              {sampleLoaded && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto min-h-8 border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
                  onClick={() => {
                    clearSample();
                    pushToast({ title: "Data contoh dihapus" });
                  }}
                >
                  Hapus data contoh
                </Button>
              )}
            </p>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
          {children}
        </main>

        <footer className="border-t border-[#182339] px-4 py-4 text-center text-[11px] text-[#8A97AD] md:px-6">
          NexCreator AI V5 · Fase A — script + production pack + jadwal manual.
          Posting akhir dilakukan lewat aplikasi TikTok. Tidak ada metrik yang
          dipalsukan: semua angka berlabel Real / Manual / Estimasi.
        </footer>
      </div>

      <CmdPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
