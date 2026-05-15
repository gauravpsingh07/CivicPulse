import Link from "next/link";
import type { ReactNode } from "react";
import { ClipboardList, Map, PlusCircle } from "lucide-react";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthMessage } from "@/lib/auth/utils";
import { getCurrentProfile, requireUser } from "@/lib/auth/profile";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser("/dashboard");
  const profile = await getCurrentProfile();
  const params = await searchParams;
  const message = getAuthMessage(getSingleParam(params, "error"));

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <AuthErrorMessage tone="info" message={message} />
        <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-strong)]">
              Protected dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}.
            </h1>
            <p className="mt-3 text-base text-[var(--muted)]">{user.email}</p>
          </div>
          <Badge variant={profile?.role === "admin" ? "success" : "neutral"}>
            {profile?.role || "user"}
          </Badge>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <DashboardAction
            description="Open the protected report route. The actual issue form arrives in Phase 3."
            href="/issues/new"
            icon={<PlusCircle className="size-5" aria-hidden="true" />}
            title="Create report"
          />
          <DashboardAction
            description="Public issue browsing remains available while data fetching arrives later."
            href="/issues"
            icon={<ClipboardList className="size-5" aria-hidden="true" />}
            title="My reports"
          />
          <DashboardAction
            description="Preview the public map shell before Leaflet is wired into the app."
            href="/map"
            icon={<Map className="size-5" aria-hidden="true" />}
            title="Public map"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardAction({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
        <Link className={buttonVariants({ className: "mt-5" })} href={href}>
          Open
        </Link>
      </CardContent>
    </Card>
  );
}

function getSingleParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}
