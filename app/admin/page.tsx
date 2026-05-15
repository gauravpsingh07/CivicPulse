import { AlertCircle, ShieldCheck } from "lucide-react";
import { AdminIssueFilters } from "@/components/admin/admin-issue-filters";
import { AdminIssueTable } from "@/components/admin/admin-issue-table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSummaryCards } from "@/components/admin/admin-summary-cards";
import { RealtimeRefreshPrompt } from "@/components/realtime/realtime-refresh-prompt";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { parseAdminIssueFilters } from "@/lib/admin/filters";
import { getAdminIssues } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/auth/profile";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { user, profile } = await requireAdmin("/admin");
  const query = await searchParams;
  const filters = parseAdminIssueFilters(query);
  const result = await getAdminIssues(filters);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <Badge variant="success">
              <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
              Server-protected admin
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal">
              Admin dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Moderate every issue, filter the operational queue, and open
              individual reports for status changes and admin notes.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm">
            <p className="font-semibold">{user.email}</p>
            <p className="mt-1 text-[var(--muted)]">Role: {profile.role}</p>
          </div>
        </section>

        <AdminSummaryCards summary={result.summary} />
        <RealtimeRefreshPrompt
          channelName="admin-issues-dashboard"
          description="This admin dashboard listens only while the page is open. New submissions and status changes show a refresh prompt so server-side admin filters and private-note rules stay authoritative."
          mode="admin-list"
        />
        <AdminIssueFilters filters={filters} />

        {result.errorMessage ? (
          <AdminNotice message={result.errorMessage} />
        ) : null}

        <AdminIssueTable issues={result.issues} />
        <AdminPagination
          filters={filters}
          pageCount={result.pageCount}
          totalCount={result.totalCount}
        />
      </div>
    </main>
  );
}

function AdminNotice({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 pt-6">
        <AlertCircle
          className="mt-0.5 size-5 text-[#9d3f29]"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-semibold">Unable to load admin data</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
