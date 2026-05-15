import { Skeleton } from "@/components/ui/skeleton";

export default function NewIssueLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </main>
  );
}
