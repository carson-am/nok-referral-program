export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { createMondayClient, getStageFromStatus, type MondayItemBase, type MondayStageKey } from "@/lib/monday";

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
          column_id: "${REFERRAL_EMAIL_COLUMN_ID}"
          column_value: $email
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

    return NextResponse.json({ itemsByStage }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/monday/user-pipeline", error);
    return NextResponse.json(
      { itemsByStage: createEmptyStageMap(), error: "Failed to load Monday pipeline." },
      { status: 200 }
    );
  }
}

