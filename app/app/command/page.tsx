"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Clapperboard,
  Database,
  FileText,
  Package,
  PenLine,
  Play,
  Radar,
  Send,
  Trophy,
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProvenanceChip } from "@/components/app/ProvenanceChip";
import { EmptyState } from "@/components/app/EmptyState";
import { useNexStore } from "@/lib/store";
import { rp, num } from "@/lib/format";
import { commissionRp, SCHEDULE_SLOTS } from "@/lib/types";
import { generateLocalScript } from "@/lib/atm";
import { MONTHLY_TARGET_RP } from "@/lib/types";

type SetupResponse = {
  supabase: boolean;
  gemini: boolean;
  telegram: boolean;
};

const PIPELINE: { label: string; desc: string; state: string; tone: string }[] = [
  { label: "Hunter — riset produk", desc: "Produk + komisi + skor viral dari data kamu.", state: "Jalan", tone: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" },
  { label: "Script ATM", desc: "Generator lokal 6 archetype + Gemini bila key diset.", state: "Jalan", tone: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" },
  { label: "Studio — production pack", desc: "Preview 9:16 + export JSON/TXT, rakit di CapCut.", state: "Jalan", tone: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" },
  { label: "Voice + lip-sync", desc: "F5-TTS / LivePortrait belum terhubung — simulasi ritme caption saja.", state: "Manual", tone: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10" },
  { label: "Render video GPU", desc: "Butuh worker di luar Vercel — Fase B, setelah komisi Rp500.000 pertama.", state: "Belum", tone: "text-amber-300 border-amber-500/40 bg-amber-500/10" },
  { label: "Auto-post TikTok", desc: "Posting akhir manual via aplikasi TikTok.", state: "Manual", tone: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10" },
];

export default function CommandPage() {
  const products = useNexStore((s) => s.products);
  const scripts = useNexStore((s) => s.scripts);
  const queue = useNexStore((s) => s.queue);
  const snapshots = useNexStore((s) => s.snapshots);
  const sampleLoaded = useNexStore((s) => s.sampleLoaded);
  const loadSample = useNexStore((s) => s.loadSample);
  const addScript = useNexStore((s) => s.addScript);
  const addQueue = useNexStore((s) => s.addQueue);
  const pushToast = useNexStore((s) => s.pushToast);

  const { data: setup } = useQuery<SetupResponse>({
    queryKey: ["setup"],
    queryFn: async () => {
      const r = await fetch("/api/setup");
      if (!r.ok) throw new Error("setup gagal");
      return r.json();
    },
    staleTime: 60_000,
  });

  const winning = products.filter((p) => p.isWinning);
  const queued = queue.filter((q) =>
    ["DRAFT", "QUEUED_RENDER", "RENDERING", "READY_TO_POST"].includes(q.status),
  );
  const posted = queue.filter((q) => q.status === "POSTED");
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthCommission = snapshots
    .filter((s) => s.date.startsWith(monthKey))
    .reduce((a, s) => a + s.commissionRp, 0);
  const topProduct = [...products].sort((a, b) => b.viralScore - a.viralScore)[0];

  const triggerBatch = () => {
    if (winning.length === 0) {
      pushToast({
        title: "Belum ada produk winning",
        message: "Tandai minimal 1 produk sebagai winning di Hunter dulu.",
        error: true,
      });
      return;
    }
    const product = [...winning].sort((a, b) => b.viralScore - a.viralScore)[0];
    const draft = generateLocalScript(product, "POV");
    const script = addScript(draft);
    const title = `#Batch_${product.name.split(" ").slice(0, 3).join("_")}`;
    addQueue({
      title,
      productName: product.name,
      characterName: "Rania Putri",
      account: "@kamar.estetik.id",
      scheduleTime: SCHEDULE_SLOTS[0],
      status: "DRAFT",
      views: 0,
      scriptId: script.id,
    });
    pushToast({
      title: "Batch dibuat",
      message: `Draft naskah POV untuk "${product.name}" + 1 item antrean DRAFT. Lanjutkan di Script / Studio.`,
    });
  };

  const stats = [
    {
      icon: Package,
      label: "Produk terdata",
      value: num(products.length),
      sub: `${winning.length} winning`,
      href: "/app/hunter",
    },
    {
      icon: FileText,
      label: "Draft naskah",
      value: num(scripts.length),
      sub: "tersimpan lokal",
      href: "/app/script",
    },
    {
      icon: CalendarClock,
      label: "Antrean aktif",
      value: num(queued.length),
      sub: `${posted.length} sudah posting`,
      href: "/app/publisher",
    },
    {
      icon: BarChart3,
      label: "Komisi bulan ini",
      value: rp(monthCommission),
      sub: `target ${rp(MONTHLY_TARGET_RP)}`,
      href: "/app/analytics",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="mt-1 text-sm text-[#8A97AD]">
            Ringkasan nyata dari data kamu — bukan simulasi. Semua angka di
            bawah ini dihitung dari database lokal.
          </p>
        </div>
        <Button
          onClick={triggerBatch}
          className="min-h-11 bg-emerald-500 text-[#04150D] hover:bg-emerald-400"
        >
          <Play className="h-4 w-4" /> Trigger Content Batch
        </Button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full border-[#182339] bg-[#0E1524] transition-colors hover:border-emerald-500/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-emerald-400" />
                  <ProvenanceChip value="Real" />
                </div>
                <p className="mt-3 text-xl font-bold leading-tight">{s.value}</p>
                <p className="mt-0.5 text-xs font-medium text-[#8A97AD]">{s.label}</p>
                <p className="text-[11px] text-[#8A97AD]">{s.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <EmptyState
          icon={<Radar className="h-6 w-6" />}
          title="Belum ada produk"
          description="Mulai dari Hunter: tambah produk TikTok Shop pertama kamu, atau muat data contoh untuk melihat cara kerja studio ini."
          actionLabel="Muat data contoh"
          onAction={() => {
            loadSample();
            pushToast({ title: "Data contoh dimuat", message: "Semua item contoh berlabel Contoh dan bisa dihapus." });
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status setup */}
        <Card className="border-[#182339] bg-[#0E1524]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-cyan-400" /> Status setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Supabase", ok: setup?.supabase, hint: setup?.supabase ? "Terhubung — data tersimpan per akun (RLS)." : "Belum diset — Mode Demo Lokal, restore proyek dulu di dashboard Supabase." },
              { label: "Gemini", ok: setup?.gemini, hint: setup?.gemini ? "Terhubung — generator pakai gemini-2.5-flash." : "Belum diset — generator lokal tetap jalan." },
              { label: "Telegram", ok: setup?.telegram, hint: setup?.telegram ? "Terhubung — laporan bisa dikirim." : "Belum diset — laporan hanya preview." },
            ].map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3 border-b border-[#182339] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{row.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#8A97AD]">{row.hint}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    row.ok
                      ? "shrink-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "shrink-0 border-[#182339] bg-[#080C14] text-[#8A97AD]"
                  }
                >
                  {row.ok ? "Terhubung" : "Belum diset"}
                </Badge>
              </div>
            ))}
            {sampleLoaded && (
              <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                <CircleAlert className="h-4 w-4 shrink-0" />
                Data contoh sedang aktif — hapus dari banner atas bila sudah selesai mencoba.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Produk fokus */}
        <Card className="border-[#182339] bg-[#0E1524]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-amber-400" /> Produk fokus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProduct ? (
              <div className="space-y-3 text-sm">
                <p className="font-semibold leading-snug">{topProduct.name}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[#080C14] p-2.5">
                    <p className="text-base font-bold text-emerald-300">{topProduct.viralScore}</p>
                    <p className="text-[11px] text-[#8A97AD]">Skor viral</p>
                  </div>
                  <div className="rounded-lg bg-[#080C14] p-2.5">
                    <p className="text-base font-bold">{rp(commissionRp(topProduct))}</p>
                    <p className="text-[11px] text-[#8A97AD]">Komisi / unit</p>
                  </div>
                  <div className="rounded-lg bg-[#080C14] p-2.5">
                    <p className="text-base font-bold">{num(topProduct.sold7d)}</p>
                    <p className="text-[11px] text-[#8A97AD]">Terjual 7 hari</p>
                  </div>
                </div>
                <p className="text-xs italic leading-relaxed text-[#8A97AD]">
                  “{topProduct.competitorHook || "Belum ada hook kompetitor."}”
                </p>
                <Button asChild variant="outline" className="min-h-11 w-full border-[#182339] bg-[#080C14] hover:bg-[#182339]">
                  <Link href={`/app/script?product=${topProduct.id}`}>
                    <PenLine className="h-4 w-4" /> Racik naskah untuk produk ini
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[#8A97AD]">
                Belum ada produk. Tambah produk pertama di Hunter.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline jujur */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="text-base">Pipeline — apa yang nyata, apa yang belum</CardTitle>
          <p className="text-xs text-[#8A97AD]">
            Tidak ada animasi “24/7” di V5. Setiap tahap berlabel jujur.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {PIPELINE.map((p) => (
            <div key={p.label} className="flex items-start justify-between gap-3 rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#8A97AD]">{p.desc}</p>
              </div>
              <Badge variant="outline" className={`shrink-0 ${p.tone}`}>{p.state}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pintasan */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { href: "/app/hunter", icon: Radar, label: "Hunter" },
          { href: "/app/script", icon: PenLine, label: "Script ATM" },
          { href: "/app/studio", icon: Clapperboard, label: "Studio 9:16" },
          { href: "/app/publisher", icon: Send, label: "Kirim Laporan" },
        ].map((l) => (
          <Button
            key={l.href}
            asChild
            variant="outline"
            className="min-h-12 border-[#182339] bg-[#0E1524] text-[#E8EEF7] hover:bg-[#182339]"
          >
            <Link href={l.href}>
              <l.icon className="h-4 w-4 text-emerald-400" /> {l.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
