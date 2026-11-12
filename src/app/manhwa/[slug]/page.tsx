import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { title: "Manhwa" };
  const { data } = await supabase.from("manhwa").select("title,synopsis,cover_url").eq("slug", slug).eq("publication_status", "published").maybeSingle();
  return { title: data?.title ?? "Manhwa", description: data?.synopsis ?? "Baca manhwa di Manhwa Hub.", openGraph: { images: data?.cover_url ? [data.cover_url] : [] } };
}

export default async function ManhwaDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main className="min-h-screen bg-[#090b10] p-8 text-white">Konfigurasi Supabase belum tersedia.</main>;
  const { data: title } = await supabase.from("manhwa").select("*").eq("slug", slug).eq("publication_status", "published").maybeSingle();
  if (!title) notFound();
  const [{ data: chapters }, { data: genreRows }] = await Promise.all([
    supabase.from("chapters").select("id,chapter_number,title,published_at").eq("manhwa_id", title.id).eq("status", "published").order("chapter_number", { ascending: false }),
    supabase.from("manhwa_genres").select("genres(name,slug)").eq("manhwa_id", title.id),
  ]);
  const genres = (genreRows ?? []).flatMap((row: any) => row.genres ? [row.genres] : []);
  const firstChapter = chapters?.[chapters.length - 1];
  return <main className="min-h-screen bg-[#090b10] px-5 py-10 text-white"><div className="mx-auto max-w-5xl">
    <Link href="/catalog" className="text-sm text-[#b6f36b]">← Kembali ke katalog</Link>
    <section className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">{title.cover_url ? <img src={title.cover_url} alt={title.title} className="aspect-[3/4] w-full object-cover"/> : <div className="grid aspect-[3/4] place-items-center text-white/30">No Cover</div>}</div>
      <div><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">{title.type.toUpperCase()}</p><h1 className="mt-3 text-4xl font-black">{title.title}</h1>
        {title.alternative_title && <p className="mt-2 text-sm text-white/40">{title.alternative_title}</p>}
        <div className="mt-5 flex flex-wrap gap-2">{genres.map((genre: any) => <Link key={genre.slug} href={`/catalog?genre=${genre.slug}`} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">{genre.name}</Link>)}</div>
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm"><div><p className="text-xs text-white/35">Status</p><p className="mt-1 capitalize">{title.status}</p></div><div><p className="text-xs text-white/35">Tahun</p><p className="mt-1">{title.release_year ?? "—"}</p></div><div><p className="text-xs text-white/35">Author</p><p className="mt-1">{title.author ?? "—"}</p></div><div><p className="text-xs text-white/35">Artist</p><p className="mt-1">{title.artist ?? "—"}</p></div></div>
        <h2 className="mt-7 text-lg font-bold">Sinopsis</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/55">{title.synopsis || "Sinopsis belum tersedia."}</p>
        {firstChapter && <Link href={`/read/${firstChapter.id}`} className="mt-7 inline-flex rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Mulai membaca</Link>}
      </div>
    </section>
    <section className="mt-12"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Daftar Chapter</h2><span className="text-xs text-white/35">{chapters?.length ?? 0} chapter</span></div>
      {!chapters?.length ? <p className="mt-5 rounded-xl border border-white/10 p-6 text-sm text-white/40">Belum ada chapter yang diterbitkan.</p> : <div className="mt-5 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#121620]">{chapters.map((chapter) => <Link key={chapter.id} href={`/read/${chapter.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[.04]"><div><p className="font-semibold">Chapter {chapter.chapter_number}</p>{chapter.title && <p className="mt-1 text-xs text-white/40">{chapter.title}</p>}</div><span className="text-xs text-[#b6f36b]">Baca →</span></Link>)}</div>}
    </section>
  </div></main>;
}
