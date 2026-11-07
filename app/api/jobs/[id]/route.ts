import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs-store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) {
    return NextResponse.json(
      { error: `Job ${id} tidak ditemukan (store in-memory, hilang saat server restart).` },
      { status: 404 },
    );
  }
  return NextResponse.json({ job });
}
