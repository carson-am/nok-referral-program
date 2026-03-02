import type { MomentumPoint, ReferralPartner, RecentActivityItem } from "@/lib/mock/referral-history";

/** Demo Mode: Display when referrals.length === 0 to showcase full dashboard potential. */

const now = Date.now();
const ms = (d: number) => d * 24 * 60 * 60 * 1000;
const h = (hours: number) => hours * 60 * 60 * 1000;

export const DEMO_HERO_STATS = {
  totalReferrals: 12,
  totalReferralsChange: "+2 this month",
  activeReferrals: 5,
  convertedPartners: 3,
  potentialRewards: "2,400",
} as const;

export const DEMO_PIPELINE_COUNTS = {
  submitted: 4,
  underReview: 3,
  inConversation: 2,
  converted: 3,
} as const;

/** Sept: 2, Oct: 4, Nov: 3, Dec: 7, Jan: 5, Feb: 8 (last 6 months, positive trend) */
export const DEMO_MOMENTUM_DATA: MomentumPoint[] = [
  { month: "Sep", submissions: 2 },
  { month: "Oct", submissions: 4 },
  { month: "Nov", submissions: 3 },
  { month: "Dec", submissions: 7 },
  { month: "Jan", submissions: 5 },
  { month: "Feb", submissions: 8 },
];

/** 5 activities with Consumer Electronic brand names (blows air/gets hot criteria) */
export const DEMO_RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: "demo-1",
    type: "in_conversation",
    label: "Dyson moved to 'In Conversation'",
    timestamp: new Date(now - h(2)),
  },
  {
    id: "demo-2",
    type: "converted",
    label: "SharkNinja converted to Active Partner",
    timestamp: new Date(now - ms(1)),
  },
  {
    id: "demo-3",
    type: "under_review",
    label: "Breville moved to 'Under Review'",
    timestamp: new Date(2025, 1, 28), // Feb 28
  },
  {
    id: "demo-4",
    type: "submitted",
    label: "Theragun successfully logged as Introduction",
    timestamp: new Date(2025, 1, 26), // Feb 26
  },
  {
    id: "demo-5",
    type: "in_conversation",
    label: "Honeywell moved to 'In Conversation'",
    timestamp: new Date(2025, 1, 24), // Feb 24
  },
];

/** 12 partners for Total Referrals modal (including Tineco, Cosori, Hyperice, NuFace) */
export const DEMO_PARTNERS_TOTAL: ReferralPartner[] = [
  { partnerName: "Tineco", dateReferred: new Date(now - ms(45)), industry: "Floorcare" },
  { partnerName: "Cosori", dateReferred: new Date(now - ms(38)), industry: "Kitchen" },
  { partnerName: "Hyperice", dateReferred: new Date(now - ms(32)), industry: "Wellness Tech" },
  { partnerName: "NuFace", dateReferred: new Date(now - ms(28)), industry: "Beauty Tech" },
  { partnerName: "Dyson", dateReferred: new Date(now - ms(90)), industry: "Floorcare" },
  { partnerName: "SharkNinja", dateReferred: new Date(now - ms(80)), industry: "Kitchen" },
  { partnerName: "Breville", dateReferred: new Date(now - ms(25)), industry: "Kitchen" },
  { partnerName: "Theragun", dateReferred: new Date(now - ms(20)), industry: "Wellness Tech" },
  { partnerName: "Honeywell", dateReferred: new Date(now - ms(70)), industry: "Consumer Electronics" },
  { partnerName: "Vitamix", dateReferred: new Date(now - ms(60)), industry: "Kitchen" },
  { partnerName: "Rowenta", dateReferred: new Date(now - ms(50)), industry: "Floorcare" },
  { partnerName: "Conair", dateReferred: new Date(now - ms(15)), industry: "Beauty Tech" },
];

/** 5 active referrals (Under Review + In Conversation) - includes Tineco, Cosori, Hyperice */
export const DEMO_PARTNERS_ACTIVE: ReferralPartner[] = [
  { partnerName: "Tineco", dateReferred: new Date(now - ms(45)), industry: "Floorcare" },
  { partnerName: "Cosori", dateReferred: new Date(now - ms(38)), industry: "Kitchen" },
  { partnerName: "Hyperice", dateReferred: new Date(now - ms(32)), industry: "Wellness Tech" },
  { partnerName: "Breville", dateReferred: new Date(now - ms(25)), industry: "Kitchen" },
  { partnerName: "Theragun", dateReferred: new Date(now - ms(20)), industry: "Wellness Tech" },
];

/** 3 converted partners */
export const DEMO_PARTNERS_CONVERTED: ReferralPartner[] = [
  { partnerName: "SharkNinja", dateReferred: new Date(now - ms(80)), industry: "Kitchen" },
  { partnerName: "Dyson", dateReferred: new Date(now - ms(90)), industry: "Floorcare" },
  { partnerName: "Honeywell", dateReferred: new Date(now - ms(70)), industry: "Consumer Electronics" },
];

/** 4 partners at Submitted stage - includes NuFace */
export const DEMO_PARTNERS_SUBMITTED: ReferralPartner[] = [
  { partnerName: "NuFace", dateReferred: new Date(now - ms(28)), industry: "Beauty Tech" },
  { partnerName: "Conair", dateReferred: new Date(now - ms(15)), industry: "Beauty Tech" },
  { partnerName: "Vitamix", dateReferred: new Date(now - ms(60)), industry: "Kitchen" },
  { partnerName: "Rowenta", dateReferred: new Date(now - ms(50)), industry: "Floorcare" },
];

/** 3 partners at Under Review - includes Cosori */
export const DEMO_PARTNERS_UNDER_REVIEW: ReferralPartner[] = [
  { partnerName: "Cosori", dateReferred: new Date(now - ms(38)), industry: "Kitchen" },
  { partnerName: "Breville", dateReferred: new Date(now - ms(25)), industry: "Kitchen" },
  { partnerName: "Theragun", dateReferred: new Date(now - ms(20)), industry: "Wellness Tech" },
];

/** 2 partners at In Conversation - includes Hyperice, Tineco */
export const DEMO_PARTNERS_IN_CONVERSATION: ReferralPartner[] = [
  { partnerName: "Hyperice", dateReferred: new Date(now - ms(32)), industry: "Wellness Tech" },
  { partnerName: "Tineco", dateReferred: new Date(now - ms(45)), industry: "Floorcare" },
];

/** 3 partners at Converted stage */
export const DEMO_PARTNERS_PIPELINE_CONVERTED: ReferralPartner[] =
  DEMO_PARTNERS_CONVERTED;
