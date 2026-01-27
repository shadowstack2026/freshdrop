import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

const PRICE_PER_KG = 60;

export async function POST(req) {
  const body = await req.json();

  const requiredFields = [
    "email",
    "name",
    "phone",
    "address_line1",
    "postal_code",
    "city",
    "pickup_date",
    "pickup_window",
    "estimated_weight_kg"
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { message: `Fältet ${field} är obligatoriskt.` },
        { status: 400 }
      );
    }
  }

  const weight = Number(body.estimated_weight_kg);
  if (!Number.isFinite(weight) || weight <= 0) {
    return NextResponse.json(
      { message: "Uppskattad vikt måste vara ett positivt tal." },
      { status: 400 }
    );
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!stripeSecret) {
    return NextResponse.json(
      { message: "Stripe är inte konfigurerat." },
      { status: 500 }
    );
  }

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

  const estimatedTotal = Math.round(weight * PRICE_PER_KG);

  const pickupDate = body.pickup_date;
  const [start] = body.pickup_window.split("-");
  const [hours, minutes] = start.split(":").map((v) => parseInt(v, 10));
  const pickup = new Date(pickupDate + "T00:00:00");
  pickup.setHours(hours, minutes, 0, 0);
  const deliveryEstimate = new Date(pickup.getTime() + 48 * 60 * 60 * 1000);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id || null,
      customer_email: body.email,
      customer_name: body.name,
      customer_phone: body.phone,
      address_line1: body.address_line1,
      address_line2: body.address_line2 || null,
      postal_code: body.postal_code,
      city: body.city,
      pickup_date: body.pickup_date,
      pickup_window: body.pickup_window,
      estimated_weight_kg: weight,
      price_per_kg: PRICE_PER_KG,
      estimated_total_price: estimatedTotal,
      delivery_estimate_at: deliveryEstimate.toISOString(),
      status: "MOTTAGEN",
      payment_status: "unpaid"
    })
    .select("*")
    .single();

  if (error || !order) {
    return NextResponse.json(
      { message: "Kunde inte skapa beställning." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20"
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "sek",
          product_data: {
            name: "Tvättservice FreshDrop",
            description: `Uppskattad vikt ${weight} kg, ${PRICE_PER_KG} kr/kg`
          },
          unit_amount: Math.round(PRICE_PER_KG * 100),
          tax_behavior: "unspecified"
        },
        quantity: Math.round(weight)
      }
    ],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    metadata: {
      order_id: order.id
    }
  });

  await supabase
    .from("orders")
    .update({
      stripe_checkout_session_id: session.id
    })
    .eq("id", order.id);

  return NextResponse.json({ checkoutUrl: session.url });
}

