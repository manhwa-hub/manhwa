import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{ q?: string; genre?: string; status?: string; sort?: string; page?: string }>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    ? supabase.from("manhwa").select("id,title,slug,cover_url,status,type,rating,created_at").eq("publication_status", "published")
    : null;
  if (query && params.q) query = query.ilike("title", `%${params.q}%`);
  if (query && params.status) query = query.eq("status", params.status as "ongoing" | "completed" | "hiatus");
  if (query) query = params.sort === "popular" ? query.order("views", { ascending: false }) : query.order("created_at", { ascending: false });
  const { data } = query ? await query.limit(48) : { data: [] };
  const items = data ?? [];

  return <main className="min-h-screen bg-[#090b10] px-5 py-12 text-white"><div className="mx-auto max-w-7xl">
    <Link href="/" className="text-sm text-[#b6f36b]">← Manhwa Hub</Link>
    <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">DISCOVER</p><h1 className="mt-2 text-4xl font-black">Katalog</h1><p className="mt-2 text-sm text-white/45">Temukan cerita yang ingin kamu baca.</p></div>
      <form className="flex gap-2" action="/catalog"><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search size={16} className="text-white/40"/><input name="q" defaultValue={params.q} placeholder="Cari judul..." className="w-44 bg-transparent py-3 text-sm outline-none"/></div><button className="rounded-xl bg-[#b6f36b] px-4 text-sm font-bold text-black">Cari</button></form>
    </div>
    <form action="/catalog" className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"><SlidersHorizontal size={17} className="text-[#b6f36b]"/><select name="status" defaultValue={params.status ?? ""} className="rounded-lg border border-white/10 bg-[#151923] px-3 py-2 text-sm"><option value="">Semua status</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="hiatus">Hiatus</option></select><select name="sort" defaultValue={params.sort ?? "latest"} className="rounded-lg border border-white/10 bg-[#151923] px-3 py-2 text-sm"><option value="latest">Terbaru</option><option value="popular">Terpopuler</option></select><button className="rounded-lg border border-white/15 px-4 py-2 text-sm">Terapkan</button></form>
    {!supabase && <p className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Hubungkan Supabase melalui environment variables untuk menampilkan data katalog.</p>}
    {supabase && items.length === 0 && <p className="mt-12 rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center text-white/50">Belum ada komik yang diterbitkan. Tambahkan judul melalui CMS admin.</p>}
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{items.map((item) => <Link key={item.id} href={`/manhwa/${item.slug}`} className="group overflow-hidden rounded-xl border border-white/10 bg-[#121620]"><div className="aspect-[3/4] bg-white/5">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105"/> : <div className="grid h-full place-items-center text-xs text-white/30">No Cover</div>}</div><div className="p-3"><p className="line-clamp-2 text-sm font-bold">{item.title}</p><p className="mt-2 text-xs capitalize text-white/40">{item.status} · {item.type}</p></div></Link>)}</div>
  </div></main>;
}
