"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  Download,
  FileText,
  Heart,
  MessageCircle,
  Play,
  Send,
  Share2,
  Square,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/EmptyState";
import { ProvenanceChip } from "@/components/app/ProvenanceChip";
import { useNexStore } from "@/lib/store";
import {
  ACCOUNTS,
  PERSONAS,
  SCHEDULE_SLOTS,
  type ScheduleSlot,
} from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-[#182339] bg-[#182339]/60 text-[#8A97AD]",
  QUEUED_RENDER: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  RENDERING: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  READY_TO_POST: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  POSTED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  FAILED: "border-red-500/40 bg-red-500/10 text-red-300",
};

const selectCls =
  "h-11 w-full rounded-lg border border-[#182339] bg-[#0E1524] px-3 text-sm text-[#E8EEF7] outline-none focus:border-emerald-500";

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function StudioPage() {
  const router = useRouter();
  const scripts = useNexStore((s) => s.scripts);
  const products = useNexStore((s) => s.products);
  const queue = useNexStore((s) => s.queue);
  const addQueue = useNexStore((s) => s.addQueue);
  const updateQueue = useNexStore((s) => s.updateQueue);
  const pushToast = useNexStore((s) => s.pushToast);

  const [scriptId, setScriptId] = useState("");
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [account, setAccount] = useState(ACCOUNTS[0].handle);
  const [slot, setSlot] = useState<ScheduleSlot>(SCHEDULE_SLOTS[0]);
  const [playing, setPlaying] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [dispatching, setDispatching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const script = scripts.find((s) => s.id === scriptId) ?? scripts[0] ?? null;
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];
  const product = script
    ? products.find((p) => p.id === script.productId)
    : undefined;

  const captionText = useMemo(() => {
    if (!script) return "";
    return [script.hook, script.body, script.demo, script.cta]
      .filter(Boolean)
      .join(" ");
  }, [script]);

  const words = useMemo(
    () => captionText.split(/\s+/).filter(Boolean),
    [captionText],
  );

  // Simulasi ritme caption: ~400 ms/kata (≈150 kata/menit).
  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setWordIdx((i) => {
        if (i + 1 >= words.length) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 400);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, words.length]);

  useEffect(() => {
    setWordIdx(0);
    setPlaying(false);
  }, [scriptId]);

  const relatedQueue = script
    ? queue.filter((q) => q.scriptId === script.id)
    : [];

  const initials = persona.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const handlePlay = () => {
    if (words.length === 0) return;
    if (wordIdx >= words.length - 1) setWordIdx(0);
    setPlaying((p) => !p);
  };

  const buildPack = () => {
    if (!script) return null;
    return {
      app: "NexCreator V5",
      jenis: "production-pack",
      produk: product
        ? { nama: product.name, hargaRp: product.price, komisiPct: product.commissionPct }
        : { nama: script.productName },
      persona: { nama: persona.name, role: persona.role, pitch: persona.pitch },
      naskah: {
        arketipe: script.archetype,
        hook: script.hook,
        body: script.body,
        demo: script.demo,
        cta: script.cta,
      },
      shotList: [
        { rentang: "0-3 detik", isi: "Hook — " + script.hook },
        { rentang: "3-15 detik", isi: "Body — " + script.body },
        { rentang: "15-25 detik", isi: "Demo produk — " + script.demo },
        { rentang: "25-30 detik", isi: "CTA — " + script.cta },
      ],
      akun: account,
      jadwal: slot,
      catatan: "Render & posting dilakukan manual (Phase A).",
    };
  };

  const handleDownloadJson = () => {
    const pack = buildPack();
    if (!pack || !script) return;
    downloadFile(
      `nexcreator-pack-${script.productName.replace(/\s+/g, "-").toLowerCase()}.json`,
      JSON.stringify(pack, null, 2),
      "application/json",
    );
    pushToast({ title: "Production pack JSON diunduh" });
  };

  const handleDownloadTxt = () => {
    if (!script) return;
    const txt = [
      `NEXCREATOR V5 — NASKAH VIDEO`,
      `Produk: ${script.productName}`,
      `Persona: ${persona.name} (${persona.role})`,
      `Akun: ${account} — Jadwal: ${slot} WIB`,
      ``,
      `HOOK (0-3 detik):`,
      script.hook,
      ``,
      `BODY (3-15 detik):`,
      script.body,
      ``,
      `DEMO (15-25 detik):`,
      script.demo,
      ``,
      `CTA (25-30 detik):`,
      script.cta,
      ``,
      `INSTRUKSI B-ROLL:`,
      `- 0-3 dtk: close-up produk + teks hook besar di tengah layar.`,
      `- 3-15 dtk: potongan masalah sehari-hari, lalu produk masuk frame.`,
      `- 15-25 dtk: demo fungsi produk dari dekat, tangan terlihat jelas.`,
      `- 25-30 dtk: produk + harga/komisi di layar, ajakan klik keranjang kuning.`,
      ``,
      `CHECKLIST POSTING MANUAL:`,
      `[ ] Video sudah di-render & dicek suaranya`,
      `[ ] Caption + hashtag disalin dari naskah ini`,
      `[ ] Keranjang kuning / tautan produk terpasang`,
      `[ ] Posting di jam ${slot} WIB lewat aplikasi TikTok`,
      `[ ] Setelah posting, tandai "Sudah Posting" di menu Publisher`,
    ].join("\n");
    downloadFile(
      `nexcreator-naskah-${script.productName.replace(/\s+/g, "-").toLowerCase()}.txt`,
      txt,
      "text/plain",
    );
    pushToast({ title: "Naskah .txt diunduh" });
  };

  const handleDispatch = async () => {
    if (!script || dispatching) return;
    setDispatching(true);
    const title = `Video ${script.productName}`;
    let item = queue.find((q) => q.scriptId === script.id);
    if (!item) {
      item = addQueue({
        title,
        productName: script.productName,
        characterName: persona.name,
        account,
        scheduleTime: slot,
        status: "DRAFT",
        views: 0,
        scriptId: script.id,
      });
    }
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueItemId: item.id,
          title: item.title,
          productName: item.productName,
        }),
      });
    } catch {
      // API job belum tentu tersedia — antrean lokal tetap dicatat.
    } finally {
      updateQueue(item.id, { status: "QUEUED_RENDER" });
      pushToast({
        title: "Job antre render (QUEUED_RENDER) — render GPU belum berjalan, ini antrean saja",
      });
      setDispatching(false);
    }
  };

  if (scripts.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-[#E8EEF7]">Studio</h1>
          <p className="mt-1 text-sm text-[#8A97AD]">
            Preview video 9:16, simulasi ritme caption, dan production pack.
          </p>
        </div>
        <EmptyState
          icon={<Clapperboard className="size-6" />}
          title="Belum ada naskah"
          description="Buat naskah dulu di menu Script (ATM) sebelum masuk Studio."
          actionLabel="Buat Naskah"
          onAction={() => router.push("/app/script")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold text-[#E8EEF7]">Studio</h1>
        <p className="mt-1 text-sm text-[#8A97AD]">
          Preview video 9:16, simulasi ritme caption, dan production pack.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Pengaturan */}
        <div className="space-y-6">
          <Card className="border-[#182339] bg-[#0E1524]">
            <CardHeader>
              <CardTitle className="text-[#E8EEF7]">Pengaturan Video</CardTitle>
              <CardDescription>Pilih naskah, persona, akun, dan slot jadwal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="script">Naskah</Label>
                <select
                  id="script"
                  className={selectCls}
                  value={script?.id ?? ""}
                  onChange={(e) => setScriptId(e.target.value)}
                >
                  {scripts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.productName} — {s.archetype} (skor {s.score})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="persona">Persona</Label>
                  <select
                    id="persona"
                    className={selectCls}
                    value={personaId}
                    onChange={(e) => setPersonaId(e.target.value)}
                  >
                    {PERSONAS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Akun TikTok</Label>
                  <select
                    id="account"
                    className={selectCls}
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                  >
                    {ACCOUNTS.map((a) => (
                      <option key={a.handle} value={a.handle}>
                        {a.handle} ({a.niche})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot">Slot Jadwal</Label>
                <select
                  id="slot"
                  className={selectCls}
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as ScheduleSlot)}
                >
                  {SCHEDULE_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s} WIB
                    </option>
                  ))}
                </select>
              </div>
              {script && (
                <div className="space-y-2 rounded-lg border border-[#182339] bg-[#080C14] p-3 text-sm">
                  <p><span className="font-semibold text-emerald-400">Hook:</span> <span className="text-[#E8EEF7]">{script.hook}</span></p>
                  <p><span className="font-semibold text-emerald-400">Body:</span> <span className="text-[#E8EEF7]">{script.body}</span></p>
                  <p><span className="font-semibold text-emerald-400">Demo:</span> <span className="text-[#E8EEF7]">{script.demo}</span></p>
                  <p><span className="font-semibold text-emerald-400">CTA:</span> <span className="text-[#E8EEF7]">{script.cta}</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulasi ritme caption */}
          <Card className="border-[#182339] bg-[#0E1524]">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-[#E8EEF7]">
                Simulasi Ritme Caption
                <ProvenanceChip value="Manual" />
              </CardTitle>
              <CardDescription>
                Simulasi ritme — BUKAN TTS asli (F5-TTS belum terhubung). Kata
                disorot satu per satu dengan tempo ±150 kata/menit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={handlePlay} disabled={words.length === 0} className="min-h-11">
                  {playing ? <Square className="size-4" /> : <Play className="size-4" />}
                  {playing ? "Stop" : "Play"}
                </Button>
                <span className="text-sm text-[#8A97AD]">
                  {words.length === 0
                    ? "Tidak ada kata."
                    : `Kata ${Math.min(wordIdx + 1, words.length)} dari ${words.length}`}
                </span>
              </div>
              <p className="text-base leading-relaxed">
                {words.map((w, i) => (
                  <span
                    key={i}
                    className={
                      i === wordIdx && playing
                        ? "rounded bg-emerald-500/30 px-0.5 font-semibold text-emerald-300"
                        : i < wordIdx
                          ? "text-[#E8EEF7]"
                          : "text-[#8A97AD]"
                    }
                  >
                    {w}{" "}
                  </span>
                ))}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleDownloadJson} disabled={!script} className="min-h-11">
                  <Download className="size-4" /> Unduh JSON
                </Button>
                <Button variant="outline" onClick={handleDownloadTxt} disabled={!script} className="min-h-11">
                  <FileText className="size-4" /> Unduh .txt
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-[#8A97AD]">
                JSON berisi produk, persona, naskah 4 segmen, shot list
                0-3s / 3-15s / 15-25s / 25-30s, akun, dan jadwal. File .txt berisi
                naskah, instruksi B-roll, dan checklist posting manual.
              </p>
            </CardContent>
          </Card>

          {/* Dispatch */}
          <Card className="border-[#182339] bg-[#0E1524]">
            <CardHeader>
              <CardTitle className="text-[#E8EEF7]">Render Job</CardTitle>
              <CardDescription>
                Masukkan video ke antrean render. Render GPU belum berjalan —
                ini antrean saja.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleDispatch} disabled={!script || dispatching} className="min-h-11 w-full sm:w-auto">
                <Send className="size-4" /> Dispatch Render Job
              </Button>
              {relatedQueue.length > 0 ? (
                <ul className="space-y-2">
                  {relatedQueue.map((q) => (
                    <li
                      key={q.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#182339] bg-[#080C14] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#E8EEF7]">{q.title}</p>
                        <p className="text-xs text-[#8A97AD]">
                          {q.account} · {q.scheduleTime} WIB · {q.characterName}
                        </p>
                      </div>
                      <Badge variant="outline" className={STATUS_STYLE[q.status] ?? ""}>
                        {q.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#8A97AD]">
                  Belum ada antrean dari naskah ini.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview 9:16 */}
        <div className="mx-auto w-full max-w-[320px] lg:mx-0">
          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-[#182339] bg-gradient-to-b from-[#182339] via-[#0E1524] to-[#080C14]">
            {/* Avatar */}
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-[#04150D]">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#E8EEF7]">{persona.name}</p>
                <p className="text-[11px] text-[#8A97AD]">{persona.role}</p>
              </div>
            </div>
            {/* Hook */}
            <div className="absolute left-3 right-16 top-16">
              <p className="text-base font-bold leading-snug text-[#E8EEF7] drop-shadow">
                {script?.hook ?? ""}
              </p>
            </div>
            {/* Zona ikon kanan (safe zone) */}
            <div className="absolute bottom-32 right-2 flex flex-col items-center gap-4 rounded-lg border border-dashed border-amber-400/70 bg-amber-400/5 px-1.5 py-3">
              <Heart className="size-5 text-[#E8EEF7]" />
              <MessageCircle className="size-5 text-[#E8EEF7]" />
              <Share2 className="size-5 text-[#E8EEF7]" />
              <span className="w-10 text-center text-[9px] leading-tight text-amber-300">
                Zona ikon
              </span>
            </div>
            {/* Caption kata-per-kata */}
            <div className="absolute inset-x-3 bottom-20">
              <p className="text-sm leading-relaxed">
                {words.map((w, i) => (
                  <span
                    key={i}
                    className={
                      i === wordIdx && playing
                        ? "rounded bg-emerald-500 px-0.5 font-semibold text-[#04150D]"
                        : "text-[#E8EEF7]"
                    }
                  >
                    {w}{" "}
                  </span>
                ))}
              </p>
            </div>
            {/* Zona bawah (safe zone) */}
            <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-amber-400/70 bg-amber-400/5 px-3 py-2">
              <p className="text-xs font-semibold text-[#E8EEF7]">{account}</p>
              <p className="text-[11px] text-[#8A97AD]">
                {script?.productName ?? ""} · {slot} WIB
              </p>
              <p className="mt-1 text-[10px] font-semibold text-amber-300">
                Safe zone — jangan taruh teks penting di sini
              </p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs leading-relaxed text-[#8A97AD]">
            <Video className="size-3.5 shrink-0" />
            Preview 9:16. Garis putus-putus amber = safe zone TikTok: zona ikon
            kanan dan zona username + caption di bawah.
          </p>
        </div>
      </div>
    </div>
  );
}
