"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import { MonthlyCalendar } from "@/components/referral-history/MonthlyCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MondayItemBase, MondayStageKey } from "@/lib/monday";
import type { ReferralActivityRow, ReferralRow } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";

type ItemsByStage = Record<MondayStageKey, MondayItemBase[]>;

function createEmptyStageMap(): ItemsByStage {
  return {
    scheduling_initial_call: [],
    scheduling_demo: [],
    demo_scheduled: [],
    getting_3pl_rate_card: [],
    getting_refurb_lines_set: [],
    need_to_follow_up: [],
    on_hold: [],
    stuck: [],
    done: [],
  };
}

// Visual order: On Hold first, then remaining 8 stages (top row 5, bottom row 4 centered).
const STAGE_CONFIGS: { key: MondayStageKey; label: string; colorClass: string }[] = [
  { key: "on_hold", label: "On Hold", colorClass: "bg-muted-foreground/60" },
  {
    key: "scheduling_initial_call",
    label: "Scheduling Initial Call",
    colorClass: "bg-yellow-400",
  },
  { key: "scheduling_demo", label: "Scheduling Demo", colorClass: "bg-orange-400" },
  { key: "demo_scheduled", label: "Demo Scheduled", colorClass: "bg-purple-500" },
  {
    key: "getting_3pl_rate_card",
    label: "Getting 3PL Rate Card",
    colorClass: "bg-sky-500",
  },
  {
    key: "getting_refurb_lines_set",
    label: "Getting Refurb Lines Set",
    colorClass: "bg-emerald-700",
  },
  {
    key: "need_to_follow_up",
    label: "Need to Follow Up",
    colorClass: "bg-sky-300",
  },
  { key: "stuck", label: "Stuck", colorClass: "bg-red-500" },
  { key: "done", label: "Done", colorClass: "bg-lime-500" },
];

type StageModalState = MondayStageKey | null;

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString("en-US", d.getFullYear() !== now.getFullYear() ? { month: "short", day: "numeric", year: "numeric" } : { month: "short", day: "numeric" });
}

