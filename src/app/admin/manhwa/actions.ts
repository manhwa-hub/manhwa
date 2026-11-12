"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";

const schema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  alternative_title: z.string().trim().max(180),
  synopsis: z.string().trim().max(12000),
  cover_url: z.string().trim().url().or(z.literal("")),
  status: z.enum(["ongoing", "completed", "hiatus"]),
  type: z.enum(["manhwa", "manga", "manhua"]),
  author: z.string().trim().max(120),
  artist: z.string().trim().max(120),
  release_year: z.number().int().min(1900).max(2100).nullable(),
});

function parseManhwa(formData: FormData) {
  const rawYear = String(formData.get("release_year") ?? "").trim();
  return schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    alternative_title: String(formData.get("alternative_title") ?? ""),
    synopsis: String(formData.get("synopsis") ?? ""),
    cover_url: String(formData.get("cover_url") ?? ""),
    status: formData.get("status"),
    type: formData.get("type"),
    author: String(formData.get("author") ?? ""),
    artist: String(formData.get("artist") ?? ""),
    release_year: rawYear ? Number(rawYear) : null,
  });
}

function refresh(slug?: string) {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/manhwa");
  if (slug) revalidatePath("/manhwa/" + slug);
}

export async function createManhwa(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = parseManhwa(formData);
  if (!parsed.success) redirect("/admin/manhwa?error=invalid");

  const { error } = await supabase.from("manhwa").insert({
    ...parsed.data,
    alternative_title: parsed.data.alternative_title || null,
    synopsis: parsed.data.synopsis || null,
    cover_url: parsed.data.cover_url || null,
    author: parsed.data.author || null,
    artist: parsed.data.artist || null,
    publication_status: "draft",
  });
  if (error) redirect("/admin/manhwa?error=" + encodeURIComponent(error.message));
  refresh(parsed.data.slug);
  redirect("/admin/manhwa?created=1");
}

export async function updateManhwa(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) redirect("/admin/manhwa?error=invalid-id");
  const parsed = parseManhwa(formData);
  if (!parsed.success) redirect("/admin/manhwa/" + id + "?error=invalid");
  const genreIds = [...new Set(formData.getAll("genre_ids").map(String))];
  if (genreIds.some((value) => !z.string().uuid().safeParse(value).success)) {
    redirect("/admin/manhwa/" + id + "?error=invalid-genre");
  }
  const { data: existing } = await supabase.from("manhwa").select("slug").eq("id", id).maybeSingle();
  const { error } = await supabase.from("manhwa").update({
    ...parsed.data,
    alternative_title: parsed.data.alternative_title || null,
    synopsis: parsed.data.synopsis || null,
    cover_url: parsed.data.cover_url || null,
    author: parsed.data.author || null,
    artist: parsed.data.artist || null,
  }).eq("id", id);
  if (error) redirect("/admin/manhwa/" + id + "?error=" + encodeURIComponent(error.message));
  const { error: deleteError } = await supabase.from("manhwa_genres").delete().eq("manhwa_id", id);
  if (deleteError) redirect("/admin/manhwa/" + id + "?error=" + encodeURIComponent("Data utama tersimpan, tetapi genre lama gagal diperbarui: " + deleteError.message));
  if (genreIds.length) {
    const { error: insertError } = await supabase.from("manhwa_genres").insert(genreIds.map((genre_id) => ({ manhwa_id: id, genre_id })));
    if (insertError) redirect("/admin/manhwa/" + id + "?error=" + encodeURIComponent("Data utama tersimpan, tetapi genre gagal disimpan: " + insertError.message));
  }
  refresh(existing?.slug);
  refresh(parsed.data.slug);
  redirect("/admin/manhwa/" + id + "?saved=1");
}

export async function setManhwaPublication(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("publication_status") ?? "");
  if (!z.string().uuid().safeParse(id).success || !["draft", "published"].includes(next)) {
    redirect("/admin/manhwa?error=invalid-publication");
  }
  const { data: item } = await supabase.from("manhwa").select("slug").eq("id", id).maybeSingle();
  const { error } = await supabase.from("manhwa").update({ publication_status: next }).eq("id", id);
  if (error) redirect("/admin/manhwa?error=" + encodeURIComponent(error.message));
  refresh(item?.slug);
  redirect("/admin/manhwa?publication=1");
}
