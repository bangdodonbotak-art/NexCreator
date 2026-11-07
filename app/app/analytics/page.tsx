"use client";

import { useMemo, useState } from "react";
import { BarChart3, Calculator, Trash2, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/EmptyState";
import { ProvenanceChip } from "@/components/app/ProvenanceChip";
import { useNexStore } from "@/lib/store";
import { num, pct, rp, todayWib } from "@/lib/format";
import { MONTHLY_TARGET_RP } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "#0E1524",
  border: "1px solid #182339",
  borderRadius: "8px",
  color: "#E8EEF7",
  fontSize: "12px",
} as const;

export default function AnalyticsPage() {
  const snapshots = useNexStore((s) => s.snapshots);
  const sampleLoaded = useNexStore((s) => s.sampleLoaded);
  const addSnapshot = useNexStore((s) => s.addSnapshot);
  const deleteSnapshot = useNexStore((s) => s.deleteSnapshot);
  const loadSample = useNexStore((s) => s.loadSample);
  const clearSample = useNexStore((s) => s.clearSample);
  const pushToast = useNexStore((s) => s.pushToast);

  const [date, setDate] = useState(todayWib());
  const [commission, setCommission] = useState("");
  const [orders, setOrders] = useState("");
  const [views, setViews] = useState("");
  const [formError, setFormError] = useState("");

  // Kalkulator estimasi
  const [estViews, setEstViews] = useState("10000");
  const [estCtr, setEstCtr] = useState("2");
  const [estCvr, setEstCvr] = useState("3");
  const [estPrice, setEstPrice] = useState("80000");
  const [estCommPct, setEstCommPct] = useState("15");

  const monthKey = todayWib().slice(0, 7);
  const monthSnapshots = useMemo(
    () => snapshots.filter((s) => s.date.startsWith(monthKey)),
    [snapshots, monthKey],
  );
  const totalCommission = monthSnapshots.reduce((a, s) => a + s.commissionRp, 0);
  const totalOrders = monthSnapshots.reduce((a, s) => a + s.orders, 0);
  const totalViews = monthSnapshots.reduce((a, s) => a + s.views, 0);
  const progress = Math.min(100, (totalCommission / MONTHLY_TARGET_RP) * 100);

  const chartData = useMemo(
    () =>
      [...monthSnapshots]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => ({
          tanggal: s.date.slice(5),
          komisi: s.commissionRp,
          order: s.orders,
        })),
    [monthSnapshots],
  );

  const est = useMemo(() => {
    const v = Number(estViews) || 0;
    const ctr = Number(estCtr) || 0;
    const cvr = Number(estCvr) || 0;
    const price = Number(estPrice) || 0;
    const comm = Number(estCommPct) || 0;
    const klik = v * (ctr / 100);
    const order = klik * (cvr / 100);
    const komisiHarian = order * price * (comm / 100);
    return { klik, order, komisiHarian, komisiBulanan: komisiHarian * 30 };
  }, [estViews, estCtr, estCvr, estPrice, estCommPct]);

  const handleSubmit = () => {
    setFormError("");
    const c = Number(commission);
    const o = Number(orders);
    const v = Number(views);
    if (!date) {
      setFormError("Tanggal wajib diisi.");
      return;
    }
    if (![c, o, v].every((n) => Number.isFinite(n) && n >= 0)) {
      setFormError("Komisi, order, dan views harus angka 0 atau lebih.");
      return;
    }
    addSnapshot({ date, commissionRp: Math.round(c), orders: Math.round(o), views: Math.round(v) });
    pushToast({ title: "Data harian tersimpan", message: `${date} — ${rp(c)}` });
    setCommission("");
    setOrders("");
    setViews("");
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold text-[#E8EEF7]">Analytics</h1>
        <p className="mt-1 text-sm text-[#8A97AD]">
          Komisi nyata dari input manual harian + kalkulator estimasi.
        </p>
      </div>

      {/* Form input harian */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-[#E8EEF7]">
            Input Harian <ProvenanceChip value="Manual" />
          </CardTitle>
          <CardDescription>
            Input harian (dari TikTok Seller Center). Data ini input manual —
            satu-satunya sumber komisi nyata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="an-date">Tanggal</Label>
              <Input
                id="an-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="an-commission">Komisi (Rp)</Label>
              <Input
                id="an-commission"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="0"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="an-orders">Jumlah Order</Label>
              <Input
                id="an-orders"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="0"
                value={orders}
                onChange={(e) => setOrders(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="an-views">Views</Label>
              <Input
                id="an-views"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="0"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                className="min-h-11"
              />
            </div>
          </div>
          {formError && (
            <p className="text-sm text-red-400">{formError}</p>
          )}
          <Button onClick={handleSubmit} className="min-h-11">
            Simpan Data Harian
          </Button>
        </CardContent>
      </Card>

      {/* Ringkasan bulan berjalan */}
      {monthSnapshots.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="size-6" />}
          title="Belum ada data bulan ini — input manual harian di atas"
          description="Ringkasan dan grafik bulan berjalan akan muncul setelah ada snapshot dari input harian."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="border-[#182339] bg-[#0E1524]">
              <CardContent className="pt-4">
                <p className="text-xs text-[#8A97AD]">Total Komisi ({monthKey})</p>
                <p className="mt-1 text-lg font-bold text-[#E8EEF7]">{rp(totalCommission)}</p>
                <ProvenanceChip value="Manual" className="mt-2" />
              </CardContent>
            </Card>
            <Card className="border-[#182339] bg-[#0E1524]">
              <CardContent className="pt-4">
                <p className="text-xs text-[#8A97AD]">Total Order</p>
                <p className="mt-1 text-lg font-bold text-[#E8EEF7]">{num(totalOrders)}</p>
                <ProvenanceChip value="Manual" className="mt-2" />
              </CardContent>
            </Card>
            <Card className="border-[#182339] bg-[#0E1524]">
              <CardContent className="pt-4">
                <p className="text-xs text-[#8A97AD]">Total Views</p>
                <p className="mt-1 text-lg font-bold text-[#E8EEF7]">{num(totalViews)}</p>
                <ProvenanceChip value="Manual" className="mt-2" />
              </CardContent>
            </Card>
            <Card className="border-[#182339] bg-[#0E1524]">
              <CardContent className="pt-4">
                <p className="text-xs text-[#8A97AD]">Target {rp(MONTHLY_TARGET_RP)}/bulan</p>
                <p className="mt-1 text-lg font-bold text-emerald-400">{pct(progress)}</p>
                <ProvenanceChip value="Manual" className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#182339] bg-[#0E1524]">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8A97AD]">Progress ke target bulanan</span>
                <span className="font-semibold text-[#E8EEF7]">
                  {rp(totalCommission)} / {rp(MONTHLY_TARGET_RP)} ({pct(progress)})
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#182339]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chart dari snapshot nyata */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#182339] bg-[#0E1524]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#E8EEF7]">
                  <TrendingUp className="size-5 text-emerald-400" /> Komisi per Hari
                </CardTitle>
                <CardDescription>Data nyata dari snapshot manual bulan ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke="#182339" strokeDasharray="3 3" />
                      <XAxis dataKey="tanggal" stroke="#8A97AD" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8A97AD" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => num(v)} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string) => [rp(Number(v)), "Komisi"]} />
                      <Line type="monotone" dataKey="komisi" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#182339] bg-[#0E1524]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#E8EEF7]">
                  <BarChart3 className="size-5 text-cyan-400" /> Order per Hari
                </CardTitle>
                <CardDescription>Data nyata dari snapshot manual bulan ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke="#182339" strokeDasharray="3 3" />
                      <XAxis dataKey="tanggal" stroke="#8A97AD" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8A97AD" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string) => [num(Number(v)), "Order"]} />
                      <Bar dataKey="order" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Kalkulator estimasi */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-[#E8EEF7]">
            <Calculator className="size-5 text-amber-400" />
            Kalkulator Estimasi (bukan data nyata)
            <ProvenanceChip value="Estimasi" />
          </CardTitle>
          <CardDescription>
            Simulasi hitungan kasar dari asumsi yang kamu isi — bukan data nyata
            dan bukan janji penghasilan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="est-views">Views / hari</Label>
              <Input id="est-views" type="number" min={0} inputMode="numeric" value={estViews} onChange={(e) => setEstViews(e.target.value)} className="min-h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-ctr">CTR (%)</Label>
              <Input id="est-ctr" type="number" min={0} max={100} inputMode="decimal" value={estCtr} onChange={(e) => setEstCtr(e.target.value)} className="min-h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-cvr">CVR (%)</Label>
              <Input id="est-cvr" type="number" min={0} max={100} inputMode="decimal" value={estCvr} onChange={(e) => setEstCvr(e.target.value)} className="min-h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-price">Harga rata-rata (Rp)</Label>
              <Input id="est-price" type="number" min={0} inputMode="numeric" value={estPrice} onChange={(e) => setEstPrice(e.target.value)} className="min-h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-comm">% Komisi</Label>
              <Input id="est-comm" type="number" min={0} max={100} inputMode="decimal" value={estCommPct} onChange={(e) => setEstCommPct(e.target.value)} className="min-h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Klik / hari</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{num(est.klik)}</p>
              <ProvenanceChip value="Estimasi" className="mt-1" />
            </div>
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Order / hari</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{est.order.toLocaleString("id-ID", { maximumFractionDigits: 1 })}</p>
              <ProvenanceChip value="Estimasi" className="mt-1" />
            </div>
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Komisi / hari</p>
              <p className="mt-1 font-semibold text-[#E8EEF7]">{rp(est.komisiHarian)}</p>
              <ProvenanceChip value="Estimasi" className="mt-1" />
            </div>
            <div className="rounded-lg border border-[#182339] bg-[#080C14] p-3">
              <p className="text-xs text-[#8A97AD]">Estimasi komisi / bulan</p>
              <p className="mt-1 font-semibold text-amber-300">{rp(est.komisiBulanan)}</p>
              <ProvenanceChip value="Estimasi" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daftar snapshot */}
      <Card className="border-[#182339] bg-[#0E1524]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[#E8EEF7]">Riwayat Snapshot</CardTitle>
            <CardDescription>{snapshots.length} snapshot tersimpan (semua bulan).</CardDescription>
          </div>
          {snapshots.length === 0 && !sampleLoaded ? (
            <Button variant="outline" onClick={loadSample} className="min-h-11">
              Muat contoh
            </Button>
          ) : sampleLoaded ? (
            <Button variant="outline" onClick={clearSample} className="min-h-11">
              Hapus data contoh
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="size-6" />}
              title="Belum ada snapshot"
              description="Isi form input harian di atas, atau muat data contoh untuk melihat tampilan grafik."
              actionLabel="Muat contoh"
              onAction={loadSample}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#182339] text-left text-[#8A97AD]">
                    <th className="px-2 py-2 font-medium">Tanggal</th>
                    <th className="px-2 py-2 font-medium">Komisi</th>
                    <th className="px-2 py-2 font-medium">Order</th>
                    <th className="px-2 py-2 font-medium">Views</th>
                    <th className="px-2 py-2 font-medium">Sumber</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {[...snapshots]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((s) => (
                      <tr key={s.id} className="border-b border-[#182339] last:border-0">
                        <td className="px-2 py-2 text-[#E8EEF7]">{s.date}</td>
                        <td className="px-2 py-2 text-[#E8EEF7]">{rp(s.commissionRp)}</td>
                        <td className="px-2 py-2 text-[#E8EEF7]">{num(s.orders)}</td>
                        <td className="px-2 py-2 text-[#E8EEF7]">{num(s.views)}</td>
                        <td className="px-2 py-2">
                          {s.isSample ? (
                            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300">
                              Contoh
                            </Badge>
                          ) : (
                            <ProvenanceChip value="Manual" />
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSnapshot(s.id)}
                            className="min-h-11"
                            aria-label={`Hapus snapshot ${s.date}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
