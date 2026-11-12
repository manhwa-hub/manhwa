"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";

const schema = z.object({
  manhwa_id: z.string().uuid(),
  chapter_number: z.coerce.number().finite().min(0).max(100000),
  title: z.string().trim().max(180).optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  scheduled_at: z.string().optional(),
});

export async function saveChapter(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse({
    manhwa_id: formData.get("manhwa_id"),
    chapter_number: formData.get("chapter_number"),
    title: formData.get("title") || undefined,
    status: formData.get("status"),
    scheduled_at: formData.get("scheduled_at") || undefined,
  });
  if (!parsed.success) redirect("/admin/chapters?error=invalid");

  const { manhwa_id, chapter_number, title, status, scheduled_at } = parsed.data;
  const values = {
    manhwa_id,
    chapter_number,
    title: title || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    scheduled_at: status === "scheduled" && scheduled_at ? new Date(scheduled_at).toISOString() : null,
  };
  const { error } = await supabase.from("chapters").insert(values);
  if (error) redirect("/admin/chapters?error=" + encodeURIComponent(error.message));
  revalidatePath("/admin/chapters");
  revalidatePath("/catalog");
  redirect("/admin/chapters?saved=1");
}

export async function updateChapterStatus(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!z.string().uuid().safeParse(id).success || !["draft", "published", "scheduled"].includes(status)) {
    redirect("/admin/chapters?error=invalid-status");
  }
  const { error } = await supabase.from("chapters").update({
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) redirect("/admin/chapters?error=" + encodeURIComponent(error.message));
  revalidatePath("/admin/chapters");
  redirect("/admin/chapters?updated=1");
}

export async function deleteChapter(formData: FormData) {
  const { supabase } = await requireStaff(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) redirect("/admin/chapters?error=invalid-id");
  const { error } = await supabase.from("chapters").delete().eq("id", id);
  if (error) redirect("/admin/chapters?error=" + encodeURIComponent(error.message));
  revalidatePath("/admin/chapters");
  redirect("/admin/chapters?deleted=1");
}
