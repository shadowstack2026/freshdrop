import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ message: "Stripe webhook saknar konfiguration." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20"
  });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ message: "Ogiltig signatur." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: session.id
        })
        .eq("id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}

