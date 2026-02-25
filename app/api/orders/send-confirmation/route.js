import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { sendOrderConfirmationEmail } from "@/lib/notify";

/**
 * POST /api/orders/send-confirmation
 * Body: { orderId } (inloggad) eller { email } (gäst).
 * Skickar beställningsbekräftelse via e-post.
 */
export async function POST(req) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  );

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Ogiltig JSON." }, { status: 400 });
  }

  const { orderId, email: guestEmail } = body;

  if (orderId) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Inte inloggad." }, { status: 401 });
    }
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, user_id, customer_email")
      .eq("id", orderId)
      .single();
    if (fetchError || !order) {
      return NextResponse.json(
        { message: "Beställningen hittades inte." },
        { status: 404 }
      );
    }
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { message: "Du har inte behörighet till denna beställning." },
        { status: 403 }
      );
    }
    const result = await sendOrderConfirmationEmail({
      customer_email: order.customer_email
    });
    if (!result.sent) {
      return NextResponse.json(
        { message: result.error || "Kunde inte skicka e-post." },
        { status: 502 }
      );
    }
    return NextResponse.json({ sent: true, message: "Bekräftelse skickad." });
  }

  if (guestEmail && typeof guestEmail === "string") {
    const trimmed = guestEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      return NextResponse.json(
        { message: "Ange en giltig e-postadress." },
        { status: 400 }
      );
    }
    const result = await sendOrderConfirmationEmail({ email: trimmed });
    if (!result.sent) {
      return NextResponse.json(
        { message: result.error || "Kunde inte skicka e-post." },
        { status: 502 }
      );
    }
    return NextResponse.json({ sent: true, message: "Bekräftelse skickad." });
  }

  return NextResponse.json(
    { message: "Ange orderId (inloggad) eller email (gäst)." },
    { status: 400 }
  );
}
