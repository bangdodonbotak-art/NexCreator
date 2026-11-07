"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useNexStore } from "@/lib/store";

export function Toaster() {
  const toasts = useNexStore((s) => s.toasts);
  const dismiss = useNexStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#182339] bg-[#0E1524] p-3 shadow-xl shadow-black/40"
            role="status"
          >
            {t.error ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#E8EEF7]">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#8A97AD]">
                  {t.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Tutup notifikasi"
              className="rounded-md p-1 text-[#8A97AD] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
