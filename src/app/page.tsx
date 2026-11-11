"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const genres = ["Action", "Adventure", "Fantasy", "Romance", "Drama", "Comedy", "Isekai", "Murim"];
const titles = [
  { name: "Katalog Manhwa", desc: "Jelajahi cerita dari berbagai genre dan dunia.", icon: BookOpen, href: "/catalog", tag: "JELAJAHI" },
  { name: "Sedang Populer", desc: "Temukan bacaan yang sedang ramai dibicarakan.", icon: Flame, href: "/catalog?sort=popular", tag: "TRENDING" },
  { name: "Temukan Cerita", desc: "Cari judul yang cocok dengan suasana hatimu.", icon: Search, href: "/catalog", tag: "DISCOVER" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const suggestions = useMemo(() => genres.filter((g) => g.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090b10]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b6f36b] text-[#090b10]"><BookOpen size={21}/></span>
            <span className="text-lg font-black tracking-tight">MANHWA<span className="text-[#b6f36b]">HUB</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
            <Link href="/" className="text-white">Beranda</Link>
            <Link href="/catalog" className="hover:text-white">Katalog</Link>
            <a href="#genre" className="hover:text-white">Genre</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm text-white/75 hover:bg-white/5 hover:text-white">Masuk</Link>
            <Link href="/register" className="rounded-xl bg-[#b6f36b] px-4 py-2 text-sm font-bold text-[#10140b] hover:bg-[#c8ff83]">Daftar</Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#b6f36b]/10 blur-[120px]"/>
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-20 md:grid-cols-[1.1fr_.9fr] md:pb-32 md:pt-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b6f36b]/20 bg-[#b6f36b]/[.07] px-4 py-2 text-xs font-semibold tracking-wide text-[#c7fa91]">
              <Sparkles size={14}/> RUANG BACA CERITA FAVORITMU
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl lg:text-7xl">
              Dunia cerita,<br/>tanpa <span className="text-[#b6f36b]">batas.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/55 md:text-lg">
              Temukan petualangan baru dari manhwa, manhua, manga, hingga webtoon. Pilih genre favoritmu dan mulai membaca.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/catalog" className="inline-flex items-center gap-3 rounded-xl bg-[#b6f36b] px-6 py-4 font-bold text-[#10140b] shadow-glow transition hover:-translate-y-0.5">
                Jelajahi Katalog <ArrowRight size={18}/>
              </Link>
              <a href="#genre" className="rounded-xl border border-white/15 px-6 py-4 font-semibold text-white/80 transition hover:bg-white/5">Lihat Genre</a>
            </div>
            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-7 text-sm">
              <div><p className="text-2xl font-black">4<span className="text-[#b6f36b]">+</span></p><p className="mt-1 text-white/40">Jenis bacaan</p></div>
              <div className="h-9 w-px bg-white/10"/>
              <div><p className="text-2xl font-black">∞</p><p className="mt-1 text-white/40">Cerita menanti</p></div>
              <div className="h-9 w-px bg-white/10"/>
              <div><p className="text-2xl font-black">1</p><p className="mt-1 text-white/40">Tempat favoritmu</p></div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-[2rem] bg-[#b6f36b]/10 blur-3xl"/>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#202a24] via-[#171b24] to-[#11131b] p-7 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[.25em] text-[#b6f36b]">YOUR NEXT READ</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/45">MANHWA HUB</span>
              </div>
              <div className="relative my-8 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(182,243,107,.24),transparent_45%),linear-gradient(145deg,#29352b,#11151e_70%)]">
                <div className="absolute h-48 w-48 rounded-full border border-[#b6f36b]/20"/>
                <div className="absolute h-36 w-36 rounded-full border border-[#b6f36b]/20"/>
                <div className="relative text-center">
                  <BookOpen className="mx-auto text-[#b6f36b]" size={62} strokeWidth={1}/>
                  <p className="mt-4 text-3xl font-black tracking-[.18em]">READ</p>
                  <p className="mt-2 text-[10px] tracking-[.35em] text-white/45">EXPLORE YOUR STORY</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div><p className="text-sm font-bold">Cerita baru dimulai di sini</p><p className="mt-1 text-xs text-white/40">Pilih bacaan pertamamu</p></div>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#b6f36b] text-[#10140b]"><ArrowRight size={20}/></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="genre" className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">PILIH SUASANAMU</p><h2 className="mt-2 text-2xl font-black">Jelajahi genre</h2></div>
            <Link href="/catalog" className="text-sm text-white/55 hover:text-[#b6f36b]">Semua katalog <ArrowRight className="ml-1 inline" size={15}/></Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => <Link key={genre} href={"/catalog?genre=" + genre.toLowerCase()} className="rounded-full border border-white/10 bg-white/[.03] px-5 py-3 text-sm text-white/70 transition hover:border-[#b6f36b]/50 hover:bg-[#b6f36b]/10 hover:text-[#d6ffad]">{genre}</Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10"><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">MULAI DARI SINI</p><h2 className="mt-2 text-3xl font-black">Semua yang kamu cari</h2><p className="mt-3 text-sm text-white/45">Jelajahi fitur dan temukan bacaan berikutnya.</p></div>
        <div className="grid gap-4 md:grid-cols-3">
          {titles.map(({name,desc,icon:Icon,href,tag}) => <Link key={name} href={href} className="group rounded-2xl border border-white/10 bg-[#121620] p-6 transition hover:-translate-y-1 hover:border-[#b6f36b]/30"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#b6f36b]/10 text-[#b6f36b]"><Icon size={22}/></span><span className="text-[10px] font-bold tracking-[.2em] text-white/30">{tag}</span></div><h3 className="mt-7 text-lg font-bold">{name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-white/45">{desc}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b6f36b]">Buka halaman <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="rounded-3xl border border-[#b6f36b]/15 bg-gradient-to-r from-[#b6f36b]/10 via-[#121620] to-violet-500/10 p-8 md:p-12">
          <p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">CARI CERITA</p>
          <h2 className="mt-3 text-2xl font-black md:text-3xl">Genre apa yang ingin kamu baca?</h2>
          <div className="mt-6 flex max-w-xl gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Coba: action, fantasy, romance..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090b10]/70 px-4 py-3 text-sm outline-none focus:border-[#b6f36b]/50"/>
            <Link href={"/catalog?q=" + encodeURIComponent(query)} className="grid w-12 shrink-0 place-items-center rounded-xl bg-[#b6f36b] text-[#10140b]"><Search size={19}/></Link>
          </div>
          {query && <p className="mt-3 text-xs text-white/40">Genre cocok: {suggestions.join(", ") || "Cari berdasarkan judul di katalog."}</p>}
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-8 text-xs text-white/35 sm:flex-row">
          <p>© {new Date().getFullYear()} Manhwa Hub. Dibuat untuk pecinta cerita.</p>
          <div className="flex gap-5"><Link href="/catalog" className="hover:text-white">Katalog</Link><Link href="/login" className="hover:text-white">Login</Link><Link href="/register" className="hover:text-white">Daftar</Link></div>
        </div>
      </footer>
    </main>
  );
}
