import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().uuid(),
  rightsStatus: z.enum(["unverified", "authorized", "original", "do_not_publish"]),
});

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login sebagai staf." }, { status: 403 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) return NextResponse.json({ error: "Akses hanya untuk staf." }, { status: 403 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Data status tidak valid." }, { status: 400 });

    const { error } = await supabase.from("scraper_sources")
      .update({ rights_status: parsed.data.rightsStatus, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.id);
    if (error) return NextResponse.json({ error: "Gagal memperbarui status sumber." }, { status: 500 });
    return NextResponse.json({ message: "Status izin berhasil diperbarui." });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbarui status." }, { status: 500 });
  }
}
