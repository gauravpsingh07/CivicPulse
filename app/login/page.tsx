import { LoginForm } from "@/components/auth/login-form";
import { getAuthMessage, getSafeNextPath } from "@/lib/auth/utils";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(getSingleParam(params, "next"));
  const message =
    getAuthMessage(getSingleParam(params, "error")) ||
    getAuthMessage(getSingleParam(params, "message"));

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <section>
          <p className="text-sm font-semibold text-[var(--accent-strong)]">
            Supabase Auth
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Access protected reporting workflows.
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            Sign in to create reports, view your dashboard, and unlock the
            authenticated flows added in this phase.
          </p>
        </section>
        <LoginForm
          initialMessage={message}
          isConfigured={Boolean(getSupabaseBrowserConfig())}
          nextPath={nextPath}
        />
      </div>
    </main>
  );
}

function getSingleParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}
