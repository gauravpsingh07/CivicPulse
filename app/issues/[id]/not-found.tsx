import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IssueNotFoundPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <Badge variant="neutral">Not found</Badge>
            <CardTitle className="mt-5 text-3xl">Issue unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[var(--muted)]">
              This issue is private, rejected, or does not exist.
            </p>
            <Link
              className={buttonVariants({ className: "mt-6" })}
              href="/issues"
            >
              Back to public issues
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
