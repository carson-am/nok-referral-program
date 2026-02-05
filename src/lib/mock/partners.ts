export type PartnerStatus = "Help Needed" | "Completed" | "No Help Needed";

export type Partner = {
  id: string;
  name: string;
  status: PartnerStatus;
  industry: string;
  email: string;
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
    status: "Completed",
    industry: "Outdoor",
    email: "partners@blueridgeoutdoors.com",
  },
  {
    id: "p_002",
    name: "Aurora Apparel Co.",
    status: "No Help Needed",
    industry: "Apparel",
    email: "hello@auroraapparel.co",
  },
  {
    id: "p_003",
    name: "Slate Home Goods",
    status: "Completed",
    industry: "Home Goods",
    email: "ops@slatehomegoods.com",
  },
  {
    id: "p_004",
    name: "Pulse Electronics",
    status: "Help Needed",
    industry: "Consumer Electronics",
    email: "contact@pulseelectronics.com",
    helpDetails: {
      contactName: "John Smith",
      category: "Introduction",
      reason: "Need intro to Sustainability VP",
    },
  },
  {
    id: "p_005",
    name: "Summit Supply Chain",
    status: "Help Needed",
    industry: "Logistics",
    email: "partnerships@summitsupply.com",
    helpDetails: {
      contactName: "Sarah Johnson",
      category: "Partnership Discussion",
      reason: "Intro needed to Logistics Manager",
    },
  },
  {
    id: "p_006",
    name: "Lumen Beauty",
    status: "No Help Needed",
    industry: "Beauty",
    email: "team@lumenbeauty.com",
  },
];
