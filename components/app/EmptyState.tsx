import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#182339] bg-[#0E1524]/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#182339] text-emerald-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#E8EEF7]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#8A97AD]">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 min-h-11">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
