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

type MondayBoardResponse = {
  boards: Array<{
    items: MondayItem[];
  }>;
};

type ItemsByStage = Record<MondayStageKey, MondayItemBase[]>;

const BOARD_ID = 18024428968;
const REFERRAL_EMAIL_COLUMN_ID = "text_mm13567w";
const STATUS_COLUMN_ID = "status";

function createEmptyStageMap(): ItemsByStage {
  return {
    submitted: [],
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
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      null;

    if (!email) {
      return NextResponse.json({ itemsByStage: createEmptyStageMap() }, { status: 200 });
    }

    const client = createMondayClient();

    type QueryResponse = MondayBoardResponse;

    const query = `
      query UserPipeline($boardId: [ID!]!) {
        boards(ids: $boardId) {
          items {
            id
            name
            created_at
            column_values {
              id
              text
            }
          }
        }
      }
    `;

    const data = await client.mondayFetch<QueryResponse>({
      query,
      variables: { boardId: BOARD_ID },
    });

    if (!data || !data.boards?.length) {
      return NextResponse.json({ itemsByStage: createEmptyStageMap() }, { status: 200 });
    }

    const board = data.boards[0];
    const itemsByStage: ItemsByStage = createEmptyStageMap();

    const normalizedUserEmail = email.trim().toLowerCase();

    for (const item of board.items ?? []) {
      const emailColumn = item.column_values.find(
        (cv) => cv.id === REFERRAL_EMAIL_COLUMN_ID
      );
      const statusColumn = item.column_values.find(
        (cv) => cv.id === STATUS_COLUMN_ID
      );

      const itemEmail = (emailColumn?.text ?? "").trim().toLowerCase();

      if (!itemEmail || itemEmail !== normalizedUserEmail) {
        continue;
      }

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

