import Link from "next/link";
import { BookOpen, Eye, Layers3, Users, Tags, Settings } from "lucide-react";
import { requireStaff } from "@/lib/auth/staff";

export default async function AdminDashboardPage() {
  const { supabase, role } = await requireStaff();
  const [manhwa, chapters, readers, published, drafts] = await Promise.all([
    supabase.from("manhwa").select("*", { count: "exact", head: true }),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("manhwa").select("*", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("manhwa").select("*", { count: "exact", head: true }).eq("publication_status", "draft"),
  ]);
  const stats = [
    { label: "Total Manhwa", value: manhwa.count ?? 0, icon: BookOpen },
    { label: "Chapter", value: chapters.count ?? 0, icon: Layers3 },
    { label: "Manhwa Terbit", value: published.count ?? 0, icon: Eye },
    { label: "Pengguna", value: readers.count ?? 0, icon: Users },
  ];
  return <div>
    <p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">OVERVIEW</p>
    <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
    <p className="mt-2 text-sm text-white/45">Ringkasan konten dan akses cepat pengelolaan Manhwa Hub.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({label,value,icon:Icon}) => <div key={label} className="rounded-2xl border border-white/10 bg-[#121620] p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/45">{label}</span><Icon size={19} className="text-[#b6f36b]"/></div><p className="mt-5 text-3xl font-black">{value}</p></div>)}
    </div>
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#121620] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Status konten</h2><p className="mt-1 text-sm text-white/45">{drafts.count ?? 0} manhwa masih berupa draft.</p></div><Link href="/admin/manhwa" className="rounded-lg bg-[#b6f36b] px-4 py-2 text-sm font-bold text-[#10140b]">Kelola manhwa</Link></div>
    </section>
    <section className="mt-6">
      <h2 className="font-bold">Akses cepat</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/admin/manhwa" className="rounded-xl border border-white/10 bg-[#121620] p-4 hover:border-[#b6f36b]/40"><BookOpen className="text-[#b6f36b]"/><p className="mt-3 font-semibold">Manajemen Manhwa</p><p className="mt-1 text-xs text-white/40">Tambah, edit, dan publikasikan judul.</p></Link>
        <Link href="/admin/genres" className="rounded-xl border border-white/10 bg-[#121620] p-4 hover:border-[#b6f36b]/40"><Tags className="text-[#b6f36b]"/><p className="mt-3 font-semibold">Manajemen Genre</p><p className="mt-1 text-xs text-white/40">Atur kategori bacaan.</p></Link>
        <Link href="/admin/chapters" className="rounded-xl border border-white/10 bg-[#121620] p-4 hover:border-[#b6f36b]/40"><Layers3 className="text-[#b6f36b]"/><p className="mt-3 font-semibold">Manajemen Chapter</p><p className="mt-1 text-xs text-white/40">Buat chapter dan unggah halaman.</p></Link>
        {role === "admin" && <Link href="/admin/settings" className="rounded-xl border border-white/10 bg-[#121620] p-4 hover:border-[#b6f36b]/40"><Settings className="text-[#b6f36b]"/><p className="mt-3 font-semibold">Pengaturan Website</p><p className="mt-1 text-xs text-white/40">Atur identitas situs dan pengumuman.</p></Link>}
      </div>
    </section>
  </div>;
}
