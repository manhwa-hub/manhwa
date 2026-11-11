"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(data.user?.app_metadata?.role === "admin" || data.user?.app_metadata?.role === "editor" ? "/admin" : "/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login gagal. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#090b10] px-5 text-white">
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121620] p-8">
      <Link href="/" className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">MANHWA HUB</Link>
      <h1 className="mt-5 text-3xl font-black">Selamat datang</h1>
      <p className="mt-2 text-sm text-white/45">Masuk untuk menyimpan bacaan dan melanjutkan chapter.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-white/70">Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b10] px-4 py-3 outline-none focus:border-[#b6f36b]/60"/></label>
        <label className="block text-sm text-white/70">Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b10] px-4 py-3 outline-none focus:border-[#b6f36b]/60"/></label>
        {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-[#b6f36b] px-5 py-3 font-bold text-[#10140b] disabled:opacity-50">{loading ? "Memproses..." : "Masuk"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-white/45">Belum punya akun? <Link href="/register" className="text-[#b6f36b]">Daftar</Link></p>
    </section>
  </main>;
}
