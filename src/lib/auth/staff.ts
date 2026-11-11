import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "editor";

export async function requireStaff(allowed: StaffRole[] = ["admin", "editor"]) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=configuration");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.app_metadata?.role;
  if (!allowed.includes(role)) redirect("/");

  return { supabase, user, role: role as StaffRole };
}
