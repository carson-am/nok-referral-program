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

    const pulseId = event.itemId;
    const value = event.value;

    if (!pulseId || !value) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    console.log("Webhook hit for Monday Item:", pulseId);

    const statusLabel = (value as { label?: string; text?: string }).label ?? null;
    const itemIdStr = String(pulseId);

    const { data: referral } = await supabase
      .from("referrals")
      .select("id, user_id, partner_name, monday_status")
      .eq("monday_item_id", itemIdStr)
      .maybeSingle();

    if (!referral) {
      console.warn("No referral found for Monday item:", pulseId);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const foundUserId = referral.user_id;
    const previousStatus = referral.monday_status ?? null;

    const { error } = await supabase
      .from("referrals")
      .update({ monday_status: statusLabel })
      .eq("monday_item_id", itemIdStr);

    if (error) {
      console.error("Failed to update monday_status", error);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (statusLabel) {
      await supabase.from("referral_activity").insert({
        user_id: foundUserId,
        referral_id: referral.id,
        monday_item_id: itemIdStr,
        partner_name: referral.partner_name,
        from_status: previousStatus,
        to_status: statusLabel,
      });
      console.log("Activity logged for User:", foundUserId);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/webhooks/monday", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

