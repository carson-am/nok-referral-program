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

export function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) return null;

  const dateLabel = event.date
    ? new Date(event.date).toLocaleString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  function handleAddToCalendar() {
    if (!event || !event.meetingUrl) return;
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.meetingUrl)}`;
    window.open(calUrl, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[85vh] flex flex-col overflow-hidden rounded-[0.75rem]">
        <DialogHeader>
          <DialogTitle>{event.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {dateLabel && <span>{dateLabel}</span>}
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-xs">
              <Video className="size-3" />
              Virtual
            </span>
          </DialogDescription>
        </DialogHeader>
        {event.description && (
          <ScrollArea className="h-[200px] flex-1 rounded-xl border border-border/70 bg-muted/10 p-4">
            <p className="whitespace-pre-wrap text-sm text-foreground">{event.description}</p>
          </ScrollArea>
        )}
        <div className="flex gap-3 pt-2">
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
