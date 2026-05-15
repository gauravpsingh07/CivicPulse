import Link from "next/link";
import type { ReactNode } from "react";
import {
  BellRing,
  CheckCircle2,
  ClipboardList,
  Database,
  Lock,
  MapPin,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  ISSUE_URGENCY_LEVELS,
} from "@/lib/constants";
import { getPublicIssueStats } from "@/lib/issues/public";

const featureCards = [
  {
    title: "Map-first reporting",
    description:
      "Residents submit issues with a map-selected location, category, urgency, and optional photo.",
    icon: MapPin,
  },
  {
    title: "Public transparency",
    description:
      "Approved issues appear on public list, detail, and map views with clear status history.",
    icon: ClipboardList,
  },
  {
    title: "Admin workflow",
    description:
      "Moderators can prioritize, update status, add notes, and keep the community timeline accurate.",
    icon: ShieldCheck,
  },
  {
    title: "Realtime civic pulse",
    description:
      "Supabase Realtime powers live map and dashboard updates when reports are created or changed.",
    icon: RadioTower,
  },
  {
    title: "High-priority alerts",
    description:
      "High and critical reports can notify a Discord channel without paid email infrastructure.",
    icon: BellRing,
  },
  {
    title: "Portfolio-grade backend",
    description:
      "PostgreSQL tables, RLS policies, storage, validation, tests, CI, and deployment docs are planned from day one.",
    icon: Database,
  },
];

const stackItems = [
  "Next.js App Router",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "Leaflet",
  "OpenStreetMap",
  "Recharts",
  "Vitest",
  "GitHub Actions",
  "Vercel",
];

const roadmap = [
  "Phase 0: scaffold, UI foundation, docs, CI",
  "Phase 1: Supabase schema, RLS, seed data",
  "Phase 2: auth and protected dashboard",
  "Phase 3: report form, map picker, image validation",
  "Phase 4+: public views, map, admin, realtime, alerts, analytics",
];

