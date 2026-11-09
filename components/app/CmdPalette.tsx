"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  Clapperboard,
  LayoutDashboard,
  PenLine,
  Radar,
  PackagePlus,
  Wand2,
  FileDown,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

const COMMANDS = [
  { label: "Buka Command Center", icon: LayoutDashboard, href: "/app/command" },
  { label: "Buka Hunter — riset produk", icon: Radar, href: "/app/hunter" },
  { label: "Buka Script — generator ATM", icon: PenLine, href: "/app/script" },
  { label: "Buka Studio — preview 9:16", icon: Clapperboard, href: "/app/studio" },
  { label: "Buka Publisher — antrean & jadwal", icon: CalendarClock, href: "/app/publisher" },
  { label: "Buka Analytics — komisi nyata", icon: BarChart3, href: "/app/analytics" },
  { label: "Tambah produk baru", icon: PackagePlus, href: "/app/hunter?action=new" },
  { label: "Racik naskah ATM", icon: Wand2, href: "/app/script" },
  { label: "Ekspor production pack", icon: FileDown, href: "/app/studio" },
  { label: "Kirim laporan Telegram", icon: Send, href: "/app/publisher" },
  { label: "Kembali ke landing", icon: RefreshCw, href: "/" },
];

export function CmdPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query
      ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query))
      : COMMANDS;
  }, [q]);

  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    router.push(href);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setQ("");
      }}
    >
      <DialogContent className="max-w-lg border-line bg-panel p-0 text-fog">
        <DialogHeader className="px-4 pb-0 pt-4">
          <DialogTitle className="text-sm font-semibold text-mist">
            Palet Perintah — ketik untuk mencari
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-2">
          <Input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, list.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && list[sel]) {
                go(list[sel].href);
              }
            }}
            placeholder="Cari perintah… (mis. hunter, naskah, analytics)"
            className="min-h-11 border-line bg-ink text-fog placeholder:text-mist"
            aria-label="Cari perintah"
          />
        </div>
        <div className="max-h-80 overflow-y-auto px-2 pb-3" role="listbox">
          {list.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-mist">
              Tidak ada perintah yang cocok.
            </p>
          )}
          {list.map((c, i) => (
            <button
              key={c.label}
              role="option"
              aria-selected={i === sel}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(c.href)}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm",
                i === sel ? "bg-emerald-500/15 text-emerald-200" : "text-fog",
              )}
            >
              <c.icon className="h-4 w-4 shrink-0 text-mist" />
              {c.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
