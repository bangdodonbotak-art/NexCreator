import { NextResponse } from "next/server";
import { telegramDispatchSchema } from "@/lib/schemas";

/**
 * POST /api/telegram/dispatch — kirim pesan via Bot API, server-side only.
 * Token TIDAK PERNAH dikirim ke client. chat_id diambil dari body (profil
 * per-user) dulu, lalu fallback env TELEGRAM_CHAT_ID (server).
 * Tanpa env -> 503 yang jelas.
 */
export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "TELEGRAM_BOT_TOKEN belum diset di server. Laporan hanya bisa di-preview.",
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
  const parsed = telegramDispatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Teks tidak valid (1–4000 karakter)." },
      { status: 400 },
    );
  }

  // Per-user dulu (profiles.telegram_chat_id), env hanya fallback server.
  const chatId = parsed.data.chatId || process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    return NextResponse.json(
      {
        error:
          "TELEGRAM_CHAT_ID belum diset (per-user maupun env). Isi di profil atau env server.",
      },
      { status: 503 },
    );
  }

  try {
    const r = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: parsed.data.text }),
      },
    );
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return NextResponse.json(
        { error: `Telegram ${r.status}: ${detail.slice(0, 200)}` },
        { status: 502 },
      );
    }
    const d = await r.json();
    return NextResponse.json({ ok: true, messageId: d?.result?.message_id ?? null });
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa menghubungi Telegram." },
      { status: 500 },
    );
  }
}
