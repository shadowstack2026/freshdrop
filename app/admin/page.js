"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  CreditCard,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { getBagSizeLabel } from "@/lib/order-display";
import LoadingSpinner from "@/components/loading-spinner";

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {value}
          </p>
          {sub != null && (
            <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
          )}
        </div>
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    ordersThisWeek: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenuePaid: 0,
    subscriptionsByPlan: { free: 0, standard_biweekly: 0, premium_weekly: 0 },
    ordersByStatus: {},
    recentOrders: [],
    allOrders: []
  });

  async function fetchAdminData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Kunde inte hämta statistik");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading && !stats.recentOrders?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Laddar adminpanel..." className="text-slate-600" />
      </div>
    );
  }

  const planLabels = {
    free: "Gratis",
    standard_biweekly: "Standard (3/månad)",
    premium_weekly: "Premium (5/månad)"
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              <LayoutDashboard className="h-8 w-8 text-slate-600" />
              Adminpanel
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Översikt över beställningar, användare och abonnemang.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={loading}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] touch-manipulation disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Uppdatera
            </button>
            <Link
              href="/hem"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] touch-manipulation"
            >
              Till startsidan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Översikt idag
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Package}
              label="Beställningar idag"
              value={stats.ordersToday ?? 0}
              sub={`${stats.ordersThisWeek ?? 0} denna vecka`}
            />
            <StatCard
              icon={Users}
              label="Antal användare"
              value={stats.totalUsers ?? 0}
              sub="Registrerade profiler"
            />
            <StatCard
              icon={TrendingUp}
              label="Totalt beställningar"
              value={stats.totalOrders ?? 0}
              sub="Alla tider"
            />
            <StatCard
              icon={CreditCard}
              label="Omsättning (betalt)"
              value={`${stats.revenuePaid ?? 0} kr`}
              sub="Summa betalda beställningar"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Abonnemang per plan
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(stats.subscriptionsByPlan || {}).map(([plan, count]) => (
              <div
                key={plan}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-medium text-slate-500">
                  {planLabels[plan] ?? plan}
                </p>
                <p className="text-xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </section>

        {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Beställningar per status
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  <StatusBadge status={status} />
                  <span>{count}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Alla beställningar
          </h2>
          {!stats.allOrders?.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Inga beställningar ännu.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Referens
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Kund
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Upphämtning
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Påse
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Pris
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Betalning
                    </th>
                    <th className="px-3 py-3 text-right font-medium text-slate-600 sm:px-4">
                      Åtgärd
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {stats.allOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 text-slate-800 sm:px-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-slate-700 sm:px-4">
                        <span className="font-medium">{order.customer_name}</span>
                        <br />
                        <span className="text-slate-500">{order.customer_email}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-700 sm:px-4">
                        {order.pickup_date} {order.pickup_window}
                      </td>
                      <td className="px-3 py-3 text-slate-700 sm:px-4">
                        {getBagSizeLabel(order.bag_size)}
                      </td>
                      <td className="px-3 py-3 text-slate-700 sm:px-4">
                        {order.estimated_total_price} kr
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-700 sm:px-4">
                        <span
                          className={
                            order.payment_status === "paid"
                              ? "font-medium text-emerald-600"
                              : "text-slate-500"
                          }
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right sm:px-4">
                        <form
                          action={`/api/admin/orders/${order.id}/status`}
                          method="post"
                          className="inline-flex flex-wrap items-center gap-2"
                        >
                          <select
                            name="status"
                            defaultValue={order.status}
                            className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs touch-manipulation"
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
                            className="min-h-[36px] rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 active:scale-[0.98] touch-manipulation"
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
        </section>
      </div>
    </div>
  );
}
