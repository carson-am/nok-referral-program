import type { ReferralRow, ReferralStatus } from "@/lib/supabase/types";
import type { ActivityType, MomentumPoint, ReferralPartner, RecentActivityItem } from "@/lib/mock/referral-history";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function rowToPartner(row: ReferralRow): ReferralPartner {
  return {
    partnerName: row.company_name,
    dateReferred: new Date(row.created_at),
    industry: "—",
  };
}

export function derivePipelineCounts(rows: ReferralRow[]) {
  const submitted = rows.filter((r) => r.status === "submitted").length;
  const underReview = rows.filter((r) => r.status === "under_review").length;
  const inConversation = rows.filter((r) => r.status === "in_conversation").length;
  const converted = rows.filter((r) => r.status === "converted").length;
  return { submitted, underReview, inConversation, converted };
}

export function deriveHeroStats(rows: ReferralRow[]) {
  const totalReferrals = rows.length;
  const now = new Date();
  const thisMonth = rows.filter((r) => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalReferralsChange = thisMonth > 0 ? `+${thisMonth} this month` : "";
  const activeReferrals = rows.filter(
    (r) => r.status === "under_review" || r.status === "in_conversation"
  ).length;
  const convertedPartners = rows.filter((r) => r.status === "converted").length;
  const potentialRewards = convertedPartners > 0 ? "2.4k" : "0";
  return {
    totalReferrals,
    totalReferralsChange,
    activeReferrals,
    convertedPartners,
    potentialRewards,
  };
}

export function deriveMomentumData(rows: ReferralRow[]): MomentumPoint[] {
  const now = new Date();
  const points: { month: string; monthIndex: number; year: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({
      month: MONTHS[d.getMonth()],
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      count: 0,
    });
  }
  for (const row of rows) {
    const d = new Date(row.created_at);
    const p = points.find(
      (q) => q.monthIndex === d.getMonth() && q.year === d.getFullYear()
    );
    if (p) p.count += 1;
  }
  return points.map(({ month, count }) => ({ month, submissions: count }));
}

export function deriveRecentActivity(rows: ReferralRow[]): RecentActivityItem[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return sorted.slice(0, 5).map((row, i) => {
    const label =
      row.status === "submitted"
        ? `New Referral: ${row.company_name}`
        : row.status === "converted"
          ? `${row.company_name} converted to partner`
          : `${row.company_name} moved to '${row.status.replace("_", " ")}'`;
    return {
      id: row.id,
      type: row.status as ActivityType,
      label,
      timestamp: new Date(row.created_at),
    };
  });
}

export function getPartnersByStatus(
  rows: ReferralRow[],
  kind: "total" | "active" | "converted" | ReferralStatus
): ReferralPartner[] {
  let filtered: ReferralRow[];
  if (kind === "total") filtered = rows;
  else if (kind === "active")
    filtered = rows.filter(
      (r) => r.status === "under_review" || r.status === "in_conversation"
    );
  else if (kind === "converted") filtered = rows.filter((r) => r.status === "converted");
  else filtered = rows.filter((r) => r.status === kind);
  return filtered.map(rowToPartner);
}
