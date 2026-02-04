export type ActivityType =
  | "submitted"
  | "under_review"
  | "in_conversation"
  | "converted";

export type HeroStats = {
  totalReferrals: number;
  totalReferralsChange: string;
  activeReferrals: number;
  convertedPartners: number;
  potentialRewards: string;
};

export type PipelineCounts = {
  submitted: number;
  underReview: number;
  inConversation: number;
  converted: number;
};

export type MomentumPoint = {
  month: string;
  submissions: number;
};

export type RecentActivityItem = {
  id: string;
  type: ActivityType;
  label: string;
  timestamp: Date;
};

export const HERO_STATS: HeroStats = {
  totalReferrals: 12,
  totalReferralsChange: "+2 this month",
  activeReferrals: 5,
  convertedPartners: 3,
  potentialRewards: "2.4k",
};

export const PIPELINE_COUNTS: PipelineCounts = {
  submitted: 3,
  underReview: 2,
  inConversation: 2,
  converted: 5,
};

export const MOMENTUM_DATA: MomentumPoint[] = [
  { month: "Aug", submissions: 4 },
  { month: "Sep", submissions: 6 },
  { month: "Oct", submissions: 3 },
  { month: "Nov", submissions: 8 },
  { month: "Dec", submissions: 5 },
  { month: "Jan", submissions: 7 },
];

export const RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: "a1",
    type: "converted",
    label: "Blue Ridge Outdoors converted to partner",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "a2",
    type: "under_review",
    label: "Pulse Electronics moved to 'Under Review'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "a3",
    type: "submitted",
    label: "New Referral: Slate Home Goods",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "a4",
    type: "in_conversation",
    label: "Aurora Apparel Co. in conversation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "a5",
    type: "submitted",
    label: "New Referral: Lumen Beauty",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

/** True when there is a recent "converted" activity (e.g. for one-time confetti). */
export const HAS_RECENT_CONVERSION =
  RECENT_ACTIVITY.some((a) => a.type === "converted");
