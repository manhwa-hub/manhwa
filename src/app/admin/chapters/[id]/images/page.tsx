import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/staff";
import ChapterImageUploader from "@/components/admin/chapter-image-uploader";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export default async function ChapterImagesPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: chapter } = await supabase.from("chapters").select("id,chapter_number,title,manhwa_id,manhwa(title)").eq("id", id).maybeSingle();
  if (!chapter) notFound();
  return <div>
    <Link href="/admin/chapters" className="text-sm text-[#b6f36b]">← Kembali ke chapter</Link>
    <h1 className="mt-5 text-3xl font-black">Halaman Chapter {chapter.chapter_number}</h1>
    <p className="mt-2 text-sm text-white/45">{(chapter.manhwa as any)?.title ?? "Manhwa"} · {chapter.title ?? "Tanpa judul"}</p>
    <ChapterImageUploader chapterId={chapter.id}/>
  </div>;
}
