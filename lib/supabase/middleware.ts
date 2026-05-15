import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import type { Database } from "@/lib/types/database";

const authRequiredPaths = ["/dashboard", "/issues/new"];
const adminRequiredPaths = ["/admin"];

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const needsUser = matchesPath(pathname, authRequiredPaths);
  const needsAdmin = matchesPath(pathname, adminRequiredPaths);
  const config = getSupabaseBrowserConfig();

  if (!config) {
    if (needsUser || needsAdmin) {
      return redirectToLogin(request, "missing-env");
    }

    return response;
  }

  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((needsUser || needsAdmin) && !user) {
    return redirectToLogin(request, "auth-required");
  }

  if (needsAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", "admin-required");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

function matchesPath(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function redirectToLogin(request: NextRequest, error: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("error", error);
  redirectUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(redirectUrl);
}
