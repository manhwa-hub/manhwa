import Link from "next/link";
import { saveChapter, updateChapterStatus, deleteChapter } from "./actions";
import { requireStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ saved?: string; updated?: string; deleted?: string; error?: string }> };

export default async function AdminChaptersPage({ searchParams }: Props) {
  const { supabase, role } = await requireStaff();
  const params = await searchParams;
  const [{ data: manhwa }, { data: chapters, error }] = await Promise.all([
    supabase.from("manhwa").select("id,title").order("title"),
    supabase.from("chapters").select("id,manhwa_id,chapter_number,title,status,published_at,scheduled_at,manhwa(title)").order("created_at", { ascending: false }).limit(150),
  ]);
  return <div>
    <Link href="/admin" className="text-sm text-[#b6f36b]">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-black">Manajemen Chapter</h1>
    <p className="mt-2 text-sm text-white/45">Buat chapter dan atur status publikasinya.</p>
    {params.saved && <p className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Chapter berhasil dibuat.</p>}
    {params.updated && <p className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Status chapter diperbarui.</p>}
    {params.deleted && <p className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Chapter dihapus.</p>}
    {params.error && <p className="mt-5 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">Gagal: {params.error}</p>}
    {error && <p className="mt-5 text-sm text-red-300">Tidak dapat membaca tabel chapters: {error.message}</p>}
    <form action={saveChapter} className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-[#121620] p-5 md:grid-cols-2">
      <label className="text-sm text-white/70 md:col-span-2">Pilih manhwa<select name="manhwa_id" required className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3">{(manhwa ?? []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label className="text-sm text-white/70">Nomor chapter<input name="chapter_number" type="number" min="0" step="0.1" required className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Judul chapter<input name="title" maxLength={180} className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Status<select name="status" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option></select></label>
      <label className="text-sm text-white/70">Waktu jadwal (jika scheduled)<input name="scheduled_at" type="datetime-local" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <button disabled={!manhwa?.length} className="w-fit rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b] disabled:opacity-40">Buat chapter</button>
    </form>
    <div className="mt-8 space-y-3">
      {(chapters ?? []).map((chapter: any) => <div key={chapter.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#121620] p-4">
        <div><p className="font-semibold">{chapter.manhwa?.title ?? "Manhwa"} — Chapter {chapter.chapter_number}</p><p className="mt-1 text-xs text-white/40">{chapter.title ?? "Tanpa judul"} · {chapter.status}</p></div>
        <div className="flex flex-wrap gap-2"><Link href={`/admin/chapters/${chapter.id}/images`} className="rounded-lg border border-[#b6f36b]/30 px-3 py-2 text-xs text-[#c8ff91]">Upload halaman</Link>
          <form action={updateChapterStatus} className="flex gap-2"><input type="hidden" name="id" value={chapter.id}/><select name="status" defaultValue={chapter.status} className="rounded-lg border border-white/10 bg-[#090b10] px-2 py-2 text-xs"><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option></select><button className="rounded-lg border border-white/15 px-3 py-2 text-xs">Ubah</button></form>
          {role === "admin" && <form action={deleteChapter}><input type="hidden" name="id" value={chapter.id}/><button className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300">Hapus</button></form>}
        </div>
      </div>)}
      {!chapters?.length && <p className="rounded-xl border border-white/10 p-6 text-sm text-white/40">Belum ada chapter.</p>}
    </div>
  </div>;
}
