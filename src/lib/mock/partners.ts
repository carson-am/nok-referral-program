export type PartnerStatus =
  | "Submitted"
  | "Under Review"
  | "In Conversation"
  | "Onboarding"
  | "Active"
  | "On Hold"
  | "Declined";

export type Partner = {
  id: string;
  name: string;
  status: PartnerStatus;
  industry: string;
  email: string;
  date?: string;
  referredBy?: string;
  lastUpdated?: string;
  helpDetails?: {
    contactName?: string;
    category?: string;
    reason?: string;
  };
};

export const MOCK_PARTNERS: Partner[] = [
  {
    id: "p_001",
    name: "Blue Ridge Outdoors",
    status: "Active",
    industry: "Outdoor",
    email: "partners@blueridgeoutdoors.com",
    date: "Q1 - 2025",
    referredBy: "Jane Smith",
    lastUpdated: "1 day ago",
  },
  {
    id: "p_002",
    name: "Aurora Apparel Co.",
    status: "Under Review",
    industry: "Apparel",
    email: "hello@auroraapparel.co",
    date: "Q2 - 2025",
    referredBy: "Alex Chen",
    lastUpdated: "3 days ago",
  },
  {
    id: "p_003",
    name: "Slate Home Goods",
    status: "Active",
    industry: "Home Goods",
    email: "ops@slatehomegoods.com",
    date: "Q4 - 2024",
    referredBy: "Sam Wilson",
    lastUpdated: "1 week ago",
  },
  {
    id: "p_004",
    name: "Pulse Electronics",
    status: "In Conversation",
    industry: "Consumer Electronics",
    email: "contact@pulseelectronics.com",
    date: "Q2 - 2025",
    referredBy: "Jordan Lee",
    lastUpdated: "2 days ago",
    helpDetails: {
      contactName: "John Smith",
      category: "Introduction",
      reason: "Need intro to Sustainability VP",
    },
  },
  {
    id: "p_005",
    name: "Summit Supply Chain",
    status: "In Conversation",
    industry: "Logistics",
    email: "partnerships@summitsupply.com",
    date: "Q3 - 2025",
    referredBy: "Morgan Taylor",
    lastUpdated: "5 days ago",
    helpDetails: {
      contactName: "Sarah Johnson",
      category: "Partnership Discussion",
      reason: "Intro needed to Logistics Manager",
    },
  },
  {
    id: "p_006",
    name: "Lumen Beauty",
    status: "Submitted",
    industry: "Beauty",
    email: "team@lumenbeauty.com",
    date: "Q2 - 2025",
    referredBy: "Casey Brown",
    lastUpdated: "1 week ago",
  },
];
