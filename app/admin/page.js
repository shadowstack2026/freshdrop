import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container py-10">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Admin – alla beställningar
      </h1>
      <p className="text-xs text-slate-600 mb-6">
        Endast administratörer kan se och uppdatera alla beställningar.
      </p>

      {!orders || orders.length === 0 ? (
        <p className="text-xs text-slate-600">
          Inga beställningar ännu.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Referens
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Kund
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Upphämtning
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Vikt
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Pris
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Betalning
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-2 text-slate-800">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {order.customer_name}
                    <br />
                    <span className="text-slate-500">
                      {order.customer_email}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {order.pickup_date} {order.pickup_window}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {order.estimated_weight_kg} kg
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {order.estimated_total_price} kr
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {order.payment_status}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <form
                      action={`/api/admin/orders/${order.id}/status`}
                      method="post"
                      className="inline-flex items-center gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        <option value="MOTTAGEN">MOTTAGEN</option>
                        <option value="BOKAD">BOKAD</option>
                        <option value="HÄMTAD">HÄMTAD</option>
                        <option value="TVÄTTAS">TVÄTTAS</option>
                        <option value="PÅ_VÄG">PÅ_VÄG</option>
                        <option value="LEVERERAD">LEVERERAD</option>
                        <option value="AVBRUTEN">AVBRUTEN</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-slate-700"
                      >
                        Uppdatera
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

