/**
 * Store in-memory untuk render job (Fase A).
 * Dipakai bersama oleh /api/jobs dan /api/jobs/[id].
 * Server restart = antrean hilang; itu disengaja sampai worker Fase B ada.
 */
export interface RenderJob {
  id: string;
  queueItemId: string;
  title: string;
  productName: string;
  status: "QUEUED_RENDER" | "RENDERING" | "READY_TO_POST" | "FAILED";
  note: string;
  createdAt: string;
}

const jobs = new Map<string, RenderJob>();

export function listJobs(): RenderJob[] {
  return [...jobs.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getJob(id: string): RenderJob | undefined {
  return jobs.get(id);
}

export function createJob(input: {
  queueItemId: string;
  title: string;
  productName: string;
}): RenderJob {
  const job: RenderJob = {
    id: `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    queueItemId: input.queueItemId,
    title: input.title,
    productName: input.productName,
    status: "QUEUED_RENDER",
    note: "Antre render — worker GPU Fase B belum tersedia. Rakit manual via production pack.",
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  return job;
}
