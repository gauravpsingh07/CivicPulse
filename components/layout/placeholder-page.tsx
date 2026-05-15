import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to overview
        </Link>
        <Card className="mt-10">
          <CardHeader>
            <Badge variant="warning">{phase}</Badge>
            <div className="mt-6 flex items-start gap-4">
              <span className="grid size-12 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
                <Construction className="size-6" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-3xl">{title}</CardTitle>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  {description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="rounded-md border border-[var(--line)] bg-[#fbfaf3] p-4 text-sm leading-6 text-[var(--muted)]">
              This placeholder is intentional in Phase 0. It keeps navigation
              testable while avoiding data calls, auth flows, or map runtime
              behavior before their dedicated phases.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
