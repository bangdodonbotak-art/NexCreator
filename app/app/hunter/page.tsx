"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Download,
  Flame,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProvenanceChip } from "@/components/app/ProvenanceChip";
import { EmptyState } from "@/components/app/EmptyState";
import { useNexStore } from "@/lib/store";
import { commissionRp, type Category, type Product } from "@/lib/types";
import { productSchema } from "@/lib/schemas";
import { clamp, num, rp } from "@/lib/format";

const CATEGORIES: ("ALL" | Category)[] = [
  "ALL",
  "Home",
  "Gadget",
  "Beauty",
  "Fashion",
  "Other",
];

type SortKey = "komisi" | "sold" | "viral" | "harga";

const SORT_LABELS: Record<SortKey, string> = {
  komisi: "Komisi Rp tertinggi",
  sold: "Terjual 7 hari",
  viral: "Skor viral",
  harga: "Harga",
};

/** Skor viral dihitung lokal dari data produk — bukan angka tetap. */
function calcViralScore(
  sold7d: number,
  commissionPct: number,
  price: number,
): number {
  return clamp(
    Math.round(
      50 +
        Math.log10(sold7d + 1) * 8 +
        commissionPct * 0.6 +
        (price < 100000 ? 6 : 0),
    ),
    40,
    99,
  );
}

interface FormState {
  name: string;
  category: Category;
  price: string;
  commissionPct: string;
  sold7d: string;
  competitorHook: string;
  sourceUrl: string;
  isWinning: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "Home",
  price: "",
  commissionPct: "",
  sold7d: "",
  competitorHook: "",
  sourceUrl: "",
  isWinning: false,
};

