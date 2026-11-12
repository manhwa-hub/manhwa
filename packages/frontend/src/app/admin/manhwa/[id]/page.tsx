import Link from "next/link";
import { notFound } from "next/navigation";
import { updateManhwa } from "../actions";
import { requireStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function EditManhwaPage({ params, searchParams }: Props) {
  const { supabase } = await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const [{ data: item }, { data: genres }, { data: links }] = await Promise.all([
    supabase.from("manhwa").select("id,title,slug,alternative_title,synopsis,cover_url,status,type,author,artist,release_year,publication_status").eq("id", id).maybeSingle(),
    supabase.from("genres").select("id,name").order("name"),
    supabase.from("manhwa_genres").select("genre_id").eq("manhwa_id", id),
  ]);
  if (!item) notFound();
  const selected = new Set((links ?? []).map((link) => link.genre_id));
  return <div className="max-w-4xl">
    <Link href="/admin/manhwa" className="text-sm text-[#b6f36b]">← Kembali ke daftar manhwa</Link>
    <h1 className="mt-5 text-3xl font-black">Edit Manhwa</h1>
    <p className="mt-2 text-sm text-white/45">Perubahan disimpan ke database. Status publikasi diatur dari daftar manhwa.</p>
    {query.saved && <p className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Perubahan berhasil disimpan.</p>}
    {query.error && <p className="mt-5 break-words rounded-lg bg-red-400/10 p-3 text-sm text-red-300">Gagal menyimpan: {query.error}</p>}
    <form action={updateManhwa} className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-[#121620] p-5 md:grid-cols-2">
      <input type="hidden" name="id" value={item.id}/>
      <label className="text-sm text-white/70">Judul *<input name="title" required maxLength={180} defaultValue={item.title} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Slug *<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={item.slug} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Judul alternatif<input name="alternative_title" defaultValue={item.alternative_title ?? ""} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">URL cover<input name="cover_url" type="url" defaultValue={item.cover_url ?? ""} placeholder="https://..." className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Status cerita<select name="status" defaultValue={item.status} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="hiatus">Hiatus</option></select></label>
      <label className="text-sm text-white/70">Jenis<select name="type" defaultValue={item.type} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"><option value="manhwa">Manhwa</option><option value="manga">Manga</option><option value="manhua">Manhua</option></select></label>
      <label className="text-sm text-white/70">Penulis<input name="author" defaultValue={item.author ?? ""} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Ilustrator<input name="artist" defaultValue={item.artist ?? ""} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Tahun rilis<input name="release_year" type="number" min="1900" max="2100" defaultValue={item.release_year ?? ""} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70 md:col-span-2">Sinopsis<textarea name="synopsis" rows={5} defaultValue={item.synopsis ?? ""} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <fieldset className="md:col-span-2">
        <legend className="mb-3 text-sm font-semibold text-white/80">Genre (bisa pilih lebih dari satu)</legend>
        {!genres?.length ? <p className="text-sm text-white/40">Belum ada genre. Tambahkan dari menu Genre terlebih dahulu.</p> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{genres.map((genre) => <label key={genre.id} className="flex items-center gap-2 rounded-lg border border-white/10 p-3 text-sm text-white/70"><input type="checkbox" name="genre_ids" value={genre.id} defaultChecked={selected.has(genre.id)} className="accent-[#b6f36b]"/>{genre.name}</label>)}</div>}
      </fieldset>
      <div className="md:col-span-2"><button className="rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Simpan perubahan</button></div>
    </form>
  </div>;
}
