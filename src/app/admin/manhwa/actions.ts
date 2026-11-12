"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";

const schema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  alternative_title: z.string().trim().max(180).optional(),
  synopsis: z.string().trim().max(12000).optional(),
  cover_url: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["ongoing", "completed", "hiatus"]),
  type: z.enum(["manhwa", "manga", "manhua"]),
  author: z.string().trim().max(120).optional(),
  artist: z.string().trim().max(120).optional(),
  release_year: z.coerce.number().int().min(1900).max(2100).optional().or(z.nan()),
});

export async function createManhwa(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse({
    title: formData.get("title"), slug: formData.get("slug"),
    alternative_title: formData.get("alternative_title") || undefined,
    synopsis: formData.get("synopsis") || undefined, cover_url: formData.get("cover_url") || "",
    status: formData.get("status"), type: formData.get("type"),
    author: formData.get("author") || undefined, artist: formData.get("artist") || undefined,
    release_year: formData.get("release_year") ? Number(formData.get("release_year")) : undefined,
  });
  if (!parsed.success) redirect("/admin/manhwa?error=invalid");
  const { release_year, ...values } = parsed.data;
  const { error } = await supabase.from("manhwa").insert({
    ...values, cover_url: values.cover_url || null,
    release_year: typeof release_year === "number" && Number.isFinite(release_year) ? release_year : null,
    publication_status: "draft",
  });
  if (error) redirect("/admin/manhwa?error=" + encodeURIComponent(error.message));
  revalidatePath("/admin/manhwa"); revalidatePath("/catalog");
  redirect("/admin/manhwa?created=1");
}
