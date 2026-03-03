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
  status: ReferralStatus;
   monday_item_id?: string | null;
   monday_status?: string | null;
  created_at: string;
};

export type ReferralInsert = {
  user_id: string;
  full_name: string;
  partner_name: string;
  contact_email: string;
  status?: ReferralStatus;
  monday_item_id?: string | null;
  monday_status?: string | null;
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
