import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/profile";

export default async function AdminPage() {
  const { user, profile } = await requireAdmin("/admin");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">
          Server-protected admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Admin dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          This shell is available only after a server-side profile check
          confirms `profiles.role = admin`. Issue moderation and analytics
          arrive in later phases.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Admin session verified</CardTitle>
                <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="success">{profile.role}</Badge>
            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              Phase 6 will add the admin issue table, status update dialog,
              moderation notes, and status history workflows here.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
