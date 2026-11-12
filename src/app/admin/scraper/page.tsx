import Link from "next/link";
import { requireStaff } from "@/lib/auth/staff";
import ScraperPreviewForm from "./scraper-preview-form";

export const dynamic = "force-dynamic";

export default async function AdminScraperPage() {
  await requireStaff();
  return (
    <div>
      <Link href="/admin" className="text-sm text-[#b6f36b]">← Dashboard</Link>
      <p className="mt-6 text-xs font-bold tracking-[.2em] text-[#b6f36b]">SOURCE TOOLS</p>
      <h1 className="mt-2 text-3xl font-black">Scraper Manhwa</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Masukkan URL sumber untuk mendeteksi metadata halaman secara otomatis. Fitur ini menggunakan metadata standar (Open Graph, Twitter Cards, dan JSON-LD), sehingga dapat bekerja pada banyak situs tanpa konfigurasi selector.</p>
      <ScraperPreviewForm />
      <div className="mt-6 max-w-3xl rounded-xl border border-white/10 p-4 text-xs leading-5 text-white/45">
        <strong className="text-white/70">Batasan dan penggunaan yang diizinkan</strong>
        <p className="mt-2">Versi awal ini hanya mengambil pratinjau metadata publik seperti judul, deskripsi, dan URL cover. Sistem tidak mengambil gambar halaman chapter, tidak melewati login, paywall, CAPTCHA, atau proteksi teknis, dan tidak menerbitkan konten secara otomatis. Pastikan kamu memiliki izin tertulis atau lisensi yang sesuai sebelum menyimpan maupun menerbitkan karya dan gambar dari sumber.</p>
      </div>
    </div>
  );
}
