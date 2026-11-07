import { NextResponse } from "next/server";
import { snapshotSchema } from "@/lib/schemas";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET  /api/metrics/snapshot — daftar snapshot komisi (Supabase bila
 *        terkonfigurasi + login; bila tidak, mode demo-lokal, array kosong).
 * POST /api/metrics/snapshot — simpan snapshot manual harian. Bila Supabase
 *        tidak terkonfigurasi / belum login -> 503 demo-lokal; client
 *        menyimpan ke localStorage sebagai fallback.
 */
export async function GET() {
  const sb = await createServerSupabase();
  if (!sb) {
    return NextResponse.json({
      mode: "demo-local",
      snapshots: [],
      note: "Supabase belum diset — data tersimpan lokal di browser.",
    });
  }
  const { data, error } = await sb
    .from("financial_snapshots")
    .select("id, snapshot_date, commission_rp, orders, views, created_at")
    .order("snapshot_date", { ascending: true })
    .limit(365);
  if (error) {
    return NextResponse.json({
      mode: "supabase",
      snapshots: [],
      error: error.message,
      note: "Jalankan migrasi V5 di Supabase SQL Editor bila tabel belum ada.",
    });
  }
  return NextResponse.json({ mode: "supabase", snapshots: data ?? [] });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = snapshotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Snapshot tidak valid.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const sb = await createServerSupabase();
  if (!sb) {
    return NextResponse.json(
      {
        error: "Supabase belum diset — simpan lokal (Mode Demo Lokal).",
        mode: "demo-local",
      },
      { status: 503 },
    );
  }
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Belum login — snapshot Supabase butuh sesi Supabase Auth." },
      { status: 401 },
    );
  }
  const { data, error } = await sb
    .from("financial_snapshots")
    .insert({
      user_id: user.id,
      snapshot_date: parsed.data.date,
      commission_rp: parsed.data.commissionRp,
      orders: parsed.data.orders,
      views: parsed.data.views,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data?.id ?? null }, { status: 201 });
}
