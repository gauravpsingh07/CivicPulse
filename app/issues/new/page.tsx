import { IssueForm } from "@/components/issues/issue-form";
import { requireUser } from "@/lib/auth/profile";

export default async function NewIssuePage() {
  await requireUser("/issues/new");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <IssueForm />
      </div>
    </main>
  );
}
