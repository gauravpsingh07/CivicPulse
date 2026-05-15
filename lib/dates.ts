const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateTime(value: string | null | undefined) {
  const date = parseDate(value);

  if (!date) {
    return "Unknown date";
  }

  const hour24 = date.getUTCHours();
  const minute = date.getUTCMinutes().toString().padStart(2, "0");
  const hour12 = hour24 % 12 || 12;
  const meridiem = hour24 >= 12 ? "PM" : "AM";

  return `${formatDateOnly(value)} at ${hour12}:${minute} ${meridiem} UTC`;
}

export function formatDateOnly(value: string | null | undefined) {
  const date = parseDate(value);

  if (!date) {
    return "Unknown date";
  }

  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function getResolutionDurationLabel(
  createdAt: string | null | undefined,
  resolvedAt: string | null | undefined,
) {
  const created = parseDate(createdAt);
  const resolved = parseDate(resolvedAt);

  if (!created || !resolved) {
    return "Not resolved yet";
  }

  const diffMs = Math.max(0, resolved.getTime() - created.getTime());
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    return `${diffHours || 1} hour${diffHours === 1 ? "" : "s"}`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
