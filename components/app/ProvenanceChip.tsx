import { Badge } from "@/components/ui/badge";
import type { Provenance } from "@/lib/types";
import { cn } from "cn";

const MAP: Record<Provenance, { label: string; className: string }> = {
  Real: {
    label: "Real · DB",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  Manual: {
    label: "Manual",
    className: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  },
  Estimasi: {
    label: "Estimasi",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
};

/** Chip provenance — setiap metrik wajib membawa salah satu label ini. */
export function ProvenanceChip({
  value,
  className,
}: {
  value: Provenance;
  className?: string;
}) {
  const m = MAP[value];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold", m.className, className)}>
      {m.label}
    </Badge>
  );
}
