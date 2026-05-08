import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

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
    const supabase = createSupabaseServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase service role saknas." }, { status: 500 });
    }

    // Idempotens: om order redan skapats för denna session, gör inget.
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();
    if (existing?.id) {
      return NextResponse.json({ received: true });
    }

    const md = session.metadata || {};
    const amount = Number(md.estimated_total_price || session.amount_total ? (session.amount_total / 100) : 0);
    const orderId = randomUUID();

    await supabase.from("orders").insert({
      id: orderId,
      user_id: md.user_id || null,
      guest_lead_id: md.guest_lead_id || null,
      customer_email: md.customer_email || null,
      customer_name: md.customer_name || "Kund",
      customer_phone: md.customer_phone || null,
      address_line1: md.address_line1 || "",
      address_line2: md.address_line2 || null,
      postal_code: md.postal_code || "",
      city: md.city || "",
      pickup_date: md.pickup_date || "",
      pickup_window: md.pickup_window || "",
      delivery_window: md.delivery_window || null,
      bag_size: md.bag_size || null,
      wash_type: md.wash_type || null,
      estimated_weight_kg: Number(md.estimated_weight_kg) || 1,
      price_per_kg: 60,
      estimated_total_price: Number.isFinite(amount) ? Math.round(amount) : null,
      delivery_estimate_at: md.delivery_estimate_at || null,
      status: "MOTTAGEN",
      payment_status: "paid",
      stripe_checkout_session_id: session.id,
      customer_note: md.customer_note || null
    });
  }

  return NextResponse.json({ received: true });
}

