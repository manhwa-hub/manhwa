"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";

const schema = z.object({
  site_name: z.string().trim().min(1).max(80),
  site_description: z.string().trim().max(240),
  announcement: z.string().trim().max(500),
});

export async function saveSiteSettings(formData: FormData) {
  const { supabase } = await requireStaff(["admin"]);
  const parsed = schema.safeParse({
    site_name: formData.get("site_name"),
    site_description: formData.get("site_description"),
    announcement: formData.get("announcement"),
  });
  if (!parsed.success) redirect("/admin/settings?error=invalid");

  const entries = [
    { key: "site_name", value: { text: parsed.data.site_name }, is_public: true },
    { key: "site_description", value: { text: parsed.data.site_description }, is_public: true },
    { key: "announcement", value: { text: parsed.data.announcement }, is_public: true },
  ];
  const { error } = await supabase.from("site_settings").upsert(entries, { onConflict: "key" });
  if (error) redirect("/admin/settings?error=" + encodeURIComponent(error.message));

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
