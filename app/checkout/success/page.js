"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CheckoutSuccessPage({ searchParams }) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect("/");
  }

  const supabase = createSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .single();

  if (!order) {
    return (
      <div className="container py-10 max-w-md">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          Betalning klar
        </h1>
        <p className="text-xs text-slate-600">
          Vi kunde inte hitta en kopplad beställning, men din betalning verkar ha gått igenom.
        </p>
      </div>
    );
  }

  if (order.payment_status !== "paid") {
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: order.status || "MOTTAGEN"
      })
      .eq("id", order.id);
  }

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Tack för din beställning
      </h1>
      <p className="text-xs text-slate-600 mb-4">
        Din betalning är genomförd och din tvätt är bokad.
      </p>
      <div className="rounded-xl border bg-white p-4 text-xs text-slate-700 space-y-1">
        <div className="flex justify-between">
          <span className="font-medium">Orderreferens</span>
          <span>{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Status</span>
          <span>{order.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Beräknat pris</span>
          <span>{order.estimated_total_price} kr</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-600">
        Du får även en bekräftelse via e-post. Om du skapar ett konto med samma
        e-post kommer beställningen automatiskt att kopplas till ditt konto.
      </p>
    </div>
  );
}

