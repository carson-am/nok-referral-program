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
import { formatEventDateTime } from "@/lib/events";

type EventModalProps = {
  event: EventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) return null;

  const dateLabel = formatEventDateTime(event.date, { includeWeekday: true });

  function handleAddToCalendar() {
    if (!event) return;

    // Fallback: if we don't have a concrete datetime, just open a basic template with details.
    if (!event.date) {
      const fallbackUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name,
      )}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
        event.meetingUrl || "",
      )}`;
      window.open(fallbackUrl, "_blank");
      return;
    }

    try {
      const iso = event.date.includes("T") && /Z$/.test(event.date)
        ? event.date
        : `${event.date}Z`.replace(/ZZ$/, "Z");
      const utcDate = new Date(iso);
      if (Number.isNaN(utcDate.getTime())) {
        const fallbackUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          event.name,
        )}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
          event.meetingUrl || "",
        )}`;
        window.open(fallbackUrl, "_blank");
        return;
      }

      // Convert UTC to America/New_York components using Intl.
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(utcDate);

      const getPart = (type: string) => parts.find((p) => p.type === type)?.value;
      const year = getPart("year") ?? "0000";
      const month = getPart("month") ?? "01";
      const day = getPart("day") ?? "01";
      const hour = getPart("hour") ?? "00";
      const minute = getPart("minute") ?? "00";

      // Treat midnight as \"no specific time\"; in that case, just open a date-only template.
      const isMidnight = hour === "00" && minute === "00";

      let datesParam = "";
      if (!isMidnight) {
        const startLocal = `${year}${month}${day}T${hour}${minute}00`;
        // Assume 1 hour duration.
        const startEt = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          0,
        );
        const endEt = new Date(startEt.getTime() + 60 * 60 * 1000);
        const endParts = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(endEt);
        const endYear = endParts.find((p) => p.type === "year")?.value ?? year;
        const endMonth = endParts.find((p) => p.type === "month")?.value ?? month;
        const endDay = endParts.find((p) => p.type === "day")?.value ?? day;
        const endHour = endParts.find((p) => p.type === "hour")?.value ?? hour;
        const endMinute = endParts.find((p) => p.type === "minute")?.value ?? minute;
        const endLocal = `${endYear}${endMonth}${endDay}T${endHour}${endMinute}00`;
        datesParam = `${startLocal}/${endLocal}`;
      }

      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name,
      )}${
        datesParam ? `&dates=${datesParam}` : ""
      }&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
        event.meetingUrl || "",
      )}`;
    window.open(calUrl, "_blank");
    } catch {
      const fallbackUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name,
      )}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
        event.meetingUrl || "",
      )}`;
      window.open(fallbackUrl, "_blank");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[85vh] flex flex-col overflow-hidden rounded-[0.75rem] p-8">
        <DialogHeader>
          <DialogTitle>{event.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {dateLabel && <span className="text-foreground">{dateLabel}</span>}
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
