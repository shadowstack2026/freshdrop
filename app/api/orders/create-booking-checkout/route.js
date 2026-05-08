import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function cleanString(value) {
  if (value == null) return "";
  return String(value).trim();
}

function toPaymentMethodTypes(method) {
  const m = cleanString(method).toLowerCase();
  if (m === "swish") return ["swish"];
  if (m === "klarna") return ["klarna"];
  return ["card"];
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Ogiltig JSON." }, { status: 400 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (!stripeSecret) {
    return NextResponse.json({ message: "Stripe är inte konfigurerat." }, { status: 500 });
  }

  const requiredFields = [
    "customer_name",
    "address_line1",
    "postal_code",
    "city",
    "pickup_date",
    "pickup_window",
    "estimated_total_price"
  ];

  for (const field of requiredFields) {
    if (!cleanString(body?.[field])) {
      return NextResponse.json({ message: `Fältet ${field} är obligatoriskt.` }, { status: 400 });
    }
  }

  const amount = Number(body.estimated_total_price);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "Beloppet måste vara ett positivt tal." }, { status: 400 });
  }

  const bagSize = cleanString(body.bag_size);
  const bagLabel = bagSize === "large" ? "Stor påse" : "Vanlig påse";
  const washType = cleanString(body.wash_type);
  const washLabel = washType ? ` (${washType})` : "";
  const paymentMethodTypes = toPaymentMethodTypes(body.payment_method);

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      // payment_method_types fungerar även på äldre Stripe API-versioner.
      payment_method_types: paymentMethodTypes,
      customer_email: cleanString(body.customer_email) || undefined,
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: `FreshDrop – ${bagLabel}${washLabel}`,
              description: "Tvättservice med upphämtning och leverans"
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${appUrl}/tack?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      metadata: {
        // Webhooken skapar ordern först när betalningen är klar.
        user_id: cleanString(body.user_id) || "",
        guest_lead_id: cleanString(body.guest_lead_id) || "",
        customer_email: cleanString(body.customer_email) || "",
        customer_name: cleanString(body.customer_name),
        customer_phone: cleanString(body.customer_phone) || "",
        address_line1: cleanString(body.address_line1),
        address_line2: cleanString(body.address_line2) || "",
        postal_code: cleanString(body.postal_code),
        city: cleanString(body.city),
        pickup_date: cleanString(body.pickup_date),
        pickup_window: cleanString(body.pickup_window),
        delivery_window: cleanString(body.delivery_window) || "",
        bag_size: bagSize || "",
        wash_type: washType || "",
        estimated_weight_kg: cleanString(body.estimated_weight_kg) || "1",
        estimated_total_price: String(Math.round(amount)),
        delivery_estimate_at: cleanString(body.delivery_estimate_at) || "",
        customer_note: cleanString(body.customer_note).slice(0, 500) || ""
      }
    });
  } catch (e) {
    return NextResponse.json(
      { message: e?.message || "Stripe-fel: kunde inte starta betalning." },
      { status: 502 }
    );
  }

  return NextResponse.json({ checkoutUrl: session.url });
}

