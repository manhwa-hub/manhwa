import Link from "next/link";
import { requireStaff } from "@/lib/auth/staff";
import ScraperPreviewForm from "./scraper-preview-form";
import SourceRightsControl from "./source-rights-control";

export const dynamic = "force-dynamic";

const rightsLabels: Record<string, string> = {
  unverified: "Belum diverifikasi",
  authorized: "Diizinkan / berlisensi",
  original: "Karya sendiri",
  do_not_publish: "Jangan diterbitkan",
};

export default async function AdminScraperPage() {
  const { supabase } = await requireStaff();
  const { data: sources, error } = await supabase
    .from("scraper_sources")
    .select("id,source_url,canonical_url,source_name,title,rights_status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <Link href="/admin" className="text-sm text-[#b6f36b]">← Dashboard</Link>
      <p className="mt-6 text-xs font-bold tracking-[.2em] text-[#b6f36b]">SOURCE TOOLS</p>
      <h1 className="mt-2 text-3xl font-black">Scraper Manhwa</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Masukkan URL sumber untuk mendeteksi metadata halaman secara otomatis. Fitur ini membaca metadata standar (Open Graph, Twitter Cards, dan JSON-LD), sehingga dapat bekerja pada banyak situs tanpa konfigurasi selector.</p>
      <ScraperPreviewForm />
      <section className="mt-10 max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#121620]">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-bold">Catatan sumber tersimpan ({sources?.length ?? 0})</h2>
          <p className="mt-1 text-xs text-white/40">Simpan metadata untuk referensi admin. Status izin harus diverifikasi sebelum konten apa pun digunakan.</p>
        </div>
        {error ? <p className="p-5 text-sm text-red-300">Gagal memuat sumber: {error.message}</p> :
          !sources?.length ? <p className="p-5 text-sm text-white/40">Belum ada sumber tersimpan. Lakukan pratinjau lalu pilih “Simpan catatan sumber”.</p> :
          <div className="divide-y divide-white/5">{sources.map((source) => (
            <article key={source.id} className="space-y-2 p-5">
              <h3 className="font-semibold">{source.title}</h3>
              <p className="text-xs text-white/45">{source.source_name}</p>
              <a href={source.canonical_url} target="_blank" rel="noreferrer" className="block break-all text-xs text-[#b6f36b] underline">{source.canonical_url}</a>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <SourceRightsControl id={source.id} initialStatus={source.rights_status} />
                <span className="text-xs text-white/30">{new Date(source.created_at).toLocaleString("id-ID")}</span>
              </div>
            </article>
          ))}</div>}
      </section>
      <div className="mt-6 max-w-5xl rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100/80">
        <strong>Batasan dan penggunaan yang diizinkan</strong>
        <p className="mt-2">Versi ini hanya mengambil metadata publik dan menyimpan catatan sumber. Sistem tidak mengunduh gambar halaman chapter, tidak melewati login, paywall, CAPTCHA, atau proteksi teknis, dan tidak menerbitkan konten secara otomatis. Jangan gunakan materi tanpa izin tertulis atau lisensi yang sesuai.</p>
      </div>
    </div>
  );
}