export default async function Home() {
  const publicStats = await getPublicIssueStats();
  const heroStats = [
    [publicStats.totalPublicIssues.toString(), "public issues"],
    [publicStats.activeCount.toString(), "active reports"],
    [publicStats.resolvedCount.toString(), "resolved/closed"],
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative isolate min-h-[92vh] px-5 py-5 sm:px-8">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(115deg,#f8fbf3_0%,#f0f7eb_34%,#fbf6ec_68%,#eef7f8_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-70 [background-image:linear-gradient(rgba(31,138,91,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(52,120,168,0.12)_1px,transparent_1px)] [background-size:84px_84px]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-3xl py-12 lg:py-20">
              <Badge variant="success" className="mb-6">
                Analytics and alerts ready
              </Badge>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-balance sm:text-6xl lg:text-7xl">
                CivicPulse
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--muted)]">
                A full-stack geospatial platform for reporting civic issues,
                tracking public status, and coordinating admin response without
                paid maps, email, or background-job services.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/issues/new"
                  className={buttonVariants({ size: "lg" })}
                >
                  Report an issue
                </Link>
                <Link
                  href="/map"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                  })}
                >
                  View public map
                </Link>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
                {heroStats.map(([value, label]) => (
                  <div
                    key={label}
                    className="border-l border-[var(--line)] pl-4"
                  >
                    <div className="text-2xl font-semibold">{value}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-[var(--line)] bg-[#e8f1e2] shadow-2xl shadow-[#1f3b2c]/10">
              <div className="absolute inset-0 [background-image:linear-gradient(35deg,transparent_46%,rgba(255,255,255,0.76)_47%,rgba(255,255,255,0.76)_53%,transparent_54%),linear-gradient(125deg,transparent_45%,rgba(255,255,255,0.68)_46%,rgba(255,255,255,0.68)_52%,transparent_53%)] [background-size:180px_180px,220px_220px]" />
              <div className="absolute left-[10%] top-[16%] h-24 w-44 rounded-full bg-[#bfdca5]/80" />
              <div className="absolute bottom-[12%] right-[12%] h-36 w-52 rounded-full bg-[#a8cfdd]/70" />
              <div className="absolute left-[18%] top-[34%] h-2 w-56 rotate-[-18deg] rounded-full bg-[#f7f1d4]" />
              <div className="absolute right-[18%] top-[40%] h-2 w-64 rotate-[23deg] rounded-full bg-[#f7f1d4]" />
              <div className="absolute bottom-[27%] left-[25%] h-2 w-72 rotate-[8deg] rounded-full bg-[#f7f1d4]" />
              <MapMarker
                className="left-[22%] top-[23%]"
                tone="critical"
                label="Water leak"
              />
              <MapMarker
                className="right-[18%] top-[30%]"
                tone="progress"
                label="Streetlight"
              />
              <MapMarker
                className="bottom-[23%] left-[37%]"
                tone="resolved"
                label="Pothole"
              />
              <MapMarker
                className="bottom-[34%] right-[28%]"
                tone="open"
                label="Sidewalk"
              />

              <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/70 bg-white/88 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Live civic queue</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Public reports, admin review, and status changes converge
                      in one operational view.
                    </p>
                  </div>
                  <Badge variant="warning">Open</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {ISSUE_STATUSES.slice(0, 3).map((status) => (
                    <div
                      key={status.value}
                      className="rounded-md border border-[var(--line)] bg-white px-3 py-2"
                    >
                      <div className="text-xs text-[var(--muted)]">
                        {status.label}
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {status.value === "open"
                          ? "18"
                          : status.value === "in_progress"
                            ? "7"
                            : "24"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-5 grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
                  <feature.icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#fbfaf3] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <Badge variant="default">Architecture</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
              Built for real backend depth, not just interface polish.
            </h2>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              The final system pairs Next.js pages and server logic with
              Supabase Auth, PostgreSQL, Storage, Realtime, and database-level
              Row Level Security. The current build includes protected report
              creation, map-picked coordinates, validated images, and optional
              high-priority alerts.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <StackPanel
              title="Core stack"
              icon={<Database className="size-5" aria-hidden="true" />}
              items={stackItems}
            />
            <StackPanel
              title="Guardrails"
              icon={<Lock className="size-5" aria-hidden="true" />}
              items={[
                "No service-role key in client code",
                "OpenStreetMap attribution required",
                "Leaflet isolated from SSR",
                "Image uploads capped at 2 MB",
                "Pagination for growing issue lists",
                "Admin checks enforced server-side",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Issue model foundations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <TokenList
                title="Categories"
                items={ISSUE_CATEGORIES.map((item) => item.label)}
              />
              <TokenList
                title="Urgency"
                items={ISSUE_URGENCY_LEVELS.map((item) => item.label)}
              />
              <TokenList
                title="Status lifecycle"
                items={ISSUE_STATUSES.map((item) => item.label)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase-by-phase build path</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {roadmap.map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-[var(--surface-strong)] text-sm font-semibold text-[var(--accent-strong)]">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-[var(--muted)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-[var(--foreground)] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#bee5c4]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Phase 9 adds admin analytics.
            </div>
            <h2 className="mt-4 text-3xl font-semibold">
              Ready for deployment polish and demo packaging.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/issues"
              className={buttonVariants({ variant: "light" })}
            >
              Browse issues
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outlineDark" })}
            >
              Continue to login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function MapMarker({
  className,
  tone,
  label,
}: {
  className: string;
  tone: "critical" | "progress" | "resolved" | "open";
  label: string;
}) {
  const toneClass = {
    critical: "bg-[var(--coral)]",
    progress: "bg-[var(--blue)]",
    resolved: "bg-[var(--accent)]",
    open: "bg-[var(--amber)]",
  }[tone];

  return (
    <div className={`absolute ${className}`}>
      <div className="flex items-center gap-2 rounded-md border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur">
        <span className={`size-3 rounded-full ${toneClass}`} />
        {label}
      </div>
    </div>
  );
}

function StackPanel({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-white text-[var(--accent-strong)]">
            {icon}
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="neutral">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TokenList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="neutral">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
