import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "editor";

export async function requireStaff(allowed: StaffRole[] = ["admin", "editor"]) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=configuration");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !allowed.includes(profile.role as StaffRole)) {
    redirect("/");
  }

  return { supabase, user, role: profile.role as StaffRole };
}
