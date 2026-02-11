import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/status-badge";
import { formatDeliveryDisplay, getBagSizeLabel } from "@/lib/order-display";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }) {
  const supabase = createSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!order || error) {
    notFound();
  }

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Beställning {order.id.slice(0, 8)}
      </h1>
      <p className="text-xs text-slate-600 mb-4">
        Skapad {new Date(order.created_at).toLocaleString("sv-SE")}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Betalning</span>
            <span className="text-slate-800">
              {order.payment_status === "paid" ? "Betald" : "Ej betald"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Upphämtningsdatum</span>
            <span>
              {order.pickup_date} {order.pickup_window}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Beräknad leverans</span>
            <span>{formatDeliveryDisplay(order)}</span>
          </div>
        </div>
        <div className="space-y-2 text-xs text-slate-700">
          <div>
            <span className="font-medium">Kund</span>
            <p>
              {order.customer_name}
              <br />
              {order.customer_email}
              {order.customer_phone && (
                <>
                  <br />
                  {order.customer_phone}
                </>
              )}
            </p>
          </div>
          <div>
            <span className="font-medium">Adress</span>
            <p>
              {order.address_line1}
              {order.address_line2 && (
                <>
                  <br />
                  {order.address_line2}
                </>
              )}
              <br />
              {order.postal_code} {order.city}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 text-xs text-slate-700 space-y-1">
        <div className="flex items-center justify-between">
          <span>Påse</span>
          <span>{getBagSizeLabel(order.bag_size)}</span>
        </div>
        <div className="flex items-center justify-between font-semibold">
          <span>Beräknat pris</span>
          <span>{order.estimated_total_price} kr</span>
        </div>
      </div>
    </div>
  );
}

