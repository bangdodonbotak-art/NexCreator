"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronRight,
  ClipboardPaste,
  FlaskConical,
  Package,
  Save,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/app/EmptyState";
import { useNexStore } from "@/lib/store";
import { ARCHETYPES, type Archetype } from "@/lib/types";
import {
  BANNED_CLAIMS,
  checkCompliance,
  generateLocalScript,
  hookVariants,
  scoreScriptText,
} from "@/lib/atm";
import { num, rp } from "@/lib/format";

type Source = "local" | "gemini" | "argon";

const SOURCE_CHIP: Record<Source, { label: string; className: string }> = {
  local: {
    label: "Lokal",
    className: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  },
  gemini: {
    label: "Gemini 2.5-flash",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  },
  argon: {
    label: "Argon (manual)",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
};

interface Segs {
  hook: string;
  body: string;
  demo: string;
  cta: string;
}

const EMPTY_SEGS: Segs = { hook: "", body: "", demo: "", cta: "" };

const SEGMENTS: { key: keyof Segs; label: string; time: string }[] = [
  { key: "hook", label: "Hook", time: "0–3 detik" },
  { key: "body", label: "Pain / Body", time: "3–15 detik" },
  { key: "demo", label: "Demo", time: "15–25 detik" },
  { key: "cta", label: "CTA", time: "25–30 detik" },
];

const URGENCY_RE = /sekarang|sebelum (habis|promo|kehabisan)|hari ini|stok (tipis|menipis|habis)|jangan sampai|terbatas|cepat|buruan|promo/i;

function wordCount(t: string) {
  return t.split(/\s+/).filter(Boolean).length;
}

/** Pecah teks berlabel "Hook:/Body:/Demo:/CTA:" menjadi 4 segmen. */
function parseLabeledText(text: string): Segs | null {
  const labels: { key: keyof Segs; re: RegExp }[] = [
    { key: "hook", re: /^hook\s*[:\-]/i },
    { key: "body", re: /^(body|pain|pain\s*\/\s*body)\s*[:\-]/i },
    { key: "demo", re: /^demo\s*[:\-]/i },
    { key: "cta", re: /^(cta|call to action)\s*[:\-]/i },
  ];
  const out: Segs = { ...EMPTY_SEGS };
  let current: keyof Segs | null = null;
  let found = false;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const hit = labels.find((l) => l.re.test(trimmed));
    if (hit) {
      current = hit.key;
      found = true;
      out[current] = trimmed
        .replace(hit.re, "")
        .replace(/^["“”']+|["“”']+$/g, "")
        .trim();
    } else if (current) {
      out[current] = out[current] ? `${out[current]} ${trimmed}` : trimmed;
    }
  }
  if (!found) return null;
  if (!out.hook && !out.body && !out.demo && !out.cta) return null;
  return out;
}

/** Ambil objek JSON {hook,body,demo,cta} dari teks — blok {...} di mana saja. */
function parseScriptJson(text: string): Segs | null {
  const candidates: string[] = [];
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) candidates.push(braceMatch[0]);
  candidates.push(text.trim());
  for (const c of candidates) {
    try {
      const obj = JSON.parse(c);
      if (
        obj &&
        typeof obj === "object" &&
        (typeof obj.hook === "string" ||
          typeof obj.body === "string" ||
          typeof obj.demo === "string" ||
          typeof obj.cta === "string")
      ) {
        return {
          hook: String(obj.hook ?? ""),
          body: String(obj.body ?? ""),
          demo: String(obj.demo ?? ""),
          cta: String(obj.cta ?? ""),
        };
      }
    } catch {
      // lanjut ke kandidat / parser label berikutnya
    }
  }
  return null;
}

function ScriptPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = useNexStore((s) => s.products);
  const scripts = useNexStore((s) => s.scripts);
  const addScript = useNexStore((s) => s.addScript);
  const deleteScript = useNexStore((s) => s.deleteScript);
  const pushToast = useNexStore((s) => s.pushToast);

  const preselectId = searchParams.get("product") ?? "";
  const [productId, setProductId] = useState(() =>
    products.some((p) => p.id === preselectId) ? preselectId : "",
  );
  const [archetype, setArchetype] = useState<Archetype>("POV");
  const [segs, setSegs] = useState<Segs>(EMPTY_SEGS);
  const [source, setSource] = useState<Source>("local");
  const [argonText, setArgonText] = useState("");
  const [geminiBusy, setGeminiBusy] = useState(false);
  const [geminiNote, setGeminiNote] = useState("");

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const { score, violations } = useMemo(
    () => scoreScriptText(segs),
    [segs],
  );
  const compliance = useMemo(
    () => checkCompliance([segs.hook, segs.body, segs.demo, segs.cta].join(" ")),
    [segs],
  );
  const hookWords = wordCount(segs.hook);
  const hasCart = /keranjang kuning/i.test(segs.cta);
  const hasUrgency = URGENCY_RE.test(segs.cta) || URGENCY_RE.test(segs.body);
  const checks = [
    { label: `Hook maksimal 16 kata (saat ini ${hookWords} kata)`, ok: hookWords > 0 && hookWords <= 16 },
    { label: "CTA menyebut “Keranjang Kuning”", ok: hasCart },
    { label: "Ada unsur urgensi (sekarang / stok tipis / promo)", ok: hasUrgency },
    { label: "Bebas klaim berlebihan", ok: compliance.passed },
  ];

  const variants = useMemo(
    () => (product ? hookVariants(product) : []),
    [product],
  );

  function applySegs(next: Segs, src: Source) {
    setSegs(next);
    setSource(src);
  }

  function handleLocal() {
    if (!product) return;
    const gen = generateLocalScript(product, archetype);
    applySegs(
      { hook: gen.hook, body: gen.body, demo: gen.demo, cta: gen.cta },
      "local",
    );
    setGeminiNote("");
    pushToast({ title: "Naskah diracik (lokal)", message: "Template lokal terisi ke 4 segmen." });
  }

  async function handleGemini() {
    if (!product) return;
    const archetypeMeta = ARCHETYPES.find((a) => a.id === archetype);
    const prompt = [
      "Buatkan naskah video TikTok Shop 30 detik (metode ATM: amati-tiru-modifikasi) dalam Bahasa Indonesia santai.",
      `Produk: ${product.name} — harga ${rp(product.price)}, kategori ${product.category}, terjual ${num(product.sold7d)} unit dalam 7 hari.`,
      `Archetype: ${archetypeMeta?.label ?? archetype} — ${archetypeMeta?.desc ?? ""}.`,
      product.competitorHook
        ? `Hook kompetitor sebagai referensi (jangan disalin mentah-mentah, modifikasi): "${product.competitorHook}"`
        : "",
      "Struktur wajib: hook 0-3 detik (maksimal 16 kata), body 3-15 detik (masalah), demo 15-25 detik (bukti), CTA 25-30 detik (sebut 'Keranjang Kuning' + urgensi).",
      `JANGAN pakai klaim berlebihan ini: ${BANNED_CLAIMS.map((b) => b.label).join(", ")}.`,
      "Jawab HANYA dengan JSON valid, tanpa teks lain: {\"hook\": \"...\", \"body\": \"...\", \"demo\": \"...\", \"cta\": \"...\"}",
    ]
      .filter(Boolean)
      .join("\n");
    setGeminiBusy(true);
    setGeminiNote("");
    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        if (res.status === 503) {
          setGeminiNote(
            "GEMINI_API_KEY belum diset — mode lokal tetap jalan.",
          );
          pushToast({
            title: "GEMINI_API_KEY belum diset — mode lokal tetap jalan",
            message: "Naskah diisi dari generator lokal.",
            error: true,
          });
        } else {
          setGeminiNote(
            `Gemini tidak bisa dipakai sekarang (HTTP ${res.status}) — mode lokal tetap jalan.`,
          );
          pushToast({
            title: "Gemini gagal, pakai mode lokal",
            message: `Server menjawab HTTP ${res.status}. Naskah diisi dari generator lokal.`,
            error: true,
          });
        }
        handleLocal();
        return;
      }
      const data = await res.json().catch(() => null);
      const text =
        typeof data === "string"
          ? data
          : (data?.text ?? data?.result ?? data?.output ?? data?.response ?? "");
      const parsed = parseScriptJson(String(text)) ?? parseLabeledText(String(text));
      if (!parsed || (!parsed.hook && !parsed.body && !parsed.demo && !parsed.cta)) {
        setGeminiNote(
          "Jawaban Gemini tidak bisa dipahami — mode lokal tetap jalan.",
        );
        pushToast({
          title: "Jawaban Gemini tidak bisa dipahami",
          message: "Naskah diisi dari generator lokal.",
          error: true,
        });
        handleLocal();
        return;
      }
      applySegs(parsed, "gemini");
      pushToast({ title: "Naskah diracik dengan Gemini 2.5-flash" });
    } catch {
      setGeminiNote("Gagal menghubungi Gemini — mode lokal tetap jalan.");
      pushToast({
        title: "Gagal menghubungi Gemini",
        message: "Naskah diisi dari generator lokal.",
        error: true,
      });
      handleLocal();
    } finally {
      setGeminiBusy(false);
    }
  }

  function handleArgon() {
    const raw = argonText.trim();
    if (!raw) {
      pushToast({ title: "Kolom Argon masih kosong", message: "Tempel dulu hasil dari Gemini Argon.", error: true });
      return;
    }
    const parsed = parseScriptJson(raw) ?? parseLabeledText(raw);
    if (!parsed || (!parsed.hook && !parsed.body && !parsed.demo && !parsed.cta)) {
      pushToast({
        title: "Hasil Argon tidak bisa dipahami",
        message: "Tempel JSON {hook, body, demo, cta} atau teks berlabel Hook:/Body:/Demo:/CTA:.",
        error: true,
      });
      return;
    }
    applySegs(parsed, "argon");
    pushToast({ title: "Hasil Argon diterapkan", message: "4 segmen terisi dari tempelan manual." });
  }

  function handleSave() {
    if (!product) return;
    if (!segs.hook.trim() || !segs.body.trim() || !segs.demo.trim() || !segs.cta.trim()) {
      pushToast({
        title: "Naskah belum lengkap",
        message: "Isi keempat segmen (Hook, Body, Demo, CTA) sebelum menyimpan.",
        error: true,
      });
      return;
    }
    addScript({
      productId: product.id,
      productName: product.name,
      archetype,
      hook: segs.hook,
      body: segs.body,
      demo: segs.demo,
      cta: segs.cta,
      score,
      source,
    });
    pushToast({
      title: "Naskah disimpan",
      message: `${product.name} · ${ARCHETYPES.find((a) => a.id === archetype)?.label ?? archetype} · skor ${score}.`,
    });
  }

  function loadSaved(id: string) {
    const s = scripts.find((x) => x.id === id);
    if (!s) return;
    if (products.some((p) => p.id === s.productId)) setProductId(s.productId);
    setArchetype(s.archetype);
    applySegs({ hook: s.hook, body: s.body, demo: s.demo, cta: s.cta }, s.source);
    window.scrollTo({ top: 0, behavior: "smooth" });
    pushToast({ title: "Naskah dimuat ke editor", message: s.productName });
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <EmptyState
          icon={<Package className="size-6" />}
          title="Belum ada produk untuk dibuatkan naskah"
          description="Tambah produk dulu di Hunter — atau muat contoh produk — baru racik naskahnya di sini."
          actionLabel="Buka Hunter"
          onAction={() => router.push("/app/hunter")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-[#E8EEF7] sm:text-2xl">
          Racik Naskah (ATM)
        </h1>
        <p className="mt-1 text-sm text-[#8A97AD]">
          Pilih produk dan archetype, lalu racik naskah 30 detik. Semua naskah
          tersimpan lokal di perangkatmu — tidak ada yang otomatis terposting.
        </p>
      </div>

      {/* Pilih produk */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="text-[#E8EEF7]">1. Pilih produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
            <SelectTrigger className="min-h-11 w-full border-[#182339] bg-[#080C14] text-[#E8EEF7]">
              <SelectValue placeholder="Pilih produk…" />
            </SelectTrigger>
            <SelectContent className="border-[#182339] bg-[#0E1524] text-[#E8EEF7]">
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {rp(p.price)} · terjual {num(p.sold7d)}/7 hari
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {product && (
            <p className="text-sm text-[#8A97AD]">
              {product.name} · {product.category} · {rp(product.price)} ·
              komisi {num(product.commissionPct)}% · skor viral {product.viralScore}
              {product.competitorHook ? (
                <span className="mt-1 block text-xs">
                  Hook kompetitor: “{product.competitorHook}”
                </span>
              ) : null}
            </p>
          )}
          {!product && (
            <p className="text-sm text-amber-300">
              Pilih produk dulu untuk mulai meracik naskah.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pilih archetype */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="text-[#E8EEF7]">2. Pilih archetype</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHETYPES.map((a) => {
              const active = archetype === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setArchetype(a.id)}
                  aria-pressed={active}
                  className={`min-h-11 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-[#182339] bg-[#080C14] hover:border-[#2A3B5C]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#E8EEF7]">
                      {a.label}
                    </span>
                    {active && <Check className="size-4 shrink-0 text-emerald-400" />}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#8A97AD]">
                    {a.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Segmen naskah */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-[#E8EEF7]">3. Naskah 30 detik</CardTitle>
          <Badge variant="outline" className={SOURCE_CHIP[source].className}>
            Sumber: {SOURCE_CHIP[source].label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 bg-emerald-500 text-[#04150D] hover:bg-emerald-400"
              onClick={handleLocal}
              disabled={!product}
            >
              <Wand2 className="size-4" /> Racik Naskah (Lokal)
            </Button>
            <Button
              variant="outline"
              className="min-h-11 border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
              onClick={handleGemini}
              disabled={!product || geminiBusy}
            >
              <Sparkles className="size-4" />
              {geminiBusy ? "Meracik dengan Gemini…" : "Racik dengan Gemini"}
            </Button>
          </div>
          {geminiNote && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              {geminiNote}
            </p>
          )}
          {SEGMENTS.map((seg) => (
            <div key={seg.key} className="grid gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor={`seg-${seg.key}`} className="text-[#E8EEF7]">
                  {seg.label}{" "}
                  <span className="font-normal text-[#8A97AD]">
                    ({seg.time})
                  </span>
                </Label>
                <span className="text-xs text-[#8A97AD]">
                  {wordCount(segs[seg.key])} kata
                </span>
              </div>
              <textarea
                id={`seg-${seg.key}`}
                value={segs[seg.key]}
                onChange={(e) =>
                  setSegs({ ...segs, [seg.key]: e.target.value })
                }
                rows={seg.key === "hook" ? 2 : 3}
                placeholder={
                  seg.key === "hook"
                    ? "Tulis hook yang bikin orang berhenti scroll…"
                    : seg.key === "body"
                      ? "Ceritakan masalah yang dialami penonton…"
                      : seg.key === "demo"
                        ? "Tunjukkan bukti / cara pakai produk…"
                        : "Ajak penonton cek Keranjang Kuning…"
                }
                className="w-full rounded-lg border border-[#182339] bg-[#080C14] px-3 py-2 text-sm leading-relaxed text-[#E8EEF7] outline-none placeholder:text-[#8A97AD] focus:border-emerald-500/60"
              />
            </div>
          ))}

          {/* Skor kepatuhan & kualitas */}
          <div className="rounded-xl border border-[#182339] bg-[#080C14] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#E8EEF7]">
                Skor kepatuhan &amp; kualitas
              </h3>
              <span
                className={`text-2xl font-bold ${
                  score >= 80
                    ? "text-emerald-400"
                    : score >= 60
                      ? "text-cyan-400"
                      : "text-amber-400"
                }`}
              >
                {score}
                <span className="text-sm text-[#8A97AD]"> / 100</span>
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2 text-sm">
                  {c.ok ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-amber-400" />
                  )}
                  <span className={c.ok ? "text-[#E8EEF7]" : "text-[#8A97AD]"}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
            {violations.length > 0 && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
                <p className="text-sm font-medium text-red-300">
                  Klaim berlebihan terdeteksi:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-red-300">
                  {violations.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3 text-xs text-[#8A97AD]">
              Skor dihitung dari isi naskah di atas (kepatuhan, panjang hook,
              CTA, dan jumlah kata). Bukan janji performa video.
            </p>
          </div>

          <Button
            className="min-h-11 w-full bg-emerald-500 text-[#04150D] hover:bg-emerald-400 sm:w-auto"
            onClick={handleSave}
            disabled={!product}
          >
            <Save className="size-4" /> Simpan Naskah
          </Button>
        </CardContent>
      </Card>

      {/* Hook Lab A/B */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#E8EEF7]">
            <FlaskConical className="size-5 text-cyan-400" /> Hook Lab A/B
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!product ? (
            <p className="text-sm text-[#8A97AD]">
              Pilih produk dulu untuk membuat varian hook.
            </p>
          ) : (
            <ul className="space-y-2">
              {variants.map((v, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-lg border border-[#182339] bg-[#080C14] px-3 py-2.5"
                >
                  <p className="text-sm leading-relaxed text-[#E8EEF7]">
                    <span className="mr-2 font-semibold text-cyan-400">
                      V{i + 1}
                    </span>
                    {v}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-11 shrink-0 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
                    onClick={() => {
                      setSegs((s) => ({ ...s, hook: v }));
                      pushToast({ title: `Hook V${i + 1} dipakai`, message: "Segmen hook diganti." });
                    }}
                  >
                    Pakai
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-[#8A97AD]">
            Varian dibuat dari data produkmu (nama, harga, terjual 7 hari).
            Uji satu per satu, jangan pakai semuanya sekaligus.
          </p>
        </CardContent>
      </Card>

      {/* Tempel hasil Argon */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#E8EEF7]">
            <ClipboardPaste className="size-5 text-amber-400" />
            Tempel hasil Argon (manual)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#8A97AD]">
            Paste hasil dari Gemini Argon di aplikasi Gemini — bisa berupa JSON{" "}
            <code className="rounded bg-[#182339] px-1 py-0.5 text-xs text-[#E8EEF7]">
              {"{hook, body, demo, cta}"}
            </code>{" "}
            atau teks berlabel Hook:/Body:/Demo:/CTA:. Naskah ditempel manual,
            bukan diambil otomatis dari akunmu.
          </p>
          <textarea
            value={argonText}
            onChange={(e) => setArgonText(e.target.value)}
            rows={7}
            placeholder={'{"hook": "...", "body": "...", "demo": "...", "cta": "..."}'}
            className="w-full rounded-lg border border-[#182339] bg-[#080C14] px-3 py-2 font-mono text-sm leading-relaxed text-[#E8EEF7] outline-none placeholder:text-[#8A97AD] focus:border-amber-500/60"
          />
          <Button
            className="min-h-11 bg-amber-500 text-[#1A1200] hover:bg-amber-400"
            onClick={handleArgon}
          >
            Terapkan hasil Argon
          </Button>
        </CardContent>
      </Card>

      {/* Daftar naskah tersimpan */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="text-[#E8EEF7]">
            Naskah tersimpan ({scripts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scripts.length === 0 ? (
            <p className="text-sm text-[#8A97AD]">
              Belum ada naskah tersimpan. Racik lalu simpan naskah pertamamu di
              atas.
            </p>
          ) : (
            <ul className="space-y-2">
              {scripts.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-[#182339] bg-[#080C14] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#E8EEF7]">
                        {s.productName}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#8A97AD]">
                        <span>
                          {ARCHETYPES.find((a) => a.id === s.archetype)?.label ??
                            s.archetype}
                        </span>
                        <span>·</span>
                        <span>Skor {s.score}/100</span>
                        <Badge
                          variant="outline"
                          className={SOURCE_CHIP[s.source].className}
                        >
                          {SOURCE_CHIP[s.source].label}
                        </Badge>
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#8A97AD]">
                        “{s.hook}”
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-11 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
                        onClick={() => loadSaved(s.id)}
                      >
                        Muat <ChevronRight className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        className="min-h-11 min-w-11"
                        aria-label={`Hapus naskah ${s.productName}`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Hapus naskah untuk "${s.productName}"?`,
                            )
                          ) {
                            deleteScript(s.id);
                            pushToast({ title: "Naskah dihapus", message: s.productName });
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ScriptPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-[#8A97AD] sm:px-6">
          Memuat editor naskah…
        </div>
      }
    >
      <ScriptPageInner />
    </Suspense>
  );
}
