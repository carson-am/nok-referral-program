import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventRecord } from "@/lib/events";
import { getEventDateKey } from "@/lib/events";
import { cn } from "@/lib/utils";

type MonthlyCalendarProps = {
  dates: Date[];
  events?: EventRecord[];
  onDateClick?: (date: Date, events: EventRecord[]) => void;
  compact?: boolean;
  className?: string;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  hasActivity: boolean;
  hasMeeting: boolean;
  meetingEvents: EventRecord[];
};

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MonthlyCalendar({ dates, events = [], onDateClick, compact, className }: MonthlyCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const activitySet = useMemo(() => {
    const set = new Set<string>();
    for (const d of dates) {
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      set.add(key);
    }
    return set;
  }, [dates]);

  const todayKey = getEventDateKey(new Date().toISOString()) ?? toDateKey(today);
  const eventsByDateKey = useMemo(() => {
    const map = new Map<string, EventRecord[]>();
    for (const e of events) {
      const key = getEventDateKey(e.date);
      if (!key) continue;
      if (key < todayKey) continue;
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events, todayKey]);

  const calendarDays: CalendarDay[] = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    const addDay = (date: Date, isCurrentMonth: boolean) => {
      const iso = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      const dateKey = getEventDateKey(date.toISOString()) ?? toDateKey(date);
      const meetingEvents = eventsByDateKey.get(dateKey) ?? [];
      days.push({
        date,
        isCurrentMonth,
        hasActivity: activitySet.has(iso),
        hasMeeting: meetingEvents.length > 0,
        meetingEvents,
      });
    };

    for (let i = 0; i < startDay; i++) {
      const date = new Date(year, month, i - startDay + 1);
      addDay(date, false);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      addDay(date, true);
    }
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1]?.date ?? new Date(year, month, daysInMonth);
      const date = new Date(last);
      date.setDate(date.getDate() + 1);
      addDay(date, false);
    }

    return days;
  }, [activitySet, eventsByDateKey, month, year]);

  const monthLabel = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className={cn("flex h-full flex-col bg-card/50 rounded-[0.75rem]", className)}>
      <CardHeader className={cn("shrink-0", compact ? "pb-1 pt-4" : undefined)}>
        <CardTitle className="text-base text-center">{monthLabel}</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex min-h-0 flex-1 flex-col gap-0 pt-0", compact ? "px-3 pb-0" : "px-3 pb-0")}>
        <div className={cn("grid shrink-0 grid-cols-7 text-center text-xs font-medium text-muted-foreground", compact ? "mb-1" : "mb-2")}>
          {weekdayLabels.map((label) => (
            <div key={label} className="py-0.5">
              {label}
            </div>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-0.5 text-xs">
          {calendarDays.map((day) => {
            const isToday =
              day.date.getFullYear() === today.getFullYear() &&
              day.date.getMonth() === today.getMonth() &&
              day.date.getDate() === today.getDate();

            const hasMeeting = day.hasMeeting && day.meetingEvents.length > 0;
            const Cell = hasMeeting && onDateClick ? "button" : "div";

            return (
              <Cell
                key={day.date.toISOString()}
                type={Cell === "button" ? "button" : undefined}
                onClick={
                  Cell === "button" && onDateClick
                    ? () => onDateClick(day.date, day.meetingEvents)
                    : undefined
                }
                className={cn(
                  "flex min-h-0 items-center justify-center rounded-md border border-transparent transition-colors hover:border-primary/40",
                  Cell === "button" && "cursor-pointer",
                  day.isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                  day.hasActivity ? "bg-primary/20 border-primary/60" : "bg-muted/20",
                  hasMeeting && "ring-1 ring-primary/50",
                  isToday && "ring-1 ring-primary/70"
                )}
              >
                {day.date.getDate()}
              </Cell>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-white/5 px-2 py-3">
          <p className="text-[11px] text-muted-foreground">
            Select a date to view specific meeting details or click an event to join.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

