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
  const [datePart] = raw.split("T");
  if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  return datePart;
}

type FormatOptions = {
  includeWeekday?: boolean;
};

export function formatEventDateTime(
  raw: string | null | undefined,
  { includeWeekday = true }: FormatOptions = {},
): string | null {
  const dateKey = getEventDateKey(raw);
  if (!dateKey) return null;

  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) {
    return null;
  }

  const baseDate = new Date(year, monthIndex, day);

  const dateLabel = baseDate.toLocaleDateString("en-US", {
    weekday: includeWeekday ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timePartFull = raw?.split("T")[1] ?? "";
  const timeToken = timePartFull.split(/[Z+.-]/)[0] || "";
  const hhmm = timeToken.slice(0, 5); // HH:MM

  let timeLabel: string;
  if (!hhmm || hhmm === "00:00") {
    timeLabel = "Time TBD";
  } else {
    const [hStr, mStr] = hhmm.split(":");
    const hour = Number(hStr);
    const minute = Number(mStr);
    const timeDate = new Date(year, monthIndex, day, hour, minute);
    const localized = timeDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    timeLabel = `${localized} ET`;
  }

  return `${dateLabel} • ${timeLabel}`;
}

