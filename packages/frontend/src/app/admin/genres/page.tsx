import Link from "next/link";
import { saveGenre, deleteGenre } from "./actions";
import { requireStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function AdminGenresPage({ searchParams }: Props) {
  const { supabase, role } = await requireStaff();
  const params = await searchParams;
  const { data: genres, error } = await supabase.from("genres").select("id,name,slug").order("name");
  return <div>
    <Link href="/admin" className="text-sm text-[#b6f36b]">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-black">Manajemen Genre</h1>
    <p className="mt-2 text-sm text-white/45">Tambah, ubah, dan hapus kategori genre.</p>
    {params.saved && <p className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Genre berhasil disimpan.</p>}
    {params.deleted && <p className="mt-5 rounded-lg bg-[#b6f36b]/10 p-3 text-sm text-[#c8ff91]">Genre berhasil dihapus.</p>}
    {params.error && <p className="mt-5 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">Gagal: {params.error}</p>}
    {error && <p className="mt-5 text-sm text-red-300">Tidak dapat membaca tabel genres: {error.message}</p>}
    <form action={saveGenre} className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-[#121620] p-5 md:grid-cols-2">
      <label className="text-sm text-white/70">Nama genre<input required name="name" maxLength={60} placeholder="Action" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <label className="text-sm text-white/70">Slug<input required name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="action" className="mt-2 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-3"/></label>
      <button className="w-fit rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Tambah genre</button>
    </form>
    <div className="mt-8 space-y-3">
      {(genres ?? []).map((genre) => <div key={genre.id} className="grid gap-3 rounded-xl border border-white/10 bg-[#121620] p-4 md:grid-cols-[1fr_auto]">
        <form action={saveGenre} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={genre.id}/>
          <label className="text-xs text-white/45">Nama<input name="name" required defaultValue={genre.name} className="mt-1 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-2 text-sm text-white"/></label>
          <label className="text-xs text-white/45">Slug<input name="slug" required defaultValue={genre.slug} className="mt-1 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-2 text-sm text-white"/></label>
          <button className="w-fit rounded-lg border border-white/15 px-4 py-2 text-xs">Simpan perubahan</button>
        </form>
        {role === "admin" && <form action={deleteGenre} className="self-end"><input type="hidden" name="id" value={genre.id}/><button className="rounded-lg border border-red-400/30 px-4 py-2 text-xs text-red-300">Hapus</button></form>}
      </div>)}
      {!genres?.length && <p className="rounded-xl border border-white/10 p-6 text-sm text-white/40">Belum ada genre.</p>}
    </div>
  </div>;
}
