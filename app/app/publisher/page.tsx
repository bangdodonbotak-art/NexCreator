"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/EmptyState";
import { ProvenanceChip } from "@/components/app/ProvenanceChip";
import { useNexStore } from "@/lib/store";
import { num, rp, todayWib } from "@/lib/format";
import {
  ACCOUNTS,
  PERSONAS,
  SCHEDULE_SLOTS,
  VIDEO_STATUSES,
  type ScheduleSlot,
  type VideoStatus,
} from "@/lib/types";

const STATUS_STYLE: Record<VideoStatus, string> = {
  DRAFT: "border-[#182339] bg-[#182339]/60 text-[#8A97AD]",
  QUEUED_RENDER: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  RENDERING: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  READY_TO_POST: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  POSTED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  FAILED: "border-red-500/40 bg-red-500/10 text-red-300",
};

const selectCls =
  "h-11 w-full rounded-lg border border-[#182339] bg-[#0E1524] px-3 text-sm text-[#E8EEF7] outline-none focus:border-emerald-500";

/** Posisi slot dalam garis 24 jam (persen dari kiri). */
const slotPct = (slot: ScheduleSlot) => {
  const [h, m] = slot.split(":").map(Number);
  return (((h + m / 60) / 24) * 100).toFixed(1);
};

type Filter = "ALL" | VideoStatus;

