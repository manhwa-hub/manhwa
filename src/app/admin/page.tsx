import { BookOpen, Eye, Layers3, Users } from "lucide-react";
import { requireStaff } from "@/lib/auth/staff";

export default async function AdminDashboardPage() {
  const { supabase } = await requireStaff();
  const [manhwa, chapters, readers] = await Promise.all([
    supabase.from("manhwa").select("*", { count: "exact", head: true }),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);
  const stats = [
    { label: "Total Manhwa", value: manhwa.count ?? 0, icon: BookOpen },
    { label: "Total Chapter", value: chapters.count ?? 0, icon: Layers3 },
    { label: "Pengguna", value: readers.count ?? 0, icon: Users },
    { label: "Status CMS", value: "Aktif", icon: Eye },
  ];
  return <div>
    <p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">OVERVIEW</p>
    <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
    <p className="mt-2 text-sm text-white/45">Ringkasan konten Manhwa Hub.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({label,value,icon:Icon}) => <div key={label} className="rounded-2xl border border-white/10 bg-[#121620] p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/45">{label}</span><Icon size={19} className="text-[#b6f36b]"/></div><p className="mt-5 text-3xl font-black">{value}</p></div>)}
    </div>
    <div className="mt-8 rounded-2xl border border-white/10 bg-[#121620] p-6"><h2 className="font-bold">CMS siap dikembangkan</h2><p className="mt-2 text-sm leading-6 text-white/45">Dashboard sudah membaca statistik dari Supabase. Modul CRUD dan uploader R2 akan ditambahkan pada bagian berikutnya.</p></div>
  </div>;
}
