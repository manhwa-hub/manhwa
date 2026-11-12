import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ chapterId: string }> };

export default async function ReaderPage({ params }: Props) {
  const { chapterId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main className="min-h-screen bg-[#090b10] p-8 text-white">Konfigurasi Supabase belum tersedia.</main>;
  const { data: chapter } = await supabase.from("chapters").select("id,chapter_number,title,manhwa_id").eq("id", chapterId).eq("status", "published").maybeSingle();
  if (!chapter) notFound();
  const [{ data: manhwa }, { data: images }, { data: chapters }] = await Promise.all([
    supabase.from("manhwa").select("title,slug").eq("id", chapter.manhwa_id).eq("publication_status", "published").maybeSingle(),
    supabase.from("chapter_images").select("id,image_url,page_number").eq("chapter_id", chapterId).order("page_number", { ascending: true }),
    supabase.from("chapters").select("id,chapter_number").eq("manhwa_id", chapter.manhwa_id).eq("status", "published").order("chapter_number", { ascending: true }),
  ]);
  if (!manhwa) notFound();
  const chapterList = chapters ?? [];
  const index = chapterList.findIndex((item) => item.id === chapterId);
  const previous = index > 0 ? chapterList[index - 1] : null;
  const next = index >= 0 && index < chapterList.length - 1 ? chapterList[index + 1] : null;
  return <main className="min-h-screen bg-[#050608] text-white">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b10]/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3"><div className="min-w-0"><Link href={`/manhwa/${manhwa.slug}`} className="block truncate text-sm font-bold">{manhwa.title}</Link><p className="mt-1 text-xs text-white/40">Chapter {chapter.chapter_number}{chapter.title ? ` · ${chapter.title}` : ""}</p></div><Link href={`/manhwa/${manhwa.slug}`} className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs">Daftar chapter</Link></div></header>
    <div className="mx-auto max-w-4xl">{!images?.length ? <p className="p-10 text-center text-sm text-white/45">Halaman chapter belum tersedia.</p> : images.map((image) => <img key={image.id} src={image.image_url} alt={`Halaman ${image.page_number} - ${manhwa.title}`} loading={image.page_number <= 2 ? "eager" : "lazy"} className="block h-auto w-full"/>)}</div>
    <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-6">{previous ? <Link href={`/read/${previous.id}`} className="rounded-xl border border-white/15 px-4 py-3 text-sm">← Chapter {previous.chapter_number}</Link> : <span/>}{next ? <Link href={`/read/${next.id}`} className="rounded-xl bg-[#b6f36b] px-4 py-3 text-sm font-bold text-[#10140b]">Chapter {next.chapter_number} →</Link> : <span className="text-xs text-white/35">Chapter terbaru</span>}</nav>
  </main>;
}
