import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[62vh] min-h-[420px] w-full" />
      </div>
    </main>
  );
}
