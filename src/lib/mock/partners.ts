export type PartnerStatus = "Active" | "Pending" | "Inactive";

export type Partner = {
  id: string;
  name: string;
  status: PartnerStatus;
  industry: string;
  email: string;
};

export const MOCK_PARTNERS: Partner[] = [
  {
    id: "p_001",
    name: "Blue Ridge Outdoors",
    status: "Active",
    industry: "Outdoor",
    email: "partners@blueridgeoutdoors.com",
  },
  {
    id: "p_002",
    name: "Aurora Apparel Co.",
    status: "Pending",
    industry: "Apparel",
    email: "hello@auroraapparel.co",
  },
  {
    id: "p_003",
    name: "Slate Home Goods",
    status: "Active",
    industry: "Home Goods",
    email: "ops@slatehomegoods.com",
  },
  {
    id: "p_004",
    name: "Lumen Beauty",
    status: "Inactive",
    industry: "Beauty",
    email: "team@lumenbeauty.com",
  },
  {
    id: "p_005",
    name: "Pulse Electronics",
    status: "Pending",
    industry: "Consumer Electronics",
    email: "contact@pulseelectronics.com",
  },
];

