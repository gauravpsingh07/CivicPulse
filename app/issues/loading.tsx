import { Skeleton } from "@/components/ui/skeleton";

export default function IssuesLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-72 w-full" key={index} />
          ))}
        </section>
      </div>
    </main>
  );
}
