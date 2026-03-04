import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MonthlyCalendarProps = {
  dates: Date[];
  compact?: boolean;
  className?: string;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  hasActivity: boolean;
};

export function MonthlyCalendar({ dates, compact, className }: MonthlyCalendarProps) {
  const today = new Date();
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

  const calendarDays: CalendarDay[] = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    // Leading days from previous month
    for (let i = 0; i < startDay; i++) {
      const date = new Date(year, month, i - startDay + 1);
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      days.push({
        date,
        isCurrentMonth: false,
        hasActivity: activitySet.has(key),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      days.push({
        date,
        isCurrentMonth: true,
        hasActivity: activitySet.has(key),
      });
    }

    // Ensure full weeks (up to 6 weeks / 42 cells)
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1]?.date ?? new Date(year, month, daysInMonth);
      const date = new Date(last);
      date.setDate(date.getDate() + 1);
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      days.push({
        date,
        isCurrentMonth: false,
        hasActivity: activitySet.has(key),
      });
    }

    return days;
  }, [activitySet, month, year]);

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

            return (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "flex min-h-0 items-center justify-center rounded-md border border-transparent transition-colors hover:border-primary/40",
                  day.isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                  day.hasActivity ? "bg-primary/20 border-primary/60" : "bg-muted/20",
                  isToday && "ring-1 ring-primary/70"
                )}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-white/5 px-2 py-3">
          <p className="text-xs font-medium text-foreground">{monthLabel} Overview</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Select a date to view specific meeting details or click an event to join.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

