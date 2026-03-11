export type EventRecord = {
  id: string;
  name: string;
  date: string | null;
  description: string;
  recordingUrl: string | null;
  meetingUrl: string | null;
};

export function getEventDateKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Brute-force date normalization: take the first 10 characters (YYYY-MM-DD)
  // from the raw Monday date string or ISO string. This avoids timezone
  // shifts when matching events to calendar days.
  const key = raw.substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  return key;
}

type FormatOptions = {
  includeWeekday?: boolean;
};

export function formatEventDateTime(
  raw: string | null | undefined,
  { includeWeekday = true }: FormatOptions = {},
): string | null {
  if (!raw) return null;

  try {
    const iso = raw.includes("T") && /Z$/.test(raw) ? raw : `${raw}Z`.replace(/ZZ$/, "Z");
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: includeWeekday ? "long" : undefined,
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });

    const dateLabel = dateFormatter.format(date);

    // Treat midnight (00:00) as \"no specific time\" / TBD.
    const isMidnightUtc = date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
    const hasExplicitTime = !isMidnightUtc;

    const timeLabel = hasExplicitTime ? `${timeFormatter.format(date)} ET` : "Time TBD";

    return `${dateLabel} • ${timeLabel}`;
  } catch {
    return null;
  }
}

