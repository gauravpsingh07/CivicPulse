"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signInAction } from "@/lib/actions/auth";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm({
  nextPath,
  initialMessage,
  isConfigured,
}: {
  nextPath: string;
  initialMessage?: string | null;
  isConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialAuthActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Sign in</CardTitle>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Continue to your CivicPulse dashboard and protected reporting tools.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {!isConfigured ? (
            <AuthErrorMessage
              tone="info"
              message="Supabase public environment variables are not configured yet. The form is wired, but authentication cannot complete until setup is done."
            />
          ) : null}
          <AuthErrorMessage
            tone="info"
            message={state.message ? null : initialMessage}
          />
          <AuthErrorMessage
            tone={state.status === "success" ? "success" : "error"}
            message={state.message}
          />
          <input name="next" type="hidden" value={nextPath} />
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
              autoComplete="current-password"
              name="password"
              placeholder="Your password"
              type="password"
            />
          </label>
          <Button className="w-full" disabled={isPending} type="submit">
            <LogIn className="size-4" aria-hidden="true" />
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-sm text-[var(--muted)]">
          New to CivicPulse?{" "}
          <Link
            className="font-semibold text-[var(--accent-strong)]"
            href="/register"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
