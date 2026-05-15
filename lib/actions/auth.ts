"use server";

import { redirect } from "next/navigation";
import { ensureProfileForUser } from "@/lib/auth/profile";
import type { AuthActionState } from "@/lib/auth/action-state";
import { getSafeNextPath } from "@/lib/auth/utils";
import { getAppUrl } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Check your sign-in details.",
      email: String(formData.get("email") || ""),
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable login.",
      email: parsed.data.email,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: error?.message || "Unable to sign in with those credentials.",
      email: parsed.data.email,
    };
  }

  await ensureProfileForUser(supabase, data.user);
  redirect(parsed.data.next);
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message || "Check your registration details.",
      email: String(formData.get("email") || ""),
      fullName: String(formData.get("fullName") || ""),
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable registration.",
      email: parsed.data.email,
      fullName: parsed.data.fullName,
    };
  }

  const callbackUrl = new URL("/auth/callback", getAppUrl());
  callbackUrl.searchParams.set("next", getSafeNextPath(parsed.data.next));

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: error?.message || "Unable to create an account.",
      email: parsed.data.email,
      fullName: parsed.data.fullName,
    };
  }

  if (data.session) {
    await ensureProfileForUser(supabase, data.user, parsed.data.fullName);
    redirect(parsed.data.next);
  }

  return {
    status: "success",
    message:
      "Account created. Check your email for a confirmation link if your Supabase project requires email confirmation.",
    email: parsed.data.email,
    fullName: parsed.data.fullName,
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login?message=signed-out");
}