/** Parser CSV yang menangani tanda kutip, koma di dalam kutip, dan "" lolos. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function HunterPage() {
  const router = useRouter();
  const products = useNexStore((s) => s.products);
  const sampleLoaded = useNexStore((s) => s.sampleLoaded);
  const addProduct = useNexStore((s) => s.addProduct);
  const updateProduct = useNexStore((s) => s.updateProduct);
  const deleteProduct = useNexStore((s) => s.deleteProduct);
  const loadSample = useNexStore((s) => s.loadSample);
  const clearSample = useNexStore((s) => s.clearSample);
  const pushToast = useNexStore((s) => s.pushToast);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [sort, setSort] = useState<SortKey>("komisi");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = products.length;
    const avgViral =
      total === 0
        ? 0
        : Math.round(
            products.reduce((a, p) => a + p.viralScore, 0) / total,
          );
    const totalSold = products.reduce((a, p) => a + p.sold7d, 0);
    const maxCommission =
      total === 0 ? 0 : Math.max(...products.map((p) => commissionRp(p)));
    return { total, avgViral, totalSold, maxCommission };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.competitorHook.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "komisi")
      sorted.sort((a, b) => commissionRp(b) - commissionRp(a));
    else if (sort === "sold") sorted.sort((a, b) => b.sold7d - a.sold7d);
    else if (sort === "viral")
      sorted.sort((a, b) => b.viralScore - a.viralScore);
    else sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [products, query, category, sort]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      commissionPct: String(p.commissionPct),
      sold7d: String(p.sold7d),
      competitorHook: p.competitorHook,
      sourceUrl: p.sourceUrl,
      isWinning: p.isWinning,
    });
    setFormError("");
    setDialogOpen(true);
  }

  function handleSubmit() {
    const price = Number(form.price);
    const commissionPct = Number(form.commissionPct);
    const sold7d = Number(form.sold7d);
    const parsed = productSchema.safeParse({
      name: form.name,
      category: form.category,
      price,
      commissionPct,
      sold7d,
      viralScore: calcViralScore(sold7d, commissionPct, price),
      competitorHook: form.competitorHook,
      sourceUrl: form.sourceUrl,
      isWinning: form.isWinning,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setFormError(
        first ? `${first.path.join(".")}: ${first.message}` : "Data tidak valid.",
      );
      return;
    }
    if (editingId) {
      updateProduct(editingId, {
        ...parsed.data,
        viralScore:
          parsed.data.viralScore ?? calcViralScore(sold7d, commissionPct, price),
      });
      pushToast({ title: "Produk diperbarui", message: parsed.data.name });
    } else {
      const d = parsed.data;
      addProduct({
        name: d.name,
        category: d.category,
        price: d.price,
        commissionPct: d.commissionPct,
        sold7d: d.sold7d,
        viralScore:
          d.viralScore ?? calcViralScore(sold7d, commissionPct, price),
        competitorHook: d.competitorHook,
        sourceUrl: d.sourceUrl,
        isWinning: d.isWinning,
      });
      pushToast({ title: "Produk ditambahkan", message: parsed.data.name });
    }
    setDialogOpen(false);
  }

  function handleDelete(p: Product) {
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return;
    deleteProduct(p.id);
    pushToast({ title: "Produk dihapus", message: p.name });
  }

  function handleExport() {
    if (products.length === 0) {
      pushToast({ title: "Belum ada produk", message: "Tidak ada data untuk diekspor.", error: true });
      return;
    }
    const header = "name,category,price,commission_pct,sold_7d,viral_score,hook";
    const lines = products.map((p) =>
      [
        csvEscape(p.name),
        p.category,
        p.price,
        p.commissionPct,
        p.sold7d,
        p.viralScore,
        csvEscape(p.competitorHook),
      ].join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexcreator-produk.csv";
    a.click();
    URL.revokeObjectURL(url);
    pushToast({
      title: "CSV diekspor",
      message: `${products.length} produk diunduh sebagai nexcreator-produk.csv.`,
    });
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = parseCsv(text);
      if (rows.length < 2) {
        pushToast({
          title: "CSV kosong",
          message: "File harus berisi baris header dan minimal satu baris data.",
          error: true,
        });
        return;
      }
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const idx = (name: string) => header.indexOf(name);
      const iName = idx("name");
      const iCat = idx("category");
      const iPrice = idx("price");
      const iPct = idx("commission_pct");
      const iSold = idx("sold_7d");
      const iViral = idx("viral_score");
      const iHook = idx("hook");
      if ([iName, iCat, iPrice, iPct, iSold].some((i) => i < 0)) {
        pushToast({
          title: "Header CSV tidak lengkap",
          message:
            "Kolom wajib: name, category, price, commission_pct, sold_7d (opsional: viral_score, hook).",
          error: true,
        });
        return;
      }
      let added = 0;
      let failed = 0;
      for (const r of rows.slice(1)) {
        const price = Number((r[iPrice] ?? "").trim());
        const commissionPct = Number((r[iPct] ?? "").trim());
        const sold7d = Number((r[iSold] ?? "").trim());
        const viralRaw = iViral >= 0 ? (r[iViral] ?? "").trim() : "";
        const viralScore =
          viralRaw === ""
            ? calcViralScore(sold7d, commissionPct, price)
            : Number(viralRaw);
        const parsed = productSchema.safeParse({
          name: (r[iName] ?? "").trim(),
          category: (r[iCat] ?? "").trim(),
          price,
          commissionPct,
          sold7d,
          viralScore,
          competitorHook: iHook >= 0 ? (r[iHook] ?? "").trim() : "",
          sourceUrl: "",
          isWinning: false,
        });
        if (!parsed.success) {
          failed++;
          continue;
        }
        const d = parsed.data;
        addProduct({
          name: d.name,
          category: d.category,
          price: d.price,
          commissionPct: d.commissionPct,
          sold7d: d.sold7d,
          viralScore:
            d.viralScore ?? calcViralScore(sold7d, commissionPct, price),
          competitorHook: d.competitorHook,
          sourceUrl: d.sourceUrl,
          isWinning: d.isWinning,
        });
        added++;
      }
      pushToast({
        title: "Import CSV selesai",
        message: `${added} produk ditambahkan${failed > 0 ? `, ${failed} baris gagal dilewati karena tidak valid.` : "."}`,
        error: added === 0 && failed > 0,
      });
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#E8EEF7] sm:text-2xl">
            Hunter Produk
          </h1>
          <p className="mt-1 text-sm text-[#8A97AD]">
            Cari produk yang lagi laris, hitung komisi per unit, lalu ATM
            naskahnya. Semua angka di bawah dihitung dari data produkmu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleLoaded && (
            <Button
              variant="outline"
              className="min-h-11 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
              onClick={() => {
                clearSample();
                pushToast({ title: "Data contoh dihapus" });
              }}
            >
              <Trash2 className="size-4" /> Hapus data contoh
            </Button>
          )}
          <Button
            variant="outline"
            className="min-h-11 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" /> Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            className="min-h-11 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
            onClick={handleExport}
          >
            <Download className="size-4" /> Export CSV
          </Button>
          <Button className="min-h-11 bg-emerald-500 text-[#04150D] hover:bg-emerald-400" onClick={openAdd}>
            <Plus className="size-4" /> Tambah Produk
          </Button>
        </div>
      </div>

      {/* Statistik nyata dari data store */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-[#182339] bg-[#0E1524]">
          <CardContent className="space-y-1 pt-4">
            <div className="flex items-center gap-2 text-xs text-[#8A97AD]">
              <Package className="size-4 text-cyan-400" /> Total Produk
            </div>
            <p className="text-2xl font-bold text-[#E8EEF7]">{num(stats.total)}</p>
            <ProvenanceChip value="Real" />
          </CardContent>
        </Card>
        <Card className="border-[#182339] bg-[#0E1524]">
          <CardContent className="space-y-1 pt-4">
            <div className="flex items-center gap-2 text-xs text-[#8A97AD]">
              <Star className="size-4 text-amber-400" /> Rata-rata Skor Viral
            </div>
            <p className="text-2xl font-bold text-[#E8EEF7]">
              {products.length === 0 ? "—" : num(stats.avgViral)}
            </p>
            <ProvenanceChip value="Real" />
          </CardContent>
        </Card>
        <Card className="border-[#182339] bg-[#0E1524]">
          <CardContent className="space-y-1 pt-4">
            <div className="flex items-center gap-2 text-xs text-[#8A97AD]">
              <TrendingUp className="size-4 text-emerald-400" /> Total Terjual 7 Hari
            </div>
            <p className="text-2xl font-bold text-[#E8EEF7]">{num(stats.totalSold)}</p>
            <ProvenanceChip value="Real" />
          </CardContent>
        </Card>
        <Card className="border-[#182339] bg-[#0E1524]">
          <CardContent className="space-y-1 pt-4">
            <div className="flex items-center gap-2 text-xs text-[#8A97AD]">
              <Flame className="size-4 text-violet-400" /> Komisi/Unit Tertinggi
            </div>
            <p className="text-2xl font-bold text-[#E8EEF7]">
              {products.length === 0 ? "—" : rp(stats.maxCommission)}
            </p>
            <ProvenanceChip value="Real" />
          </CardContent>
        </Card>
      </div>

      {/* Pencarian, filter, sortir */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8A97AD]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama produk atau hook kompetitor…"
            className="min-h-11 border-[#182339] bg-[#0E1524] pl-9 text-[#E8EEF7] placeholder:text-[#8A97AD]"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as "ALL" | Category)}
        >
          <SelectTrigger className="min-h-11 w-full border-[#182339] bg-[#0E1524] text-[#E8EEF7] sm:w-40">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent className="border-[#182339] bg-[#0E1524] text-[#E8EEF7]">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "ALL" ? "Semua kategori" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="min-h-11 w-full border-[#182339] bg-[#0E1524] text-[#E8EEF7] sm:w-52">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent className="border-[#182339] bg-[#0E1524] text-[#E8EEF7]">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SORT_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title="Belum ada produk"
          description="Muat contoh produk untuk melihat cara kerja Hunter, atau tambah produk pertamamu sendiri."
          actionLabel="Muat contoh"
          onAction={() => {
            loadSample();
            pushToast({ title: "Data contoh dimuat", message: "5 produk contoh ditambahkan." });
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title="Tidak ada produk yang cocok"
          description="Coba ubah kata kunci pencarian atau filter kategorinya."
          actionLabel="Reset filter"
          onAction={() => {
            setQuery("");
            setCategory("ALL");
          }}
        />
      ) : (
        <Card className="border-[#182339] bg-[#0E1524]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#182339] hover:bg-transparent">
                <TableHead className="text-[#8A97AD]">Produk</TableHead>
                <TableHead className="text-[#8A97AD]">Harga</TableHead>
                <TableHead className="text-[#8A97AD]">Komisi</TableHead>
                <TableHead className="text-[#8A97AD]">Terjual 7h</TableHead>
                <TableHead className="text-[#8A97AD]">Skor Viral</TableHead>
                <TableHead className="text-[#8A97AD]">Winning</TableHead>
                <TableHead className="text-right text-[#8A97AD]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="border-[#182339]">
                  <TableCell className="max-w-55 whitespace-normal">
                    <p className="font-medium text-[#E8EEF7]">{p.name}</p>
                    <p className="mt-0.5 text-xs text-[#8A97AD]">
                      {p.category}
                      {p.sourceUrl ? (
                        <>
                          {" · "}
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 underline underline-offset-2"
                          >
                            Sumber
                          </a>
                        </>
                      ) : null}
                    </p>
                    {p.competitorHook && (
                      <p className="mt-1 line-clamp-2 text-xs text-[#8A97AD]">
                        “{p.competitorHook}”
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-[#E8EEF7]">{rp(p.price)}</TableCell>
                  <TableCell>
                    <p className="font-medium text-emerald-400">
                      {rp(commissionRp(p))}
                    </p>
                    <p className="text-xs text-[#8A97AD]">{num(p.commissionPct)}%</p>
                  </TableCell>
                  <TableCell className="text-[#E8EEF7]">{num(p.sold7d)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.viralScore >= 90
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : p.viralScore >= 75
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      }
                    >
                      {p.viralScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct(p.id, { isWinning: !p.isWinning })
                      }
                      className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium ${
                        p.isWinning
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          : "border-[#182339] text-[#8A97AD] hover:text-[#E8EEF7]"
                      }`}
                      aria-pressed={p.isWinning}
                      title={p.isWinning ? "Nonaktifkan winning" : "Tandai winning"}
                    >
                      <Flame className="size-3.5" />
                      {p.isWinning ? "Winning" : "Biasa"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        className="min-h-11 bg-emerald-500 text-[#04150D] hover:bg-emerald-400"
                        onClick={() => router.push(`/app/script?product=${p.id}`)}
                      >
                        ATM <ArrowRight className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="min-h-11 min-w-11 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="min-h-11 min-w-11"
                        onClick={() => handleDelete(p)}
                        aria-label={`Hapus ${p.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="text-xs text-[#8A97AD]">
        Menampilkan {num(filtered.length)} dari {num(products.length)} produk.
        Skor viral dihitung otomatis dari terjual 7 hari, % komisi, dan harga.
      </p>

      {/* Dialog tambah / edit produk */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#182339] bg-[#0E1524] text-[#E8EEF7] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
            <DialogDescription className="text-[#8A97AD]">
              Skor viral dihitung otomatis saat disimpan. Komisi Rp = harga × %
              komisi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="p-name">Nama produk</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Rak Susun Lipat Portabel"
                className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as Category })
                  }
                >
                  <SelectTrigger className="min-h-11 w-full border-[#182339] bg-[#080C14] text-[#E8EEF7]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#182339] bg-[#0E1524] text-[#E8EEF7]">
                    {(CATEGORIES.filter((c) => c !== "ALL") as Category[]).map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-price">Harga (Rp)</Label>
                <Input
                  id="p-price"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="85000"
                  className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="p-pct">Komisi (%)</Label>
                <Input
                  id="p-pct"
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  inputMode="decimal"
                  value={form.commissionPct}
                  onChange={(e) =>
                    setForm({ ...form, commissionPct: e.target.value })
                  }
                  placeholder="15"
                  className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7]"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-sold">Terjual 7 hari</Label>
                <Input
                  id="p-sold"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.sold7d}
                  onChange={(e) => setForm({ ...form, sold7d: e.target.value })}
                  placeholder="4210"
                  className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7]"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-hook">Hook kompetitor</Label>
              <Input
                id="p-hook"
                value={form.competitorHook}
                onChange={(e) =>
                  setForm({ ...form, competitorHook: e.target.value })
                }
                placeholder="Hook video kompetitor yang paling ramai"
                className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-url">URL sumber (opsional)</Label>
              <Input
                id="p-url"
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://…"
                className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7]"
              />
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#E8EEF7]">
              <input
                type="checkbox"
                checked={form.isWinning}
                onChange={(e) =>
                  setForm({ ...form, isWinning: e.target.checked })
                }
                className="size-4 accent-emerald-500"
              />
              Produk winning (paling berpotensi laku)
            </label>
            {formError && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {formError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="min-h-11 border-[#182339] bg-transparent text-[#E8EEF7] hover:bg-[#182339]"
              onClick={() => setDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="min-h-11 bg-emerald-500 text-[#04150D] hover:bg-emerald-400"
              onClick={handleSubmit}
            >
              {editingId ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
