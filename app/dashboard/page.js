import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-10">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Mina beställningar
      </h1>
      <p className="text-xs text-slate-600 mb-6">
        Här ser du alla beställningar som är kopplade till ditt konto.
      </p>

      {error && (
        <p className="text-xs text-red-500 mb-4">
          Kunde inte hämta beställningar just nu.
        </p>
      )}

      {!orders || orders.length === 0 ? (
        <p className="text-xs text-slate-600">
          Du har inga beställningar ännu.{" "}
          <Link href="/order/new" className="text-primary hover:underline">
            Boka din första tvätt.
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Referens
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
                  Skapad
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {orders?.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-2 text-slate-800">
                    {order.id.slice(0, 8)}
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
                    {new Date(order.created_at).toLocaleDateString("sv-SE")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary hover:underline"
                    >
                      Visa
                    </Link>
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

