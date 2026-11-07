import { NextResponse } from "next/server";
import { geminiGenerateSchema } from "@/lib/schemas";
import { checkCompliance } from "@/lib/atm";

/**
 * POST /api/gemini/generate — proxy server-side ke Gemini.
 * Model produksi: gemini-2.5-flash (Argon via API butuh billing — 429 free-tier 0,
 * jadi Argon hanya dipakai manual lewat aplikasi Gemini).
 * Tanpa GEMINI_API_KEY -> 503 yang jelas; client fallback ke generator lokal.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit: maksimal 10 permintaan per menit." },
      { status: 429 },
    );
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY belum diset di server. Generator lokal tetap bisa dipakai.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = geminiGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Prompt tidak valid (10–4000 karakter).", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: parsed.data.prompt }] }],
        }),
      },
    );
    if (!r.ok) {
      return NextResponse.json(
        { error: `Upstream Gemini ${r.status}. Coba lagi atau pakai generator lokal.` },
        { status: 502 },
      );
    }
    const d = await r.json();
    const text: string =
      d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const compliance = checkCompliance(text);
    return NextResponse.json({
      text,
      model,
      compliance: {
        score: compliance.score,
        violations: compliance.violations,
        passed: compliance.passed,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Proxy error — tidak bisa menghubungi Gemini." },
      { status: 500 },
    );
  }
}
