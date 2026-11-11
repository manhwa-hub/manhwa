import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export const metadata = { title: "Katalog" };

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-[#090b10] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={16}/> Beranda</Link>
        <div className="mt-12 rounded-3xl border border-white/10 bg-[#121620] p-8 md:p-12">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#b6f36b]/10 text-[#b6f36b]"><BookOpen size={26}/></div>
          <p className="mt-8 text-xs font-bold tracking-[.2em] text-[#b6f36b]">KATALOG MANHWA</p>
          <h1 className="mt-3 text-4xl font-black">Temukan bacaanmu.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/50">Halaman katalog sudah disiapkan. Daftar judul, filter genre, status, dan pencarian akan muncul setelah database konten dihubungkan.</p>
          <Link href="/" className="mt-8 inline-flex rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Kembali ke beranda</Link>
        </div>
      </div>
    </main>
  );
}
