export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { createMondayClient } from "@/lib/monday";
import { supabase } from "@/lib/supabase/client";

type ReferralPayload = {
  fullName: string;
  companyName: string;
  email: string;
};

const MONDAY_BOARD_ID = Number(process.env.MONDAY_BOARD_ID) || 18024428968;
const MONDAY_NAME_COL_ID = process.env.MONDAY_NAME_COL_ID || "text_mm13vp9b";
const MONDAY_EMAIL_COL_ID = process.env.MONDAY_EMAIL_COL_ID || "text_mm13567w";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Database is not configured. Please try again later." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Partial<ReferralPayload>;
    const { fullName, companyName, email } = body;

    if (
      typeof fullName !== "string" ||
      typeof companyName !== "string" ||
      typeof email !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const trimmedFullName = fullName.trim();
    const trimmedCompanyName = companyName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName || !trimmedCompanyName || !trimmedEmail) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // First, insert the referral in Supabase and capture the new row ID.
    const { data: inserted, error: insertError } = await supabase
      .from("referrals")
      .insert({
        user_id: userId,
        full_name: trimmedFullName,
        partner_name: trimmedCompanyName,
        contact_email: trimmedEmail,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Failed to insert referral", insertError);
      return NextResponse.json(
        { error: insertError?.message || "Failed to save introduction." },
        { status: 500 }
      );
    }

    const supabaseId = inserted.id;

    const client = createMondayClient();

    try {
      console.log("SENDING TO MONDAY BOARD:", process.env.MONDAY_BOARD_ID);
      console.log("Attempting Monday sync for:", trimmedCompanyName);

      const clerkUser = await currentUser();
      const clerkFullName =
        (clerkUser?.fullName ??
          [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ")) ||
        trimmedFullName;
      const clerkEmail =
        clerkUser?.primaryEmailAddress?.emailAddress ??
        clerkUser?.emailAddresses?.[0]?.emailAddress ??
        trimmedEmail;

      type CreateItemResponse = {
        create_item: {
          id: string;
        };
      };

      type ChangeColumnsResponse = {
        change_multiple_column_values: {
          id: string;
        };
      };

      const createItemMutation = `
        mutation CreateReferralItem($boardId: ID!, $itemName: String!) {
          create_item(board_id: $boardId, item_name: $itemName) {
            id
          }
        }
      `;

      const created = await client.mondayFetch<CreateItemResponse>({
        query: createItemMutation,
        variables: {
          boardId: MONDAY_BOARD_ID,
          itemName: trimmedCompanyName,
        },
      });

      const createdId = created?.create_item.id;

      if (createdId) {
        const changeColumnsMutation = `
          mutation UpdateReferralColumns(
            $boardId: ID!
            $itemId: ID!
            $columnValues: JSON!
          ) {
            change_multiple_column_values(
              board_id: $boardId
              item_id: $itemId
              column_values: $columnValues
            ) {
              id
            }
          }
        `;

        const columnValues = JSON.stringify({
          [MONDAY_NAME_COL_ID]: clerkFullName,
          [MONDAY_EMAIL_COL_ID]: clerkEmail,
        });

        await client.mondayFetch<ChangeColumnsResponse>({
          query: changeColumnsMutation,
          variables: {
            boardId: MONDAY_BOARD_ID,
            itemId: createdId,
            columnValues,
          },
        });

        const { error: updateError } = await supabase
          .from("referrals")
          .update({ monday_item_id: createdId })
          .eq("id", supabaseId);

        if (updateError) {
          console.error("Failed to update monday_item_id", updateError);
        }
      }
    } catch (error) {
      // If Monday is not configured or the API call fails, continue with Supabase only.
      console.error("Failed to sync with Monday.com", error);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in /api/referrals", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
}

