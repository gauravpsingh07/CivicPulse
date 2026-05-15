import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[var(--background)] px-5 py-10 sm:px-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
            <SearchX className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5 text-3xl">Page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-[var(--muted)]">
            This page may have moved, or the issue may not be public.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonVariants()} href="/issues">
              Browse public issues
            </Link>
            <Link className={buttonVariants({ variant: "secondary" })} href="/">
              Go home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
