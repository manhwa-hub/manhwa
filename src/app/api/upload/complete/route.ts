import { NextResponse } from "next/server";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  chapterId: z.string().uuid(),
  images: z.array(z.object({
    storageKey: z.string().min(1).max(500),
    publicUrl: z.string().url(),
    pageNumber: z.number().int().positive(),
  })).min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak memiliki izin." }, { status: 403 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return NextResponse.json({ error: "Tidak memiliki izin." }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Data gambar tidak valid." }, { status: 400 });

    const { chapterId, images } = parsed.data;
    const { data: chapter } = await supabase.from("chapters").select("id,manhwa_id").eq("id", chapterId).maybeSingle();
    if (!chapter) return NextResponse.json({ error: "Chapter tidak ditemukan." }, { status: 404 });

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
      return NextResponse.json({ error: "Konfigurasi R2 belum lengkap." }, { status: 503 });
    }

    const prefix = `manhwa/${chapter.manhwa_id}/chapters/${chapterId}/`;
    if (images.some((image) => !image.storageKey.startsWith(prefix) || !image.publicUrl.startsWith(publicBaseUrl + "/"))) {
      return NextResponse.json({ error: "Lokasi file tidak sesuai chapter." }, { status: 400 });
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const checked = await Promise.all(images.map(async (image) => {
      const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: image.storageKey }));
      if (!head.ContentLength || head.ContentLength > 15 * 1024 * 1024) throw new Error("Ukuran gambar tidak valid.");
      return { chapter_id: chapterId, image_url: image.publicUrl, storage_key: image.storageKey, page_number: image.pageNumber };
    }));

    const { error } = await supabase.from("chapter_images").insert(checked);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ saved: checked.length });
  } catch (error) {
    console.error("R2 complete upload error:", error);
    return NextResponse.json({ error: "Upload selesai tetapi verifikasi atau penyimpanan gagal." }, { status: 500 });
  }
}
