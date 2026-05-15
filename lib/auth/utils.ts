import type { Tables } from "@/lib/types/database";

export function getSafeNextPath(
  value: FormDataEntryValue | string | null | undefined,
) {
  if (typeof value !== "string") {
    return "/dashboard";
  }

  const nextPath = value.trim();

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export function isAdminProfile(
  profile: Pick<Tables<"profiles">, "role"> | null | undefined,
) {
  return profile?.role === "admin";
}

export function getAuthMessage(code: string | null | undefined) {
  switch (code) {
    case "auth-required":
      return "Sign in to continue.";
    case "admin-required":
      return "Admin access is required for that page.";
    case "missing-env":
      return "Supabase is not configured yet. Add the public Supabase URL and anon key to enable authentication.";
    case "signed-out":
      return "You have been signed out.";
    default:
      return null;
  }
}
