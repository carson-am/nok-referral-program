export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createMondayClient } from "@/lib/monday";
import type { EventRecord } from "@/lib/events";

type MondayColumnValue = {
  id: string;
  text: string | null;
  type: string;
  value?: string | null;
};

type MondayItem = {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
};

type QueryResponse = {
  boards: Array<{
    items_page: {
      cursor: string | null;
      items: MondayItem[];
    } | null;
  }>;
};

const EVENTS_BOARD_ID = Number(process.env.MONDAY_EVENTS_BOARD_ID) || 18403201755;
const DATE_COL_ID = process.env.MONDAY_EVENT_DATE_ID || "date";
const DESC_COL_ID = process.env.MONDAY_EVENT_DESC_ID || "long_text";
const REC_COL_ID = process.env.MONDAY_EVENT_REC_ID || "link";
const LINK_COL_ID = process.env.MONDAY_EVENT_LINK_ID || "link";

function getColumnValue(item: MondayItem, columnId: string): MondayColumnValue | undefined {
  return item.column_values.find((cv) => cv.id === columnId);
}

function parseDateValue(cv: MondayColumnValue | undefined): string | null {
  if (!cv?.value) return null;
  try {
    const v = JSON.parse(cv.value) as { date?: string; time?: string };
    if (!v?.date) {
      return null;
    }

    const time = v.time ?? "00:00";
    // Store as canonical UTC ISO string. Monday times are returned in UTC,
    // so we append a Z suffix to make this explicit for downstream consumers.
    return `${v.date}T${time}:00Z`;
  } catch {
    return cv.text ?? null;
  }
}

function parseLinkUrl(cv: MondayColumnValue | undefined): string | null {
  if (!cv?.value) return null;
  try {
    const v = JSON.parse(cv.value) as { url?: string };
    return v?.url ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const client = createMondayClient();
    const columnIds = [...new Set([DATE_COL_ID, DESC_COL_ID, REC_COL_ID, LINK_COL_ID].filter(Boolean))];
    const idsArg = columnIds.map((id) => `"${id}"`).join(", ");

    const query = `
      query EventsBoard($boardIds: [ID!]!) {
        boards(ids: $boardIds) {
          items_page {
            cursor
            items {
              id
              name
              column_values(ids: [${idsArg}]) {
                id
                type
                text
                value
              }
            }
          }
        }
      }
    `;

    const data = await client.mondayFetch<QueryResponse>({
      query,
      variables: { boardIds: [EVENTS_BOARD_ID] },
    });

    if (!data?.boards?.[0]?.items_page?.items) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const items = data.boards[0].items_page.items;
    const events: EventRecord[] = items.map((item) => {
      const dateCv = getColumnValue(item, DATE_COL_ID);
      const descCv = getColumnValue(item, DESC_COL_ID);
      const recCv = getColumnValue(item, REC_COL_ID);
      const linkCv = getColumnValue(item, LINK_COL_ID);

      const dateRaw = parseDateValue(dateCv);
      const description = descCv?.text ?? "";
      const recordingUrl = parseLinkUrl(recCv);
      const meetingUrl = parseLinkUrl(linkCv);

      return {
        id: String(item.id),
        name: item.name || "Untitled Event",
        date: dateRaw,
        description,
        recordingUrl,
        meetingUrl,
      };
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/monday/events", error);
    return NextResponse.json({ events: [] }, { status: 200 });
  }
}
