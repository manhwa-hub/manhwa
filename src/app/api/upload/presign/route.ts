import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const inputSchema = z.object({
  manhwaId: z.string().uuid(),
  chapterId: z.string().uuid(),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  fileSize: z.number().int().positive().max(15 * 1024 * 1024),
});

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.role;
    if (!user || !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Tidak memiliki izin upload." }, { status: 403 });
    }

    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Data upload tidak valid.", details: parsed.error.flatten() }, { status: 400 });
    }

    const { manhwaId, chapterId, contentType, fileSize } = parsed.data;
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
      return NextResponse.json({ error: "Konfigurasi Cloudflare R2 belum lengkap." }, { status: 503 });
    }

    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .select("id,manhwa_id")
      .eq("id", chapterId)
      .eq("manhwa_id", manhwaId)
      .maybeSingle();

    if (chapterError || !chapter) {
      return NextResponse.json({ error: "Chapter tidak ditemukan untuk manhwa tersebut." }, { status: 404 });
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const storageKey = `manhwa/${manhwaId}/chapters/${chapterId}/${crypto.randomUUID()}.${extensions[contentType]}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ContentType: contentType,
      ContentLength: fileSize,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return NextResponse.json({
      uploadUrl,
      storageKey,
      publicUrl: `${publicBaseUrl}/${storageKey}`,
      expiresIn: 300,
      requiredHeaders: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("R2 presign error:", error);
    return NextResponse.json({ error: "Tidak dapat membuat URL upload." }, { status: 500 });
  }
}
