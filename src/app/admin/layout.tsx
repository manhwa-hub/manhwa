import Link from "next/link";
import { requireStaff } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireStaff();
  return (
    <div className="min-h-screen bg-[#090b10] text-white md:flex">
      <aside className="border-b border-white/10 bg-[#10141d] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <Link href="/admin" className="text-lg font-black">MANHWA<span className="text-[#b6f36b]">HUB</span></Link>
        <p className="mt-1 text-xs text-white/35">Admin workspace</p>
        <nav className="mt-8 flex flex-wrap gap-2 md:flex-col">
          {[["Dashboard","/admin"],["Manhwa","/admin/manhwa"],["Scraper","/admin/scraper"],["Genre","/admin/genres"],["Chapter","/admin/chapters"],["Pengaturan","/admin/settings"]].map(([label,href]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-[#b6f36b]">{label}</Link>)}
          <Link href="/" className="rounded-lg px-3 py-2 text-sm text-white/40 hover:bg-white/5">← Lihat website</Link>
        </nav>
      </aside>
      <section className="min-w-0 flex-1 p-5 md:p-9">{children}</section>
    </div>
  );
}
