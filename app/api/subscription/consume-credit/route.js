import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { maybeResetPeriod, canUseCredit } from "@/lib/subscription";

/**
 * POST: Förbruka 1 kredit (vid "Boka med abonnemang").
 * Om period_end har passerat görs reset först, sedan decrement.
 */
export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Ej inloggad" }, { status: 401 });
  }

  const { data: sub, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !sub) {
    return NextResponse.json({ message: "Ingen subscription hittad" }, { status: 404 });
  }

  const today = new Date();
  const reset = maybeResetPeriod(sub, today);

  let updatePayload;
  if (reset.shouldReset) {
    updatePayload = {
      period_start: reset.period_start,
      period_end: reset.period_end,
      credits_remaining: (reset.credits_remaining ?? 1) - 1,
      updated_at: new Date().toISOString()
    };
  } else {
    if (sub.credits_remaining < 1) {
      return NextResponse.json(
        { message: "Inga bokningar kvar denna period" },
        { status: 400 }
      );
    }
    updatePayload = {
      credits_remaining: sub.credits_remaining - 1,
      updated_at: new Date().toISOString()
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("subscriptions")
    .update(updatePayload)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
