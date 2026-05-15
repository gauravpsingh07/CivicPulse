"use client";

import Link from "next/link";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RegisterForm({
  nextPath,
  isConfigured,
}: {
  nextPath: string;
  isConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialAuthActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Create account</CardTitle>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Register with Supabase Auth to submit reports and track your civic
          issue history.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {!isConfigured ? (
            <AuthErrorMessage
              tone="info"
              message="Supabase public environment variables are not configured yet. Registration will be available once setup is complete."
            />
          ) : null}
          <AuthErrorMessage
            tone={state.status === "success" ? "success" : "error"}
            message={state.message}
          />
          <input name="next" type="hidden" value={nextPath} />
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Full name</span>
            <Input
              autoComplete="name"
              defaultValue={state.fullName}
              name="fullName"
              placeholder="Alex Morgan"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Email</span>
            <Input
              autoComplete="email"
              defaultValue={state.email}
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Password</span>
            <Input
              autoComplete="new-password"
              name="password"
              placeholder="At least 8 characters"
              type="password"
            />
          </label>
          <Button className="w-full" disabled={isPending} type="submit">
            <UserPlus className="size-4" aria-hidden="true" />
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-5 text-sm text-[var(--muted)]">
          Already registered?{" "}
          <Link
            className="font-semibold text-[var(--accent-strong)]"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
