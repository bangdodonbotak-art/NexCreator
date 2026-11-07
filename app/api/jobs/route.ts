import { NextResponse } from "next/server";
import { jobCreateSchema } from "@/lib/schemas";
import { createJob, listJobs } from "@/lib/jobs-store";

/**
 * Antrean render job — jujur: status awal selalu QUEUED_RENDER.
 * Render GPU (FFmpeg + LivePortrait + F5-TTS) BELUM berjalan di Fase A;
 * job ini hanya antrean yang menunggu worker Fase B.
 */
export async function GET() {
  return NextResponse.json({
    jobs: listJobs(),
    note: "Fase A: job hanya antrean (QUEUED_RENDER). Render GPU belum berjalan.",
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }
  const parsed = jobCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload job tidak valid.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const job = createJob(parsed.data);
  return NextResponse.json({ job }, { status: 201 });
}
