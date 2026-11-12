import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !["admin", "editor"].includes(user.app_metadata?.role)) return NextResponse.json({ error: "Tidak memiliki izin." }, { status: 403 });
  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) return NextResponse.json({ error: "chapterId wajib." }, { status: 400 });
  const { data } = await supabase.from("chapters").select("manhwa_id").eq("id", chapterId).maybeSingle();
  if (!data) return NextResponse.json({ error: "Chapter tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ manhwaId: data.manhwa_id });
}
