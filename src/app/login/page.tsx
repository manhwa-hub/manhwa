import Link from "next/link";
export const metadata = { title: "Login" };
export default function LoginPreview() {
  return <main className="grid min-h-screen place-items-center bg-[#090b10] px-5 text-white"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121620] p-8"><p className="text-xs font-bold tracking-[.2em] text-[#b6f36b]">MANHWA HUB</p><h1 className="mt-4 text-3xl font-black">Login</h1><p className="mt-3 leading-7 text-white/50">Form login akan diaktifkan setelah koneksi Supabase Auth disiapkan.</p><Link href="/" className="mt-7 inline-block rounded-xl bg-[#b6f36b] px-5 py-3 text-sm font-bold text-[#10140b]">Kembali ke beranda</Link></section></main>;
}