export default function PublisherPage() {
  const queue = useNexStore((s) => s.queue);
  const products = useNexStore((s) => s.products);
  const snapshots = useNexStore((s) => s.snapshots);
  const addQueue = useNexStore((s) => s.addQueue);
  const updateQueue = useNexStore((s) => s.updateQueue);
  const deleteQueue = useNexStore((s) => s.deleteQueue);
  const pushToast = useNexStore((s) => s.pushToast);

  const [filter, setFilter] = useState<Filter>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formProduct, setFormProduct] = useState("");
  const [formPersona, setFormPersona] = useState(PERSONAS[0].id);
  const [formAccount, setFormAccount] = useState(ACCOUNTS[0].handle);
  const [formSlot, setFormSlot] = useState<ScheduleSlot>(SCHEDULE_SLOTS[0]);
  const [sending, setSending] = useState(false);
  const [telegramError, setTelegramError] = useState("");

  const filtered = filter === "ALL" ? queue : queue.filter((q) => q.status === filter);

  const monthKey = todayWib().slice(0, 7);
  const monthSnapshots = useMemo(
    () => snapshots.filter((s) => s.date.startsWith(monthKey)),
    [snapshots, monthKey],
  );
  const monthCommission = monthSnapshots.reduce((a, s) => a + s.commissionRp, 0);
  const monthViews = monthSnapshots.reduce((a, s) => a + s.views, 0);
  const postedCount = queue.filter((q) => q.status === "POSTED").length;

  const reportText = [
    `Laporan NexCreator V5 — ${monthKey}`,
    `Komisi bulan ini: ${rp(monthCommission)} (input manual)`,
    `Total views (manual): ${num(monthViews)}`,
    `Video sudah posting: ${postedCount}`,
    `Total antrean: ${queue.length}`,
    `Sumber: data nyata dari DB lokal (input manual).`,
    `Posting akhir tetap manual lewat aplikasi TikTok.`,
  ].join("\n");

  const handleMarkPosted = (id: string, views: number) => {
    let v = views;
    if (v === 0) {
      const raw = window.prompt("Masukkan jumlah views manual (angka, minimal 0):", "0");
      if (raw === null) return;
      const parsed = Number(raw.replace(/[^\d]/g, ""));
      if (!Number.isFinite(parsed) || parsed < 0) {
        pushToast({ title: "Views tidak valid", message: "Masukkan angka 0 atau lebih.", error: true });
        return;
      }
      v = parsed;
    }
    updateQueue(id, { status: "POSTED", views: v });
    pushToast({ title: "Ditandai sudah posting", message: `Views manual: ${num(v)}` });
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Hapus "${title}" dari antrean?`)) return;
    deleteQueue(id);
    pushToast({ title: "Item antrean dihapus" });
  };

  const handleAdd = () => {
    const product = products.find((p) => p.id === formProduct) ?? products[0];
    if (!product) {
      pushToast({ title: "Belum ada produk", message: "Tambah produk dulu di menu Hunter.", error: true });
      return;
    }
    const persona = PERSONAS.find((p) => p.id === formPersona) ?? PERSONAS[0];
    addQueue({
      title: `Video ${product.name}`,
      productName: product.name,
      characterName: persona.name,
      account: formAccount,
      scheduleTime: formSlot,
      status: "DRAFT",
      views: 0,
    });
    pushToast({ title: "Ditambah ke antrean", message: `Video ${product.name} — status DRAFT` });
    setShowForm(false);
  };

  const handleSendTelegram = async () => {
    setSending(true);
    setTelegramError("");
    try {
      const res = await fetch("/api/telegram/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reportText }),
      });
      if (res.status === 503) {
        const msg = "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset di server";
        setTelegramError(msg);
        pushToast({ title: msg, error: true });
        return;
      }
      if (!res.ok) {
        setTelegramError(`Gagal mengirim laporan (HTTP ${res.status}).`);
        pushToast({ title: "Gagal mengirim laporan Telegram", error: true });
        return;
      }
      pushToast({ title: "Laporan terkirim ke Telegram" });
    } catch {
      setTelegramError("Tidak bisa menghubungi server — periksa koneksi / route /api/telegram/dispatch.");
      pushToast({ title: "Gagal mengirim laporan Telegram", error: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold text-[#E8EEF7]">Publisher</h1>
        <p className="mt-1 text-sm text-[#8A97AD]">
          Antrean video, jadwal posting, dan laporan Telegram.
        </p>
      </div>

      {/* Peringatan permanen */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <p className="text-sm font-medium leading-relaxed text-amber-200">
          Posting akhir tetap manual lewat aplikasi TikTok — NexCreator V5 belum
          auto-post.
        </p>
      </div>

      {/* Timeline jadwal 24 jam */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#E8EEF7]">
            <CalendarClock className="size-5 text-cyan-400" /> Timeline Jadwal
          </CardTitle>
          <CardDescription>Slot posting harian: 12:15, 17:30, dan 20:00 WIB.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-16">
            <div className="absolute inset-x-0 top-6 h-1 rounded-full bg-[#182339]" />
            {SCHEDULE_SLOTS.map((s) => (
              <div
                key={s}
                className="absolute top-0 -translate-x-1/2 text-center"
                style={{ left: `${slotPct(s)}%` }}
              >
                <span className="text-xs font-semibold text-cyan-300">{s}</span>
                <div className="mx-auto mt-1 size-3.5 rounded-full border-2 border-cyan-400 bg-[#080C14]" />
              </div>
            ))}
            {queue.map((q) => (
              <div
                key={q.id}
                title={`${q.title} — ${q.scheduleTime} WIB (${q.status})`}
                className="absolute top-10 size-3 -translate-x-1/2 rounded-full bg-emerald-500"
                style={{ left: `${slotPct(q.scheduleTime)}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-[#8A97AD]">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
          <p className="mt-2 text-xs text-[#8A97AD]">
            Titik hijau = video yang dijadwalkan. Arahkan kursor untuk melihat judulnya.
          </p>
        </CardContent>
      </Card>

      {/* Antrean */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[#E8EEF7]">Antrean Video</CardTitle>
            <CardDescription>{queue.length} item di antrean.</CardDescription>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="min-h-11">
            <Plus className="size-4" /> Tambah ke antrean
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter status */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filter === "ALL" ? "default" : "outline"}
              onClick={() => setFilter("ALL")}
              className="min-h-11"
            >
              Semua ({queue.length})
            </Button>
            {VIDEO_STATUSES.map((st) => (
              <Button
                key={st.id}
                size="sm"
                variant={filter === st.id ? "default" : "outline"}
                onClick={() => setFilter(st.id)}
                className="min-h-11"
              >
                {st.label} ({queue.filter((q) => q.status === st.id).length})
              </Button>
            ))}
          </div>

          {/* Form tambah */}
          {showForm && (
            <div className="space-y-4 rounded-lg border border-[#182339] bg-[#080C14] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pub-product">Produk</Label>
                  <select
                    id="pub-product"
                    className={selectCls}
                    value={formProduct || products[0]?.id || ""}
                    onChange={(e) => setFormProduct(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pub-persona">Persona</Label>
                  <select
                    id="pub-persona"
                    className={selectCls}
                    value={formPersona}
                    onChange={(e) => setFormPersona(e.target.value)}
                  >
                    {PERSONAS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pub-account">Akun TikTok</Label>
                  <select
                    id="pub-account"
                    className={selectCls}
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                  >
                    {ACCOUNTS.map((a) => (
                      <option key={a.handle} value={a.handle}>{a.handle} ({a.niche})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pub-slot">Slot Jadwal</Label>
                  <select
                    id="pub-slot"
                    className={selectCls}
                    value={formSlot}
                    onChange={(e) => setFormSlot(e.target.value as ScheduleSlot)}
                  >
                    {SCHEDULE_SLOTS.map((s) => (
                      <option key={s} value={s}>{s} WIB</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-[#8A97AD]">
                Judul otomatis: <span className="font-medium text-[#E8EEF7]">Video {(products.find((p) => p.id === formProduct) ?? products[0])?.name ?? "—"}</span>
              </p>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="min-h-11">
                  <Plus className="size-4" /> Simpan ke Antrean (DRAFT)
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="min-h-11">
                  Batal
                </Button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="size-6" />}
              title={queue.length === 0 ? "Antrean masih kosong" : "Tidak ada item dengan status ini"}
              description={
                queue.length === 0
                  ? "Buat naskah di Script lalu dispatch dari Studio, atau tambah manual lewat tombol di atas."
                  : "Coba filter status lain."
              }
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((q) => (
                <li key={q.id} className="rounded-lg border border-[#182339] bg-[#080C14] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[#E8EEF7]">{q.title}</p>
                      <p className="mt-0.5 text-sm text-[#8A97AD]">
                        {q.productName} · {q.characterName} · {q.account} · {q.scheduleTime} WIB
                      </p>
                      {q.status === "POSTED" && q.views > 0 && (
                        <p className="mt-1.5 flex items-center gap-2 text-sm text-[#E8EEF7]">
                          {num(q.views)} views <ProvenanceChip value="Manual" />
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={STATUS_STYLE[q.status]}>
                      {VIDEO_STATUSES.find((s) => s.id === q.status)?.label ?? q.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.status !== "POSTED" && (
                      <Button size="sm" onClick={() => handleMarkPosted(q.id, q.views)} className="min-h-11">
                        <CheckCircle2 className="size-4" /> Tandai Sudah Posting
                      </Button>
                    )}
                    {q.status !== "FAILED" && (
                      <Button size="sm" variant="outline" onClick={() => updateQueue(q.id, { status: "FAILED" })} className="min-h-11">
                        <XCircle className="size-4" /> Tandai Gagal
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(q.id, q.title)} className="min-h-11">
                      <Trash2 className="size-4" /> Hapus
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Laporan Telegram */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-[#E8EEF7]">
            Laporan Telegram <ProvenanceChip value="Manual" />
          </CardTitle>
          <CardDescription>
            Preview laporan bulan berjalan ({monthKey}) dari data nyata store.
            Label: Manual / Real (DB lokal).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-[#182339] bg-[#080C14] p-4 text-sm leading-relaxed text-[#E8EEF7]">
            {reportText}
          </pre>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Komisi bulan ini</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{rp(monthCommission)}</p>
              <ProvenanceChip value="Manual" className="mt-1" />
            </div>
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Total views</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{num(monthViews)}</p>
              <ProvenanceChip value="Manual" className="mt-1" />
            </div>
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Video POSTED</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{postedCount}</p>
              <ProvenanceChip value="Real" className="mt-1" />
            </div>
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Jumlah antrean</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{queue.length}</p>
              <ProvenanceChip value="Real" className="mt-1" />
            </div>
          </div>
          {telegramError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{telegramError}</span>
            </div>
          )}
          <Button onClick={handleSendTelegram} disabled={sending} className="min-h-11">
            <Send className="size-4" /> {sending ? "Mengirim…" : "Kirim ke Telegram"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
