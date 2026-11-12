import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  sourceUrl: z.string().url().max(2048),
  canonicalUrl: z.string().url().max(2048),
  sourceName: z.string().trim().min(1).max(180),
  title: z.string().trim().min(1).max(180),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan login sebagai staf." }, { status: 403 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return NextResponse.json({ error: "Akses hanya untuk staf." }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Data metadata tidak valid." }, { status: 400 });

    const values = parsed.data;
    const { data, error } = await supabase.from("scraper_sources").insert({
      source_url: values.sourceUrl,
      canonical_url: values.canonicalUrl,
      source_name: values.sourceName,
      title: values.title,
      rights_status: "unverified",
      created_by: user.id,
    }).select("id").single();

    if (error?.code === "23505") {
      return NextResponse.json({ message: "URL sumber ini sudah pernah disimpan." });
    }
    if (error) return NextResponse.json({ error: "Gagal menyimpan catatan sumber." }, { status: 500 });
    return NextResponse.json({ id: data.id, message: "Catatan sumber berhasil disimpan." });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan sumber." }, { status: 500 });
  }
}
