export type ReferralStatus =
  | "submitted"
  | "under_review"
  | "in_conversation"
  | "converted";

export type ReferralRow = {
  id: string;
  user_id: string;
  full_name: string;
  partner_name: string;
  contact_email: string;
  job_title: string;
  company_website: string;
  phone: string;
  relationship: string;
  status: ReferralStatus;
  created_at: string;
};

export type ReferralInsert = Omit<ReferralRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type UserSignatureRow = {
  id: string;
  user_id: string;
  full_name: string;
  company_name: string;
  created_at: string;
};

export type UserSignatureInsert = Omit<UserSignatureRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
