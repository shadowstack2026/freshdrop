import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { sendOrderStatusNotification } from "@/lib/notify";

const NOTIFY_STATUSES = ["TVÄTTAS", "PÅ_VÄG", "LEVERERAD"];

export async function POST(req, { params }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Inte inloggad." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ message: "Inte behörig." }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Ogiltig JSON." }, { status: 400 });
  }

  const { status, channel } = body;
  if (!NOTIFY_STATUSES.includes(status)) {
    return NextResponse.json(
      { message: "Ogiltig status. Använd TVÄTTAS, PÅ_VÄG eller LEVERERAD." },
      { status: 400 }
    );
  }
  if (!channel || !["email", "sms"].includes(channel)) {
    return NextResponse.json(
      { message: "Välj kanal: email eller sms." },
      { status: 400 }
    );
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, customer_email, customer_phone, status")
    .eq("id", params.id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json(
      { message: "Beställningen hittades inte." },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json(
      { message: "Kunde inte uppdatera status." },
      { status: 500 }
    );
  }

  const notifyResult = await sendOrderStatusNotification(order, status, channel);

  return NextResponse.json({
    updated: true,
    notificationSent: notifyResult.sent,
    message: notifyResult.sent
      ? "Status uppdaterad och notis skickad."
      : notifyResult.error || "Status uppdaterad, men notis skickades inte."
  });
}
