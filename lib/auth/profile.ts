import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminProfile } from "@/lib/auth/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/lib/types/database";

export type Profile = Tables<"profiles">;

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return ensureProfileForUser(supabase, user);
}

export async function requireUser(nextPath = "/dashboard") {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/login?error=missing-env&next=${encodeURIComponent(nextPath)}`);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?error=auth-required&next=${encodeURIComponent(nextPath)}`);
  }

  await ensureProfileForUser(supabase, user);

  return user;
}

export async function requireAdmin(nextPath = "/admin") {
  const user = await requireUser(nextPath);
  const profile = await getCurrentProfile();

  if (!profile || !isAdminProfile(profile)) {
    redirect("/unauthorized");
  }

  return { user, profile };
}

export async function ensureProfileForUser(
  supabase: SupabaseClient<Database>,
  user: User,
  fullName?: string | null,
): Promise<Profile | null> {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile;
  }

  const displayName =
    fullName ||
    getStringMetadata(user.user_metadata.full_name) ||
    getStringMetadata(user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    null;

  const { data: insertedProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: displayName,
      role: "user",
    })
    .select("*")
    .single();

  if (!error) {
    return insertedProfile;
  }

  const { data: profileAfterRace } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profileAfterRace;
}

function getStringMetadata(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
