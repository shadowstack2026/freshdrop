import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { sendStatusNotificationToContact } from "@/lib/notify";

const NOTIFY_STATUSES = ["TVÄTTAS", "PÅ_VÄG", "LEVERERAD"];

export async function POST(req) {
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

  const { status, channel, email, phone } = body;
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

  const contact = {
    email: email?.trim() || undefined,
    phone: phone?.trim() || undefined
  };
  if (channel === "email" && !contact.email) {
    return NextResponse.json({ message: "Ingen e-post angiven." }, { status: 400 });
  }
  if (channel === "sms" && !contact.phone) {
    return NextResponse.json({ message: "Inget telefonnummer angivet." }, { status: 400 });
  }

  const notifyResult = await sendStatusNotificationToContact(contact, status, channel);

  return NextResponse.json({
    sent: notifyResult.sent,
    message: notifyResult.sent ? "Notis skickad." : (notifyResult.error || "Kunde inte skicka.")
  });
}
