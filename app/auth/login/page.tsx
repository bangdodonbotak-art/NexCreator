"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Sparkles, FlaskConical, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, } from "@/lib/supabase/client";
import { isSupabaseEnvPresent, useNexStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const pushToast = useNexStore((s) => s.pushToast);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabaseEnv = isSupabaseEnvPresent();

  const sendMagicLink = async () => {
    if (!email.includes("@")) {
      pushToast({ title: "Email tidak valid", message: "Masukkan alamat email yang benar.", error: true });
      return;
    }
    const sb = createClient();
    if (!sb) {
      pushToast({ title: "Supabase belum diset", message: "Gunakan Mode Demo Lokal di bawah.", error: true });
      return;
    }
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app/command` },
    });
    setBusy(false);
    if (error) {
      pushToast({ title: "Gagal mengirim link", message: error.message, error: true });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080C14] px-4 text-[#E8EEF7]">
      <Card className="w-full max-w-md border-[#182339] bg-[#0E1524]">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </Link>
          <CardTitle className="text-xl">Masuk ke NexCreator V5</CardTitle>
          <p className="text-sm text-[#8A97AD]">
            Login dengan magic link email (Supabase Auth). Data kamu terisolasi
            per akun lewat RLS.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supabaseEnv && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              Supabase belum terhubung (proyek masih paused). Login email belum
              bisa dipakai — lanjut dengan Mode Demo Lokal di bawah.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="min-h-11 border-[#182339] bg-[#080C14] text-[#E8EEF7] placeholder:text-[#8A97AD]"
              disabled={!supabaseEnv}
            />
          </div>
          <Button
            onClick={sendMagicLink}
            disabled={!supabaseEnv || busy}
            className="min-h-11 w-full bg-emerald-500 text-[#04150D] hover:bg-emerald-400"
          >
            <Mail className="h-4 w-4" />
            {busy ? "Mengirim…" : "Kirim magic link"}
          </Button>
          {sent && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-200">
              Link masuk sudah dikirim ke {email}. Buka inbox dan klik linknya.
            </p>
          )}
          <div className="relative py-2 text-center text-xs text-[#8A97AD]">
            <span className="bg-[#0E1524] px-2">atau</span>
            <span className="absolute left-0 right-0 top-1/2 -z-0 border-t border-[#182339]" aria-hidden />
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/app/command")}
            className="min-h-11 w-full border-[#182339] bg-[#080C14] text-[#E8EEF7] hover:bg-[#182339]"
          >
            <FlaskConical className="h-4 w-4 text-cyan-400" />
            Lanjut Mode Demo Lokal
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-[#8A97AD]">
            Mode Demo Lokal menyimpan data di browser ini saja (localStorage{" "}
            <code>nexcreator-v5</code>). Tidak ada secret yang disimpan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
