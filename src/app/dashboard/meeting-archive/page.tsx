"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EventRecord } from "@/lib/events";

export default function MeetingArchivePage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/monday/events");
        const data = (await res.json()) as { events?: EventRecord[] };
        setEvents((data.events ?? []).filter(Boolean));
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const pastEvents = events.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d < todayStart;
  });
  pastEvents.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Meeting Archive
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catch up on past discussions and meetings.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading meetings…</p>
      ) : pastEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No past meetings to display.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pastEvents.map((event) => {
            const dateLabel = event.date
              ? new Date(event.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : null;
            return (
              <Card
                key={event.id}
                className="rounded-[0.75rem] border border-border/70 bg-card/50 transition-colors hover:border-primary/60"
              >
                <CardContent className="flex flex-col gap-3 pt-5">
                  <h2 className="text-base font-semibold text-foreground">{event.name}</h2>
                  {dateLabel && (
                    <p className="text-sm text-muted-foreground">{dateLabel}</p>
                  )}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                  )}
                  {event.recordingUrl && (
                    <Button asChild className="w-fit rounded-[0.75rem]" size="sm">
                      <a
                        href={event.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="size-4" />
                        Watch Recording
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
