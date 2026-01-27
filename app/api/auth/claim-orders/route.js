import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Inte inloggad." }, { status: 401 });
  }

  const email = user.email;
  if (!email) {
    return NextResponse.json({ message: "Användaren saknar e-post." }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ user_id: user.id })
    .is("user_id", null)
    .eq("customer_email", email);

  if (error) {
    return NextResponse.json(
      { message: "Kunde inte koppla gästbeställningar." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

