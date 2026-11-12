import Link from "next/link";
import { saveSiteSettings } from "./actions";
import { requireStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ saved?: string; error?: string }> };

export default async function AdminSettingsPage({ searchParams }: Props) {
  const { supabase } = await requireStaff(["admin"]);
  const params = await searchParams;
  const { data, error } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["site_name", "site_description", "announcement"]);

  const values = new Map((data ?? []).map((item) => [item.key, item.value as { text?: string }]));
  const field = (key: string, fallback: string) => values.get(key)?.text ?? fallback;

  return <div className="max-w-3xl">
    <Link href="/admin" className="text-sm text-[#b6f36b]">← Dashboard</Link>
    <p className="mt-5 text-xs font-bold tracking-[.2em] text-[#b6f36b]">KONFIGURASI</p>
    <h1 className="mt-2 text-3xl font-black">Pengaturan Website</h1>
    <p className="mt-2 text-sm text-white/45">Kelola identitas dan pengumuman situs. Pengaturan disimpan di Supabase.</p>
    {params.saved && <p role="status" className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Pengaturan berhasil disimpan.</p>}
    {params.error && <p role="alert" className="mt-5 break-words rounded-lg bg-red-400/10 p-3 text-sm text-red-300">Gagal menyimpan: {params.error}</p>}
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">Tidak dapat membaca pengaturan: {error.message}</p>}
    <form action={saveSiteSettings} className="mt-7 space-y-5 rounded-2xl border border-white/10 bg-[#121620] p-5">
      <label className="block text-sm text-white/70">Nama website
        <input name="site_name" required maxLength={80} defaultValue={field("site_name", "Manhwa Hub")} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3 text-white"/>
      </label>
      <label className="block text-sm text-white/70">Deskripsi website
        <textarea name="site_description" rows={3} maxLength={240} defaultValue={field("site_description", "Baca manhwa, manhua, manga, dan webtoon favoritmu.")} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3 text-white"/>
      </label>
      <label className="block text-sm text-white/70">Pengumuman untuk pembaca
        <textarea name="announcement" rows={3} maxLength={500} defaultValue={field("announcement", "")} placeholder="Kosongkan jika tidak ada pengumuman." className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3 text-white"/>
      </label>
      <p className="text-xs leading-5 text-white/40">Pengumuman disimpan dan dapat ditampilkan pada halaman publik setelah komponen pengumuman diaktifkan.</p>
      <button className="rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Simpan pengaturan</button>
    </form>
  </div>;
}
