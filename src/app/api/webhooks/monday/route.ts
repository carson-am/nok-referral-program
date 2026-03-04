import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/client";

type MondayChangeColumnEvent = {
  event: {
    type: string;
    boardId?: number;
    itemId?: number;
    columnId?: string;
    value?: {
      label?: string;
      text?: string;
    } | null;
  };
  challenge?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MondayChangeColumnEvent;

    if (payload.challenge) {
      return NextResponse.json({ challenge: payload.challenge });
    }

    if (!supabase) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const event = payload.event;

    if (!event || event.type !== "change_column_value") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const itemId = event.itemId;
    const value = event.value;

    if (!itemId || !value) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const statusLabel = (value as { label?: string; text?: string }).label ?? null;

    console.log("Webhook received for item:", itemId, "New Status:", statusLabel);

    const itemIdStr = String(itemId);

    const { data: referral } = await supabase
      .from("referrals")
      .select("id, user_id, partner_name, monday_status")
      .eq("monday_item_id", itemIdStr)
      .maybeSingle();

    const previousStatus = referral?.monday_status ?? null;

    const { error } = await supabase
      .from("referrals")
      .update({ monday_status: statusLabel })
      .eq("monday_item_id", itemIdStr);

    if (error) {
      console.error("Failed to update monday_status", error);
    } else if (referral && statusLabel) {
      await supabase.from("referral_activity").insert({
        user_id: referral.user_id,
        referral_id: referral.id,
        monday_item_id: itemIdStr,
        partner_name: referral.partner_name,
        from_status: previousStatus,
        to_status: statusLabel,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/webhooks/monday", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

