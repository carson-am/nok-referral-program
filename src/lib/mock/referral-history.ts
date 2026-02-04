export type ActivityType =
  | "submitted"
  | "under_review"
  | "in_conversation"
  | "converted";

export type ReferralPartner = {
  partnerName: string;
  dateReferred: Date;
  industry: string;
};

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

const now = Date.now();
const ms = (d: number) => d * 24 * 60 * 60 * 1000;

/** All 12 referrals for the Total Referrals drill-down. */
export const MOCK_TOTAL_REFERRALS: ReferralPartner[] = [
  { partnerName: "Blue Ridge Outdoors", dateReferred: new Date(now - ms(120)), industry: "Outdoor" },
  { partnerName: "Aurora Apparel Co.", dateReferred: new Date(now - ms(95)), industry: "Apparel" },
  { partnerName: "Slate Home Goods", dateReferred: new Date(now - ms(60)), industry: "Home Goods" },
  { partnerName: "Lumen Beauty", dateReferred: new Date(now - ms(72)), industry: "Beauty" },
  { partnerName: "Pulse Electronics", dateReferred: new Date(now - ms(45)), industry: "Consumer Electronics" },
  { partnerName: "Summit Gear Co.", dateReferred: new Date(now - ms(100)), industry: "Outdoor" },
  { partnerName: "North Star Retail", dateReferred: new Date(now - ms(80)), industry: "Retail" },
  { partnerName: "Echo Brands", dateReferred: new Date(now - ms(55)), industry: "Apparel" },
  { partnerName: "Verdant Living", dateReferred: new Date(now - ms(38)), industry: "Home Goods" },
  { partnerName: "Glow Skincare", dateReferred: new Date(now - ms(25)), industry: "Beauty" },
  { partnerName: "Circuit Plus", dateReferred: new Date(now - ms(15)), industry: "Consumer Electronics" },
  { partnerName: "Trailhead Outfitters", dateReferred: new Date(now - ms(8)), industry: "Outdoor" },
];

/** 5 active referrals (leads in progress) for the Active Referrals drill-down. */
export const MOCK_ACTIVE_REFERRALS: ReferralPartner[] = [
  { partnerName: "Pulse Electronics", dateReferred: new Date(now - ms(45)), industry: "Consumer Electronics" },
  { partnerName: "Aurora Apparel Co.", dateReferred: new Date(now - ms(95)), industry: "Apparel" },
  { partnerName: "Verdant Living", dateReferred: new Date(now - ms(38)), industry: "Home Goods" },
  { partnerName: "Circuit Plus", dateReferred: new Date(now - ms(15)), industry: "Consumer Electronics" },
  { partnerName: "Trailhead Outfitters", dateReferred: new Date(now - ms(8)), industry: "Outdoor" },
];

/** 3 converted partners for the Converted Partners drill-down. */
export const MOCK_CONVERTED_PARTNERS: ReferralPartner[] = [
  { partnerName: "Blue Ridge Outdoors", dateReferred: new Date(now - ms(120)), industry: "Outdoor" },
  { partnerName: "Slate Home Goods", dateReferred: new Date(now - ms(60)), industry: "Home Goods" },
  { partnerName: "Echo Brands", dateReferred: new Date(now - ms(55)), industry: "Apparel" },
];
