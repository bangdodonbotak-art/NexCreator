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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-line text-emerald-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-fog">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-mist">
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
