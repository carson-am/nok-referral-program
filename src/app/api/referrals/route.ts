import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { createMondayClient } from "@/lib/monday";
import { supabase } from "@/lib/supabase/client";

type ReferralPayload = {
  fullName: string;
  companyName: string;
  email: string;
};

export async function POST(request: Request) {
  try {
    const { userId } = auth();

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

    const client = createMondayClient();

    let mondayItemId: string | null = null;

    try {
      const clerkUser = await currentUser();
      const clerkFullName =
        clerkUser?.fullName ??
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
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

      const mutation = `
        mutation CreateReferralItem($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
          create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
          }
        }
      `;

      const columnValues = JSON.stringify({
        text_mm13vp9b: clerkFullName,
        text_mm13567w: clerkEmail,
      });

      const data = await client.mondayFetch<CreateItemResponse>({
        query: mutation,
        variables: {
          boardId: 18024428968,
          itemName: trimmedCompanyName,
          columnValues,
        },
      });

      mondayItemId = data?.create_item.id ?? null;
    } catch (error) {
      // If Monday is not configured or the API call fails, continue with Supabase only.
      console.error("Failed to sync with Monday.com", error);
    }

    const { error: insertError } = await supabase.from("referrals").insert({
      user_id: userId,
      full_name: trimmedFullName,
      partner_name: trimmedCompanyName,
      contact_email: trimmedEmail,
      monday_item_id: mondayItemId,
    });

    if (insertError) {
      console.error("Failed to insert referral", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to save introduction." },
        { status: 500 }
      );
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

