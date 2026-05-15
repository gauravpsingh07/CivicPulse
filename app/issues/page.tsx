import Link from "next/link";
import { AlertCircle, ClipboardList } from "lucide-react";
import { IssueCard } from "@/components/issues/issue-card";
import { IssueFilters } from "@/components/issues/issue-filters";
import { IssuePagination } from "@/components/issues/issue-pagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePublicIssueFilters } from "@/lib/issues/filters";
import { getPublicIssues } from "@/lib/issues/public";

type IssuesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  const query = await searchParams;
  const filters = parsePublicIssueFilters(query);
  const result = await getPublicIssues(filters);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Badge variant="success">Public reports</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal">
              Community issue list
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Browse approved public reports by status, category, urgency, and
              date. Private reports and rejected issues are excluded from this
              view.
            </p>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/issues/new">
            Report an issue
          </Link>
        </section>

        <IssueFilters filters={filters} />

        {!result.isConfigured || result.errorMessage ? (
          <IssueListNotice
            message={result.errorMessage || "Unable to load public issues."}
            title={
              !result.isConfigured
                ? "Supabase setup needed"
                : "Unable to load issues"
            }
          />
        ) : null}

        {result.issues.length ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--muted)]">
                Showing {result.issues.length} of {result.totalCount} public
                issues
              </p>
            </div>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {result.issues.map((issue) => (
                <IssueCard issue={issue} key={issue.id} />
              ))}
            </section>
            <IssuePagination
              filters={filters}
              pageCount={result.pageCount}
              totalCount={result.totalCount}
            />
          </>
        ) : (
          <EmptyIssueList />
        )}
      </div>
    </main>
  );
}

function IssueListNotice({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="flex gap-3 pt-6">
        <AlertCircle
          className="mt-0.5 size-5 text-[#9d3f29]"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyIssueList() {
  return (
    <Card>
      <CardHeader>
        <div className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
          <ClipboardList className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="mt-5">No public issues found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Try adjusting the filters, or submit a new report once you are signed
          in. Seed data will appear here after Supabase is configured and the
          migrations have been run.
        </p>
      </CardContent>
    </Card>
  );
}
