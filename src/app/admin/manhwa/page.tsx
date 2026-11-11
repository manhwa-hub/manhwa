import Link from "next/link";
import { createManhwa } from "./actions";
import { requireStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ created?: string; error?: string }> };

export default async function AdminManhwaPage({ searchParams }: Props) {
  const { supabase } = await requireStaff();
  const params = await searchParams;
  const { data: titles, error } = await supabase
    .from("manhwa")
    .select("id,title,slug,status,type,is_published,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return <div>
    <Link href="/admin" className="text-sm text-[#b6f36b]">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-black">Manajemen Manhwa</h1>
    <p className="mt-2 text-sm text-white/45">Tambahkan judul. Judul baru disimpan sebagai draft dan belum terlihat publik.</p>
    {params.created && <p className="mt-5 rounded-lg border border-[#b6f36b]/20 bg-[#b6f36b]/5 p-3 text-sm text-[#c8ff91]">Manhwa berhasil ditambahkan sebagai draft.</p>}
    {params.error && <p className="mt-5 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">Data tidak valid atau gagal disimpan: {params.error}</p>}
    {error && <p className="mt-5 text-sm text-red-300">Gagal memuat data: {error.message}</p>}
    <form action={createManhwa} className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-[#121620] p-5 md:grid-cols-2">
      <label className="text-sm text-white/70">Judul *<input name="title" required maxLength={180} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Slug *<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="contoh-judul-komik" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Judul alternatif<input name="alternative_title" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">URL cover<input name="cover_url" type="url" placeholder="https://..." className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Status<select name="status" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="hiatus">Hiatus</option></select></label>
      <label className="text-sm text-white/70">Jenis<select name="type" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"><option value="manhwa">Manhwa</option><option value="manga">Manga</option><option value="manhua">Manhua</option><option value="comic">Comic</option></select></label>
      <label className="text-sm text-white/70">Penulis<input name="author" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Ilustrator<input name="artist" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Tahun rilis<input name="release_year" type="number" min="1900" max="2100" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70 md:col-span-2">Sinopsis<textarea name="synopsis" rows={4} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <div className="md:col-span-2"><button className="rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Simpan sebagai draft</button></div>
    </form>
    <div className="mt-9 overflow-hidden rounded-2xl border border-white/10 bg-[#121620]">
      <div className="border-b border-white/10 px-5 py-4 font-bold">Daftar Manhwa ({titles?.length ?? 0})</div>
      {!titles?.length ? <p className="p-6 text-sm text-white/40">Belum ada data manhwa.</p> : <div className="divide-y divide-white/5">{titles.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-white/35">/{item.slug} · {item.type} · {item.status}</p></div><span className={item.is_published ? "rounded-full bg-[#b6f36b]/10 px-3 py-1 text-xs text-[#c8ff91]" : "rounded-full bg-white/10 px-3 py-1 text-xs text-white/45"}>{item.is_published ? "Published" : "Draft"}</span></div>)}</div>}
    </div>
  </div>;
}
