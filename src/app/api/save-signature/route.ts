import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  let body: { full_name: string; company_name: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const fullNameTrimmed = full_name.trim();
  const companyNameTrimmed = company_name.trim();
  if (typeof full_name !== "string" || typeof company_name !== "string" || !fullNameTrimmed || !companyNameTrimmed) {
    return NextResponse.json({ error: "full_name and company_name required" }, { status: 400 });
  }

  const { error: upsertError } = await supabase.from("user_signatures").upsert(
    {
      user_id: userId,
      full_name: fullNameTrimmed,
      company_name: companyNameTrimmed,
    },
    { onConflict: "user_id" },
  );

  if (upsertError) {
    const isConflictError =
      upsertError.code === "23505" ||
      /duplicate|on conflict|unique constraint/i.test(upsertError.message);
    if (isConflictError) {
      const { error: updateError } = await supabase
        .from("user_signatures")
        .update({ full_name: fullNameTrimmed, company_name: companyNameTrimmed })
        .eq("user_id", userId);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
