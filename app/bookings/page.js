"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChevronRight, Package, Calendar } from "lucide-react";
import StatusBadge from "@/components/status-badge";

export default function BookingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/login");
        return;
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setOrders(data ?? []);
      setLoading(false);
    }
    fetchOrders();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
        <p className="text-slate-600 font-medium">Laddar beställningar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50/30 pb-16">
      <div className="container py-8 sm:py-10">
        <Link
          href="/hem"
          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ← Tillbaka till startsidan
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Mina beställningar
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Här ser du alla dina bokningar och kan följa upp status.
        </p>

        {!orders.length ? (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-medium text-slate-700">Inga beställningar ännu</p>
            <p className="mt-1 text-sm text-slate-500">
              Boka din första tvätt från startsidan.
            </p>
            <Link
              href="/hem"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Gå till startsidan <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md sm:p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <Calendar className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      Upphämtning {order.pickup_date} · {order.pickup_window}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.estimated_total_price} kr · {order.estimated_weight_kg} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