export default function ReferralHistoryPage() {
  const { userId } = useAuth();
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  const [itemsByStage, setItemsByStage] = useState<ItemsByStage>(createEmptyStageMap);
  const [loadingPipeline, setLoadingPipeline] = useState(true);
  const [stageModal, setStageModal] = useState<StageModalState>(null);
  const [recentActivity, setRecentActivity] = useState<ReferralActivityRow[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!userId || !supabase) {
      setLoadingReferrals(false);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) {
        setReferrals((data as ReferralRow[]) ?? []);
      }
      setLoadingReferrals(false);
    })();
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/monday/user-pipeline");
        if (!response.ok) {
          setItemsByStage(createEmptyStageMap());
          setLoadingPipeline(false);
          return;
        }
        const data = (await response.json()) as { itemsByStage?: ItemsByStage };
        if (data.itemsByStage) {
          setItemsByStage(data.itemsByStage);
        } else {
          setItemsByStage(createEmptyStageMap());
        }
      } catch (error) {
        console.error("Failed to load Monday pipeline", error);
        setItemsByStage(createEmptyStageMap());
      } finally {
        setLoadingPipeline(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId || !supabase) {
      setLoadingActivity(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("referral_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) {
        setRecentActivity((data as ReferralActivityRow[]) ?? []);
      }
      setLoadingActivity(false);
    })();
  }, [userId]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<MondayStageKey, number> = {
      scheduling_initial_call: 0,
      scheduling_demo: 0,
      demo_scheduled: 0,
      getting_3pl_rate_card: 0,
      getting_refurb_lines_set: 0,
      need_to_follow_up: 0,
      on_hold: 0,
      stuck: 0,
      done: 0,
    };

    (Object.keys(itemsByStage) as MondayStageKey[]).forEach((key) => {
      counts[key] = itemsByStage[key]?.length ?? 0;
    });

    return counts;
  }, [itemsByStage]);

  const totalItems = useMemo(
    () =>
      (Object.keys(pipelineCounts) as MondayStageKey[]).reduce(
        (sum, key) => sum + pipelineCounts[key],
        0
      ),
    [pipelineCounts]
  );

  const potentialRewards = useMemo(() => {
    const stuck = pipelineCounts.stuck ?? 0;
    return Math.max(0, totalItems - stuck) * 5000;
  }, [pipelineCounts.stuck, totalItems]);

  const submissionDates = useMemo(
    () => referrals.map((r) => new Date(r.created_at)),
    [referrals]
  );

  const isLoading = loadingReferrals || loadingPipeline;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Personal Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The command center for your partner introductions; track every stage from submission to close.
        </p>
      </div>

      <Card className="bg-card/50 rounded-[0.75rem]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-col gap-0.5 text-left">
            <CardTitle className="text-base">Potential Rewards</CardTitle>
            <p className="text-xs text-muted-foreground">
              Estimated upside based on all non-stuck referrals in your pipeline.
            </p>
          </div>
          <div className="text-2xl font-bold tracking-tight shrink-0">
            ${potentialRewards.toLocaleString()}
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-card/50 rounded-[0.75rem]">
        <CardHeader>
          <CardTitle className="text-base">Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your pipeline…</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {STAGE_CONFIGS.slice(0, 5).map(({ key, label, colorClass }) => {
                  const count = pipelineCounts[key] ?? 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      className="flex h-28 flex-col justify-between rounded-[0.75rem] border border-border/70 bg-muted/10 p-3 text-left transition-colors hover:border-primary/60 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      onClick={() => count > 0 && setStageModal(key)}
                      disabled={count === 0}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-medium">
                        <span className="text-foreground">{label}</span>
                        <span
                          className={`inline-flex size-2 shrink-0 rounded-full ${colorClass}`}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-foreground">
                          {count}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          {count === 1 ? "partner" : "partners"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {STAGE_CONFIGS.slice(5, 9).map(({ key, label, colorClass }) => {
                    const count = pipelineCounts[key] ?? 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        className="flex h-28 flex-col justify-between rounded-[0.75rem] border border-border/70 bg-muted/10 p-3 text-left transition-colors hover:border-primary/60 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        onClick={() => count > 0 && setStageModal(key)}
                        disabled={count === 0}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-medium">
                          <span className="text-foreground">{label}</span>
                          <span
                            className={`inline-flex size-2 shrink-0 rounded-full ${colorClass}`}
                            aria-hidden
                          />
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-foreground">
                            {count}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            {count === 1 ? "partner" : "partners"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
        <MonthlyCalendar dates={submissionDates} compact />
        <Card className="bg-card/50 rounded-[0.75rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-center md:text-left">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingActivity ? (
              <p className="text-sm text-muted-foreground">Loading activity…</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent stage changes.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {recentActivity.map((a) => (
                  <li key={a.id} className="rounded-[0.75rem] border border-border/60 bg-muted/10 px-3 py-2">
                    {a.from_status ? (
                      <span className="text-foreground">
                        <strong>{a.partner_name}</strong> moved from &quot;{a.from_status}&quot; to &quot;{a.to_status}&quot;
                      </span>
                    ) : (
                      <span className="text-foreground">
                        <strong>{a.partner_name}</strong> submitted
                      </span>
                    )}
                    <span className="ml-1 text-muted-foreground">• {formatTimeAgo(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <StageModal
        stage={stageModal}
        onOpenChange={(open) => !open && setStageModal(null)}
        itemsByStage={itemsByStage}
      />
    </div>
  );
}

function StageModal({
  stage,
  onOpenChange,
  itemsByStage,
}: {
  stage: MondayStageKey | null;
  onOpenChange: (open: boolean) => void;
  itemsByStage: ItemsByStage;
}) {
  if (!stage) return null;

  const items = itemsByStage[stage] ?? [];

  const config = STAGE_CONFIGS.find((s) => s.key === stage);
  const title = config ? config.label : stage;

  return (
    <Dialog open={Boolean(stage)} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto rounded-xl border border-border/80">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No partners in this stage.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-foreground">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const created = item.created_at ? new Date(item.created_at) : null;
                  const createdLabel = created
                    ? created.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-4 py-3 text-foreground">{item.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.statusLabel || "No status yet"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{createdLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

