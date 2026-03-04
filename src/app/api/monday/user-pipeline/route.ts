export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { createMondayClient, getStageFromStatus, type MondayItemBase, type MondayStageKey } from "@/lib/monday";
import { supabase } from "@/lib/supabase/client";

type MondayColumnValue = {
  id: string;
  text: string | null;
};

type MondayItem = {
  id: string;
  name: string;
  created_at: string | null;
  column_values: MondayColumnValue[];
};

type QueryResponse = {
  items_page_by_column_values: {
    items: MondayItem[];
  } | null;
};

type ItemsByStage = Record<MondayStageKey, MondayItemBase[]>;

const MONDAY_BOARD_ID = Number(process.env.MONDAY_BOARD_ID) || 18024428968;
const REFERRAL_EMAIL_COLUMN_ID = process.env.MONDAY_EMAIL_COL_ID || "text_mm13567w";
const STATUS_COLUMN_ID = "status";

function createEmptyStageMap(): ItemsByStage {
  return {
    scheduling_initial_call: [],
    scheduling_demo: [],
    demo_scheduled: [],
    getting_3pl_rate_card: [],
    getting_refurb_lines_set: [],
    need_to_follow_up: [],
    on_hold: [],
    stuck: [],
    done: [],
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ itemsByStage: createEmptyStageMap() }, { status: 200 });
    }

    const user = await currentUser();
    const userEmail =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      null;

    if (!userEmail) {
      console.error("No user email found for Clerk user:", userId);
      return NextResponse.json({ itemsByStage: createEmptyStageMap() }, { status: 200 });
    }

    console.log("Monday API Request for Email:", userEmail);

    const client = createMondayClient();

    const query = `
      query UserPipeline($boardId: ID!, $email: String!) {
        items_page_by_column_values(
          board_id: $boardId
          columns: [{
            column_id: "${REFERRAL_EMAIL_COLUMN_ID}"
            column_values: [$email]
          }]
        ) {
          items {
            id
            name
            created_at
            column_values (ids: ["${STATUS_COLUMN_ID}"]) {
              text
            }
          }
        }
      }
    `;

    const data = await client.mondayFetch<QueryResponse>({
      query,
      variables: { boardId: MONDAY_BOARD_ID, email: userEmail },
    });

    console.log("Monday API Response Data:", JSON.stringify(data));

    if (!data || !data.items_page_by_column_values) {
      return NextResponse.json({ itemsByStage: createEmptyStageMap() }, { status: 200 });
    }

    const items = data.items_page_by_column_values.items ?? [];
    console.log("Found " + items.length + " items for " + userEmail);

    const itemsByStage: ItemsByStage = createEmptyStageMap();

    const clerkFullName =
      (user?.firstName || user?.lastName)
        ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || undefined
        : undefined;
    const fullNameForImport = user?.fullName ?? clerkFullName ?? "Referral Partner";

    if (supabase) {
      for (const item of items) {
        const statusColumn = item.column_values[0];
        const statusLabel = statusColumn?.text ?? null;
        const itemIdStr = String(item.id);

        const { data: referral } = await supabase
          .from("referrals")
          .select("id, user_id, partner_name, monday_status")
          .eq("monday_item_id", itemIdStr)
          .maybeSingle();

        if (referral) {
          const oldStatus = referral.monday_status ?? null;
          const oldNormalized = (oldStatus ?? "").trim();
          const newNormalized = (statusLabel ?? "").trim();

          if (oldNormalized !== newNormalized) {
            const { error: updateError } = await supabase
              .from("referrals")
              .update({ monday_status: statusLabel })
              .eq("monday_item_id", itemIdStr);

            if (!updateError && (statusLabel ?? "").trim() !== "") {
              await supabase.from("referral_activity").insert({
                user_id: referral.user_id,
                referral_id: referral.id,
                monday_item_id: itemIdStr,
                partner_name: referral.partner_name,
                from_status: oldStatus,
                to_status: (statusLabel ?? "").trim(),
              });
            }
          }
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from("referrals")
            .insert({
              user_id: userId,
              full_name: fullNameForImport,
              partner_name: item.name || "Unknown",
              contact_email: "imported@nok.referral",
              status: "submitted",
              monday_item_id: itemIdStr,
              monday_status: statusLabel,
            })
            .select("id")
            .single();

          if (!insertError && inserted) {
            await supabase.from("referral_activity").insert({
              user_id: userId,
              referral_id: inserted.id,
              monday_item_id: itemIdStr,
              partner_name: item.name || "Unknown",
              from_status: null,
              to_status: "Imported from Monday Pipeline.",
            });
          }
        }

        const stage = getStageFromStatus(statusLabel);
        const mapped: MondayItemBase = {
          id: item.id,
          name: item.name,
          created_at: item.created_at,
          statusLabel,
        };
        itemsByStage[stage].push(mapped);
      }
    } else {
      for (const item of items) {
        const statusColumn = item.column_values[0];
        const statusLabel = statusColumn?.text ?? null;
        const stage = getStageFromStatus(statusLabel);
        const mapped: MondayItemBase = {
          id: item.id,
          name: item.name,
          created_at: item.created_at,
          statusLabel,
        };
        itemsByStage[stage].push(mapped);
      }
    }

    return NextResponse.json({ itemsByStage }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/monday/user-pipeline", error);
    return NextResponse.json(
      { itemsByStage: createEmptyStageMap(), error: "Failed to load Monday pipeline." },
      { status: 200 }
    );
  }
}

