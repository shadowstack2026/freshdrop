import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * GET: Hämta subscription för inloggad användare.
 * Om rad saknas skapas en med plan=free, status=active, credits_remaining=0.
 */
export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Ej inloggad" }, { status: 401 });
  }

  let { data: sub, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!sub) {
    const { data: inserted, error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan: "free",
        status: "active",
        credits_remaining: 0,
        period_start: new Date().toISOString().slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10)
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }
    sub = inserted;
  }

  return NextResponse.json(sub);
}
