"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MapError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[var(--background)] px-5 py-10 sm:px-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[#9d3f29]">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5 text-3xl">Map failed to load</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-[var(--muted)]">
            The public map could not be rendered. Try again, or use the issue
            list while map resources recover.
          </p>
          <Button className="mt-6" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
