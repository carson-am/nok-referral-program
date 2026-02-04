"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
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
  HAS_RECENT_CONVERSION,
  HERO_STATS,
  MOCK_ACTIVE_REFERRALS,
  MOCK_CONVERTED_PARTNERS,
  MOCK_TOTAL_REFERRALS,
  MOMENTUM_DATA,
  PIPELINE_COUNTS,
  RECENT_ACTIVITY,
} from "@/lib/mock/referral-history";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import type { ActivityType, ReferralPartner } from "@/lib/mock/referral-history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CONFETTI_STORAGE_KEY = "referralHistoryConfettiShown";
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

export default function ReferralHistoryPage() {
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const totalReferrals = HERO_STATS.totalReferrals;
  const showEmptyState = totalReferrals === 0;

  const totalDisplay = useCountUp(HERO_STATS.totalReferrals, !showEmptyState);
  const activeDisplay = useCountUp(HERO_STATS.activeReferrals, !showEmptyState);
  const convertedDisplay = useCountUp(HERO_STATS.convertedPartners, !showEmptyState);

  useEffect(() => {
    if (!HAS_RECENT_CONVERSION || typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(CONFETTI_STORAGE_KEY)) return;
    sessionStorage.setItem(CONFETTI_STORAGE_KEY, "1");
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.4 } });
  }, []);

  if (showEmptyState) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Referral History
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
    PIPELINE_COUNTS.submitted +
    PIPELINE_COUNTS.underReview +
    PIPELINE_COUNTS.inConversation +
    PIPELINE_COUNTS.converted;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Referral History
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
              <span className="text-xs font-medium text-emerald-400">{HERO_STATS.totalReferralsChange}</span>
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
            <span className="text-2xl font-bold tracking-tight">${HERO_STATS.potentialRewards}</span>
            <p className="mt-1 text-xs text-muted-foreground">Estimated payout value.</p>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down modals */}
      <PartnersModal
        open={openModal === "total"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Total Referrals"
        partners={MOCK_TOTAL_REFERRALS}
      />
      <PartnersModal
        open={openModal === "active"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Active Referrals"
        partners={MOCK_ACTIVE_REFERRALS}
      />
      <PartnersModal
        open={openModal === "converted"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Converted Partners"
        partners={MOCK_CONVERTED_PARTNERS}
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
                key: "submitted",
                label: "Submitted",
                count: PIPELINE_COUNTS.submitted,
                barClass: "bg-muted-foreground/40",
              },
              {
                key: "under_review",
                label: "Under Review",
                count: PIPELINE_COUNTS.underReview,
                barClass: "bg-muted-foreground/60",
              },
              {
                key: "in_conversation",
                label: "In Conversation",
                count: PIPELINE_COUNTS.inConversation,
                barClass: "bg-primary",
              },
              {
                key: "converted",
                label: "Converted",
                count: PIPELINE_COUNTS.converted,
                barClass: "bg-emerald-500",
              },
            ].map(({ key, label, count, barClass }) => (
              <div key={key} className="space-y-2">
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
              </div>
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
            <MomentumChart data={MOMENTUM_DATA} />
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {RECENT_ACTIVITY.map((item) => (
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
