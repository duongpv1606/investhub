import { createServerSupabaseClient } from "./supabase";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const supabase = await createServerSupabaseClient();
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();
  if (user?.role !== "ADMIN") redirect("/dashboard");
  return session;
}
