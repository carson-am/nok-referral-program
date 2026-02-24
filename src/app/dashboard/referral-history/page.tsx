"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Activity,
  CheckCircle2,
  DollarSign,
  Users,
} from "lucide-react";

import { MomentumChart } from "@/components/referral-history/MomentumChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deriveHeroStats,
  deriveMomentumData,
  derivePipelineCounts,
  deriveRecentActivity,
  getPartnersByStatus,
} from "@/lib/referrals/derive-dashboard";
import type { ActivityType, ReferralPartner } from "@/lib/mock/referral-history";
import type { ReferralRow } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils/relative-time";

const DURATION_MS = 800;

function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || target <= 0) {
      setValue(target);
      return;
    }
    startRef.current = null;
    setValue(0);

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const easeOut = 1 - (1 - progress) ** 2;
      const next = Math.round(easeOut * target);
      setValue(next);
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, enabled]);

  return value;
}

function formatDateReferred(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PartnersModal({
  open,
  onOpenChange,
  title,
  partners,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  partners: ReferralPartner[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto rounded-xl border border-border/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-foreground">Partner Name</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Date Referred</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Industry</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr
                  key={`${p.partnerName}-${i}`}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3 text-foreground">{p.partnerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateReferred(p.dateReferred)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.industry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getActivityDotColor(type: ActivityType): string {
  switch (type) {
    case "submitted":
      return "bg-muted-foreground/60";
    case "under_review":
      return "bg-muted-foreground/80";
    case "in_conversation":
      return "bg-primary";
    case "converted":
      return "bg-emerald-500";
    default:
      return "bg-muted-foreground/60";
  }
}

type ModalKind = "total" | "active" | "converted" | null;
type PipelineStageKey = "submitted" | "under_review" | "in_conversation" | "converted";

export default function ReferralHistoryPage() {
  const { userId } = useAuth();
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [pipelineModal, setPipelineModal] = useState<PipelineStageKey | null>(null);

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error) setReferrals((data as ReferralRow[]) ?? []);
      setLoading(false);
    })();
  }, [userId]);

  const heroStats = useMemo(() => deriveHeroStats(referrals), [referrals]);
  const pipelineCounts = useMemo(() => derivePipelineCounts(referrals), [referrals]);
  const momentumData = useMemo(() => deriveMomentumData(referrals), [referrals]);
  const recentActivity = useMemo(() => deriveRecentActivity(referrals), [referrals]);
  const totalReferrals = heroStats.totalReferrals;
  const showEmptyState = !loading && totalReferrals === 0;

  const totalDisplay = useCountUp(heroStats.totalReferrals, !showEmptyState);
  const activeDisplay = useCountUp(heroStats.activeReferrals, !showEmptyState);
  const convertedDisplay = useCountUp(heroStats.convertedPartners, !showEmptyState);

  const partnersTotal = useMemo(() => getPartnersByStatus(referrals, "total"), [referrals]);
  const partnersActive = useMemo(() => getPartnersByStatus(referrals, "active"), [referrals]);
  const partnersConverted = useMemo(() => getPartnersByStatus(referrals, "converted"), [referrals]);
  const partnersSubmitted = useMemo(() => getPartnersByStatus(referrals, "submitted"), [referrals]);
  const partnersUnderReview = useMemo(
    () => getPartnersByStatus(referrals, "under_review"),
    [referrals]
  );
  const partnersInConversation = useMemo(
    () => getPartnersByStatus(referrals, "in_conversation"),
    [referrals]
  );
  const partnersConvertedPipeline = useMemo(
    () => getPartnersByStatus(referrals, "converted"),
    [referrals]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Personal Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your referrals from submission to close — see status updates and key milestones.
          </p>
        </div>
        <Card className="bg-card/50 flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Loading your referrals...</p>
        </Card>
      </div>
    );
  }

  if (showEmptyState) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Personal Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your referrals from submission to close — see status updates and key milestones.
          </p>
        </div>
        <Card className="bg-card/50 flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-6">No referrals yet</p>
          <Button asChild>
            <Link href="/dashboard/refer">Refer your first partner</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const pipelineTotal =
    pipelineCounts.submitted +
    pipelineCounts.underReview +
    pipelineCounts.inConversation +
    pipelineCounts.converted;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Personal Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your referrals from submission to close — see status updates and key milestones.
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          role="button"
          tabIndex={0}
          className="bg-card/50 cursor-pointer transition-shadow hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
          onClick={() => setOpenModal("total")}
          onKeyDown={(e) => e.key === "Enter" && setOpenModal("total")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Referrals</span>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{totalDisplay}</span>
              {heroStats.totalReferralsChange && (
                <span className="text-xs font-medium text-emerald-400">{heroStats.totalReferralsChange}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          className="bg-card/50 cursor-pointer transition-shadow hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
          onClick={() => setOpenModal("active")}
          onKeyDown={(e) => e.key === "Enter" && setOpenModal("active")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Active Referrals</span>
            <Activity className="size-4 animate-pulse text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">{activeDisplay}</span>
            <p className="mt-1 text-xs text-muted-foreground">Current leads in progress.</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          className="bg-card/50 cursor-pointer transition-shadow hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
          onClick={() => setOpenModal("converted")}
          onKeyDown={(e) => e.key === "Enter" && setOpenModal("converted")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Converted Partners</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">{convertedDisplay}</span>
            <p className="mt-1 text-xs text-muted-foreground">Successful closes.</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 transition-shadow hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Potential Rewards</span>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">${heroStats.potentialRewards}</span>
            <p className="mt-1 text-xs text-muted-foreground">Estimated payout value.</p>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down modals */}
      <PartnersModal
        open={openModal === "total"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Total Referrals"
        partners={partnersTotal}
      />
      <PartnersModal
        open={openModal === "active"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Active Referrals"
        partners={partnersActive}
      />
      <PartnersModal
        open={openModal === "converted"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Converted Partners"
        partners={partnersConverted}
      />
      <PartnersModal
        open={pipelineModal === "submitted"}
        onOpenChange={(open) => !open && setPipelineModal(null)}
        title="Partners: Submitted"
        partners={partnersSubmitted}
      />
      <PartnersModal
        open={pipelineModal === "under_review"}
        onOpenChange={(open) => !open && setPipelineModal(null)}
        title="Partners: Under Review"
        partners={partnersUnderReview}
      />
      <PartnersModal
        open={pipelineModal === "in_conversation"}
        onOpenChange={(open) => !open && setPipelineModal(null)}
        title="Partners: In Conversation"
        partners={partnersInConversation}
      />
      <PartnersModal
        open={pipelineModal === "converted"}
        onOpenChange={(open) => !open && setPipelineModal(null)}
        title="Partners: Converted"
        partners={partnersConvertedPipeline}
      />

      {/* Pipeline */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: "submitted" as PipelineStageKey,
                label: "Submitted",
                count: pipelineCounts.submitted,
                barClass: "bg-muted-foreground/40",
              },
              {
                key: "under_review" as PipelineStageKey,
                label: "Under Review",
                count: pipelineCounts.underReview,
                barClass: "bg-muted-foreground/60",
              },
              {
                key: "in_conversation" as PipelineStageKey,
                label: "In Conversation",
                count: pipelineCounts.inConversation,
                barClass: "bg-primary",
              },
              {
                key: "converted" as PipelineStageKey,
                label: "Converted",
                count: pipelineCounts.converted,
                barClass: "bg-emerald-500",
              },
            ].map(({ key, label, count, barClass }) => (
              <button
                key={key}
                type="button"
                className="w-full cursor-pointer space-y-2 rounded-xl border border-transparent p-3 text-left transition-colors hover:border-primary/50 hover:bg-white/[0.04]"
                onClick={() => setPipelineModal(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPipelineModal(key);
                  }
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">{count} Partners</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={`h-full rounded-full transition-all ${barClass}`}
                    style={{
                      width: pipelineTotal > 0 ? `${(count / pipelineTotal) * 100}%` : "0%",
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Momentum + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Referral Submissions</CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <MomentumChart data={momentumData} />
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${getActivityDotColor(item.type)}`}
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground"> • {formatRelativeTime(item.timestamp)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
