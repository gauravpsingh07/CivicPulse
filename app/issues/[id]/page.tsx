import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IssueCreatedPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IssueCreatedPage({
  params,
  searchParams,
}: IssueCreatedPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const wasCreated = getSingleParam(query, "created") === "1";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            {wasCreated ? (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
                Issue submitted
              </Badge>
            ) : (
              <Badge variant="neutral">Issue shell</Badge>
            )}
            <CardTitle className="mt-5 text-3xl">
              Issue detail placeholder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Issue `{id}` was routed here after submission. Full public detail,
              timeline, image rendering, and comments arrive in Phase 4.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link className={buttonVariants()} href="/issues/new">
                Submit another issue
              </Link>
              <Link
                className={buttonVariants({ variant: "secondary" })}
                href="/dashboard"
              >
                Back to dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
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
