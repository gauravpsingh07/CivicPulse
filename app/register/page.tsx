import { RegisterForm } from "@/components/auth/register-form";
import { getSafeNextPath } from "@/lib/auth/utils";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(getSingleParam(params, "next"));

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <section>
          <p className="text-sm font-semibold text-[var(--accent-strong)]">
            Reporter account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Create a CivicPulse profile.
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            Registration creates a Supabase Auth user and a profile row for
            role-aware access. Admin promotion is intentionally a manual
            database step.
          </p>
        </section>
        <RegisterForm
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
