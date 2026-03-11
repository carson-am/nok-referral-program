"use client";

import { CalendarPlus, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EventRecord } from "@/lib/events";

type EventModalProps = {
  event: EventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function buildLiteralDateTimeLabel(raw: string | null | undefined): string {
  if (!raw) {
    return "Date & Time TBD";
  }

  // Accept both ISO and space-separated formats, e.g. "2026-03-25T11:00:00Z" or "2026-03-25 11:00"
  const [datePartRaw, timePartRaw] = raw.split(/[T ]/);
  if (!datePartRaw) return "Date & Time TBD";

  const [yearStr, monthStr, dayStr] = datePartRaw.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "Date & Time TBD";
  }

  // Weekday via Zeller's congruence (avoids Date/timezone)
  const mAdj = month < 3 ? month + 12 : month;
  const yAdj = month < 3 ? year - 1 : year;
  const K = yAdj % 100;
  const J = Math.floor(yAdj / 100);
  const h =
    (day + Math.floor((13 * (mAdj + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) %
    7;
  const weekdayIndex = ((h + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
  const months = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ] as const;

  const weekday = weekdays[weekdayIndex];
  const monthName = months[month] ?? "";

  let timeLabel = "Time TBD";

  if (timePartRaw) {
    const cleanTime = timePartRaw.replace(/Z$/, "").split(":").slice(0, 2);
    const [hStr, mStr] = cleanTime;
    const hNum = Number(hStr);
    const mNum = Number(mStr);
    if (Number.isFinite(hNum) && Number.isFinite(mNum)) {
      const twelveHour = ((hNum + 11) % 12) + 1;
      const suffix = hNum >= 12 ? "PM" : "AM";
      const mm = String(mNum).padStart(2, "0");
      timeLabel = `${twelveHour}:${mm} ${suffix} ET`;
    }
  }

  return `${weekday}, ${monthName} ${day}, ${year} • ${timeLabel}`;
}

export function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) return null;

  const dateLabel = buildLiteralDateTimeLabel(event.date);

  function handleAddToCalendar() {
    if (!event) return;

    // If we don't have a concrete datetime, open a basic template with details.
    if (!event.date) {
      const fallbackUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name,
      )}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
        event.meetingUrl || "",
      )}`;
      window.open(fallbackUrl, "_blank");
      return;
    }

    // Literal parsing of the same raw string used for display.
    const [datePartRaw, timePartRaw] = event.date.split(/[T ]/);
    if (!datePartRaw || !timePartRaw) {
      const fallbackUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name,
      )}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
        event.meetingUrl || "",
      )}`;
      window.open(fallbackUrl, "_blank");
      return;
    }

    const [yearStr, monthStr, dayStr] = datePartRaw.split("-");
    const [hStr, mStr] = timePartRaw.replace(/Z$/, "").split(":").slice(0, 2);
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hour = Number(hStr);
    const minute = Number(mStr);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(hour) ||
      !Number.isFinite(minute)
    ) {
      const fallbackUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name,
      )}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
        event.meetingUrl || "",
      )}`;
      window.open(fallbackUrl, "_blank");
      return;
    }

    const yStr = String(year).padStart(4, "0");
    const mStrPadded = String(month).padStart(2, "0");
    const dStrPadded = String(day).padStart(2, "0");
    const hhStr = String(hour).padStart(2, "0");
    const mmStr = String(minute).padStart(2, "0");

    const startLocal = `${yStr}${mStrPadded}${dStrPadded}T${hhStr}${mmStr}00`;
    // Assume 1-hour duration without timezone math, staying on the same day.
    const endHour = Math.min(hour + 1, 23);
    const endHhStr = String(endHour).padStart(2, "0");
    const endLocal = `${yStr}${mStrPadded}${dStrPadded}T${endHhStr}${mmStr}00`;

    const datesParam = `${startLocal}/${endLocal}`;

    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.name,
    )}&dates=${datesParam}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
      event.meetingUrl || "",
    )}`;
    window.open(calUrl, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[85vh] flex flex-col overflow-hidden rounded-[0.75rem] p-8">
        <DialogHeader>
          <DialogTitle>{event.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="text-slate-200">{dateLabel}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-xs">
              <Video className="size-3" />
              Virtual
            </span>
          </DialogDescription>
        </DialogHeader>
        {event.description && (
          <ScrollArea className="h-[200px] min-h-0 w-full flex-1 rounded-[0.75rem] border border-border/70 bg-muted/10">
            <div className="px-8 py-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{event.description}</p>
            </div>
          </ScrollArea>
        )}
        <div className="flex shrink-0 items-center gap-3 pt-6">
          {event.meetingUrl && (
            <Button asChild className="rounded-[0.75rem]">
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Meeting
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-[0.75rem]"
            onClick={handleAddToCalendar}
          >
            <CalendarPlus className="size-4" />
            Add to Calendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
