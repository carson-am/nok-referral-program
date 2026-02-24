export type ReferralStatus =
  | "submitted"
  | "under_review"
  | "in_conversation"
  | "converted";

export type ReferralRow = {
  id: string;
  user_id: string;
  full_name: string;
  job_title: string;
  company_name: string;
  company_website: string;
  email: string;
  phone: string;
  relationship: string;
  status: ReferralStatus;
  created_at: string;
};

export type ReferralInsert = Omit<ReferralRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
