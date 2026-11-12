import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#090b10] px-5 text-center text-white"><div><p className="text-sm font-bold tracking-[.3em] text-[#b6f36b]">404</p><h1 className="mt-4 text-4xl font-black">Halaman tidak ditemukan</h1><p className="mt-3 text-white/50">Halaman yang kamu cari belum tersedia.</p><Link href="/" className="mt-8 inline-block rounded-xl bg-[#b6f36b] px-5 py-3 font-bold text-[#10140b]">Kembali ke beranda</Link></div></main>;
}
