"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function saveGenre(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({ name: formData.get("name"), slug: formData.get("slug") });
  if (!parsed.success) redirect("/admin/genres?error=invalid");
  const result = id
    ? await supabase.from("genres").update(parsed.data).eq("id", id)
    : await supabase.from("genres").insert(parsed.data);
  if (result.error) redirect("/admin/genres?error=" + encodeURIComponent(result.error.message));
  revalidatePath("/admin/genres"); revalidatePath("/catalog");
  redirect("/admin/genres?saved=1");
}

export async function deleteGenre(formData: FormData) {
  const { supabase } = await requireStaff(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) redirect("/admin/genres?error=invalid-id");
  const { error } = await supabase.from("genres").delete().eq("id", id);
  if (error) redirect("/admin/genres?error=" + encodeURIComponent(error.message));
  revalidatePath("/admin/genres");
  redirect("/admin/genres?deleted=1");
}
