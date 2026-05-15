import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-32 w-full" />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-28 w-full" key={index} />
          ))}
        </section>
        <section className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </section>
      </div>
    </main>
  );
}
