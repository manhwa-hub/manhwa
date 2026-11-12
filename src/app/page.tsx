import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Comic = { id: string; title: string; slug: string; cover_url: string | null; status: string; type: string; views?: number | null };

function ComicGrid({ items, empty }: { items: Comic[]; empty: string }) {
  if (!items.length) return <p className="rounded-xl border border-white/10 bg-white/[.03] p-6 text-sm text-white/40">{empty}</p>;
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {items.map((item) => <Link key={item.id} href={"/manhwa/" + item.slug} className="group overflow-hidden rounded-xl border border-white/10 bg-[#121620]">
      <div className="aspect-[3/4] overflow-hidden bg-white/5">{item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/> : <div className="grid h-full place-items-center text-xs text-white/30">No Cover</div>}</div>
      <div className="p-3"><p className="line-clamp-2 text-sm font-bold">{item.title}</p><p className="mt-2 text-xs capitalize text-white/40">{item.status} · {item.type}</p></div>
    </Link>)}
  </div>;
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  let latest: Comic[] = [];
  let popular: Comic[] = [];
  let genres: { name: string; slug: string }[] = [];
  let dataError = false;
  if (supabase) {
    const [latestResult, popularResult, genreResult] = await Promise.all([
      supabase.from("manhwa").select("id,title,slug,cover_url,status,type,views,created_at").eq("publication_status", "published").order("created_at", { ascending: false }).limit(12),
      supabase.from("manhwa").select("id,title,slug,cover_url,status,type,views,created_at").eq("publication_status", "published").order("views", { ascending: false }).limit(6),
      supabase.from("genres").select("name,slug").order("name").limit(16),
    ]);
    latest = (latestResult.data ?? []) as Comic[];
    popular = (popularResult.data ?? []) as Comic[];
    genres = genreResult.data ?? [];
    dataError = Boolean(latestResult.error || popularResult.error || genreResult.error);
  }

  return <main className="min-h-screen overflow-hidden bg-[#090b10] text-white">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090b10]/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b6f36b] text-[#090b10]"><BookOpen size={21}/></span><span className="text-lg font-black tracking-tight">MANHWA<span className="text-[#b6f36b]">HUB</span></span></Link>
      <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex"><Link href="/" className="text-white">Beranda</Link><Link href="/catalog" className="hover:text-white">Katalog</Link><a href="#genre" className="hover:text-white">Genre</a></nav>
      <div className="flex items-center gap-2"><Link href="/login" className="rounded-xl px-4 py-2 text-sm text-white/75 hover:bg-white/5">Masuk</Link><Link href="/register" className="rounded-xl bg-[#b6f36b] px-4 py-2 text-sm font-bold text-[#10140b]">Daftar</Link></div>
    </div></header>

    <section className="relative border-b border-white/10"><div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#b6f36b]/10 blur-[120px]"/><div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-[1.1fr_.9fr] md:py-28">
      <div><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b6f36b]/20 bg-[#b6f36b]/[.07] px-4 py-2 text-xs font-semibold tracking-wide text-[#c7fa91]"><Sparkles size={14}/> RUANG BACA CERITA FAVORITMU</div>
        <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl lg:text-7xl">Dunia cerita,<br/>tanpa <span className="text-[#b6f36b]">batas.</span></h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-white/55 md:text-lg">Temukan petualangan baru dari manhwa, manhua, manga, hingga webtoon. Pilih genre favoritmu dan mulai membaca.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/catalog" className="inline-flex items-center gap-3 rounded-xl bg-[#b6f36b] px-6 py-4 font-bold text-[#10140b]">Jelajahi Katalog <ArrowRight size={18}/></Link><a href="#latest" className="rounded-xl border border-white/15 px-6 py-4 font-semibold text-white/80">Update terbaru</a></div>
        <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-7 text-sm"><div><p className="text-2xl font-black">{latest.length}<span className="text-[#b6f36b]">+</span></p><p className="mt-1 text-white/40">Update terbaru</p></div><div className="h-9 w-px bg-white/10"/><div><p className="text-2xl font-black">{genres.length}</p><p className="mt-1 text-white/40">Genre tersedia</p></div></div>
      </div>
      <div className="relative mx-auto w-full max-w-lg"><div className="absolute inset-8 rounded-[2rem] bg-[#b6f36b]/10 blur-3xl"/><div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#202a24] via-[#171b24] to-[#11131b] p-7 shadow-2xl">
        <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.25em] text-[#b6f36b]">YOUR NEXT READ</span><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/45">MANHWA HUB</span></div>
        {popular[0]?.cover_url ? <Link href={"/manhwa/" + popular[0].slug} className="my-8 block overflow-hidden rounded-2xl border border-white/10"><img src={popular[0].cover_url} alt={popular[0].title} className="aspect-[4/3] w-full object-cover"/><div className="bg-black/40 p-4"><p className="text-xs text-[#b6f36b]">PALING POPULER</p><p className="mt-1 font-bold">{popular[0].title}</p></div></Link> : <div className="my-8 flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(182,243,107,.24),transparent_45%),linear-gradient(145deg,#29352b,#11151e_70%)]"><div className="text-center"><BookOpen className="mx-auto text-[#b6f36b]" size={62} strokeWidth={1}/><p className="mt-4 text-3xl font-black tracking-[.18em]">READ</p><p className="mt-2 text-[10px] tracking-[.35em] text-white/45">EXPLORE YOUR STORY</p></div></div>}
        <div className="flex items-center justify-between"><div><p className="text-sm font-bold">Cerita baru dimulai di sini</p><p className="mt-1 text-xs text-white/40">Pilih bacaan pertamamu</p></div><Link href="/catalog" className="grid h-11 w-11 place-items-center rounded-full bg-[#b6f36b] text-[#10140b]"><ArrowRight size={20}/></Link></div>
      </div></div>
    </div></section>

    <section id="genre" className="border-b border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-12"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">PILIH SUASANAMU</p><h2 className="mt-2 text-2xl font-black">Jelajahi genre</h2></div><Link href="/catalog" className="text-sm text-white/55 hover:text-[#b6f36b]">Semua katalog <ArrowRight className="ml-1 inline" size={15}/></Link></div>
      {genres.length ? <div className="flex flex-wrap gap-3">{genres.map((genre) => <Link key={genre.slug} href={"/catalog?genre=" + genre.slug} className="rounded-full border border-white/10 bg-white/[.03] px-5 py-3 text-sm text-white/70 hover:border-[#b6f36b]/50 hover:text-[#d6ffad]">{genre.name}</Link>)}</div> : <p className="text-sm text-white/40">Genre akan tampil setelah database terhubung dan data ditambahkan.</p>}
    </div></section>

    <section id="latest" className="mx-auto max-w-7xl px-5 py-16"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">BARU DITAMBAHKAN</p><h2 className="mt-2 text-3xl font-black">Update terbaru</h2></div><Link href="/catalog?sort=latest" className="text-sm text-white/55 hover:text-[#b6f36b]">Lihat semua <ArrowRight className="ml-1 inline" size={15}/></Link></div>
      {!supabase && <p className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Supabase belum dikonfigurasi. Data komik akan muncul setelah koneksi database tersedia.</p>}
      {dataError && <p className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">Sebagian data belum dapat dimuat. Periksa tabel dan kebijakan akses Supabase.</p>}
      <ComicGrid items={latest} empty="Belum ada manhwa yang diterbitkan."/>
    </section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-16"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">BANYAK DIBACA</p><h2 className="mt-2 text-3xl font-black">Sedang populer</h2></div><Link href="/catalog?sort=popular" className="text-sm text-white/55 hover:text-[#b6f36b]">Lihat semua <ArrowRight className="ml-1 inline" size={15}/></Link></div><ComicGrid items={popular} empty="Belum ada data popular. Komik akan muncul setelah diterbitkan."/></div></section>

    <footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-8 text-xs text-white/35 sm:flex-row"><p>© {new Date().getFullYear()} Manhwa Hub. Dibuat untuk pecinta cerita.</p><div className="flex gap-5"><Link href="/catalog" className="hover:text-white">Katalog</Link><Link href="/login" className="hover:text-white">Login</Link><Link href="/register" className="hover:text-white">Daftar</Link></div></div></footer>
  </main>;
}
