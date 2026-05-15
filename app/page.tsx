import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  ClipboardList,
  Camera,
  CircleCheck,
  FilePlus2,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getPublicIssueStats } from "@/lib/issues/public";

const featureCards = [
  {
    title: "Report issues with photos and map location",
    description:
      "Submit a clear report with details, urgency, an optional photo, and a precise location on the map.",
    icon: MapPin,
  },
  {
    title: "Track status from Open to Resolved",
    description:
      "Follow public status updates as reports move from review to resolution.",
    icon: CircleCheck,
  },
  {
    title: "View nearby issues on a public map",
    description:
      "Explore visible community reports by category, urgency, and current status.",
    icon: ClipboardList,
  },
  {
    title: "High-priority reports notify admins",
    description:
      "Urgent reports can alert the moderation team so safety concerns get attention faster.",
    icon: BellRing,
  },
];

const howItWorks = [
  {
    title: "Submit a report",
    description:
      "Describe the issue, choose a category and urgency, add a location, and attach a photo when helpful.",
  },
  {
    title: "Location appears on the map",
    description:
      "Approved public reports become easy to find on the issue list and map.",
  },
  {
    title: "Admin reviews and updates status",
    description:
      "Community admins moderate reports, update progress, and add public updates.",
  },
  {
    title: "Community tracks progress",
    description:
      "Residents can follow status changes from open reports through resolution.",
  },
];

const trustItems = [
  {
    title: "Secure sign-in",
    description:
      "Accounts help protect reporting tools and let admins manage sensitive workflows.",
    icon: ShieldCheck,
  },
  {
    title: "Public status tracking",
    description:
      "Visible reports show clear status history so residents know what changed.",
    icon: CheckCircle2,
  },
  {
    title: "Image uploads",
    description:
      "Photos can add context while keeping reports organized with location and category details.",
    icon: Camera,
  },
  {
    title: "Admin moderation",
    description:
      "Admins review reports, update progress, and keep private notes out of the public view.",
    icon: UsersRound,
  },
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
                Community issue reporting
              </Badge>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-balance sm:text-6xl lg:text-7xl">
                Report local issues. Track progress on a public map.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--muted)]">
                CivicPulse helps residents report potholes, broken streetlights,
                water leaks, unsafe sidewalks, trash overflow, and other local
                concerns with clear location and status tracking.
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
                    <p className="text-sm font-semibold">Public issue map</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Residents can view nearby reports and follow progress as
                      admins review and update status.
                    </p>
                  </div>
                  <Badge variant="warning">Open</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["Open", "In progress", "Resolved"].map((status) => (
                    <div
                      key={status}
                      className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold"
                    >
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <Badge variant="default">For residents and community teams</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
              A simple place to report, review, and follow local issues.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              CivicPulse keeps reports understandable for residents and
              organized for the people responsible for reviewing them.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="mx-auto max-w-7xl">
          <div>
            <Badge variant="default">How it works</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
              From report to resolution, every step stays visible.
            </h2>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              CivicPulse gives residents a clear path for submitting concerns
              and gives admins a focused workflow for reviewing and updating
              them.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardHeader>
                    <span className="grid size-10 place-items-center rounded-md bg-white text-sm font-semibold text-[var(--accent-strong)]">
                      {index + 1}
                    </span>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <Badge variant="success">Public trust</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
              Built around clear updates and responsible moderation.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Public tracking keeps residents informed, while protected admin
              tools keep sensitive moderation details out of the public view.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trustItems.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <div className="mb-5 grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--foreground)] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#bee5c4]">
              <FilePlus2 className="size-4" aria-hidden="true" />
              Ready to report a local concern?
            </div>
            <h2 className="mt-4 text-3xl font-semibold">
              Help your community see what needs attention.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/issues/new"
              className={buttonVariants({ variant: "light" })}
            >
              Report an issue
            </Link>
            <Link
              href="/map"
              className={buttonVariants({ variant: "outlineDark" })}
            >
              View public map
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
