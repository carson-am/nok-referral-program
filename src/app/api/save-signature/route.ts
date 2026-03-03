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
  const { full_name, company_name } = body;
  if (typeof full_name !== "string" || typeof company_name !== "string" || !full_name.trim() || !company_name.trim()) {
    return NextResponse.json({ error: "full_name and company_name required" }, { status: 400 });
  }
  const { error } = await supabase.from("user_signatures").upsert(
    {
      user_id: userId,
      full_name: full_name.trim(),
      company_name: company_name.trim(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
