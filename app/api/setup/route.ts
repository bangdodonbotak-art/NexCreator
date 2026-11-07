import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/env";

/** Status setup server (Supabase / Gemini / Telegram) — tanpa nilai secret. */
export async function GET() {
  return NextResponse.json(getSetupStatus());
}
