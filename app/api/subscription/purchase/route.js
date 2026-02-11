import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getPlanConfig, getNextPeriod } from "@/lib/subscription";

/**
 * POST: Köp/uppgradera abonnemang (fejkbetalning).
 * Body: { plan: "standard_biweekly" | "premium_weekly" }
 */
export async function POST(req) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Ej inloggad" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Ogiltig JSON" }, { status: 400 });
  }

  const plan = body?.plan;
  if (plan !== "standard_biweekly" && plan !== "premium_weekly") {
    return NextResponse.json({ message: "Ogiltig plan" }, { status: 400 });
  }

  const planConfig = getPlanConfig(plan);
  const today = new Date().toISOString().slice(0, 10);
  const { period_start, period_end } = getNextPeriod(plan, today);

  const { data: updated, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan,
        status: "active",
        credits_remaining: planConfig.creditsPerPeriod ?? 1,
        period_start,
        period_end,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
