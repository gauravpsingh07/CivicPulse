import Link from "next/link";
import { RadioTower } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/profile";
import { isAdminProfile } from "@/lib/auth/utils";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const isAdmin = isAdminProfile(profile);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/92 px-5 backdrop-blur sm:px-8">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-10 place-items-center rounded-md bg-[var(--accent)] text-white">
            <RadioTower className="size-5" aria-hidden="true" />
          </span>
          <span>CivicPulse</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-[var(--muted)]">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/"
          >
            Home
          </Link>
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/issues"
          >
            Issues
          </Link>
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/map"
          >
            Map
          </Link>
          {user ? (
            <>
              <Link
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href="/issues/new"
              >
                New Report
              </Link>
              <Link
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href="/dashboard"
              >
                Dashboard
              </Link>
              {isAdmin ? (
                <Link
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  href="/admin"
                >
                  Admin
                </Link>
              ) : null}
              {profile ? <Badge variant="neutral">{profile.role}</Badge> : null}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href="/register"
              >
                Register
              </Link>
              <Link
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href="/login"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
