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
  RefreshCw,
  Trash2
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
  const [notifyChannel, setNotifyChannel] = useState("email");
  const [notifyLoading, setNotifyLoading] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [stats, setStats] = useState({
    ordersToday: 0,
    ordersThisWeek: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenuePaid: 0,
    subscriptionsByPlan: { free: 0, standard_biweekly: 0, premium_weekly: 0 },
    ordersByStatus: {},
    recentOrders: [],
    allOrders: [],
    guestLeads: []
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

  async function setStatusAndNotify(orderId, status) {
    setNotifyLoading(orderId + status);
    setNotifyMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, channel: notifyChannel })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotifyMessage(data.message || "Något gick fel.");
        return;
      }
      setNotifyMessage(data.message || "Klart.");
      fetchAdminData();
    } catch (e) {
      setNotifyMessage("Nätverksfel.");
    } finally {
      setNotifyLoading(null);
    }
  }

  async function deleteOrder(orderId) {
    if (!confirm("Vill du verkligen ta bort denna beställning? Detta går inte att ångra.")) return;
    setDeleteLoading(orderId);
    setNotifyMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotifyMessage(data.message || "Kunde inte ta bort.");
        return;
      }
      setNotifyMessage("Beställningen borttagen.");
      fetchAdminData();
    } catch (e) {
      setNotifyMessage("Nätverksfel.");
    } finally {
      setDeleteLoading(null);
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

        {stats.guestLeads && stats.guestLeads.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Gästbokningar – från order_status_history
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              All info som gästen fyllt i (namn, adress, tid, tvätt, påse m.m.) visas här.
            </p>
            <div className="space-y-4">
              {stats.guestLeads.map((row) => {
                const d = row.details || {};
                const email = d.email ?? row.customer_email ?? row.user_email ?? "–";
                const contact = d.contact ?? "–";
                const orderId = row.order_id;
                const linkedOrder = orderId && stats.allOrders?.find((o) => o.id === orderId);
                return (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm sm:p-5"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{row.created_at ? new Date(row.created_at).toLocaleString("sv-SE") : "–"}</span>
                      {row.event_type && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5">{row.event_type}</span>
                      )}
                      {row.status && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5">{row.status}</span>
                      )}
                      {linkedOrder && (
                        <Link href={`/orders/${orderId}`} className="font-medium text-primary hover:underline">
                          Order {orderId.slice(0, 8)}
                        </Link>
                      )}
                    </div>
                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Kontakt / Namn</p>
                        <p className="font-medium text-slate-900">{contact}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">E-post</p>
                        <p className="text-slate-800">{email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Telefon</p>
                        <p className="text-slate-800">{d.phone ?? "–"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Adress</p>
                        <p className="text-slate-800">{(d.address ?? [d.postal_code].filter(Boolean).join(" ")) || "–"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Postnummer</p>
                        <p className="text-slate-800">{d.postal_code ?? "–"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Upphämtning</p>
                        <p className="text-slate-800">
                          {[d.pickup_date, d.pickup_slot].filter(Boolean).join(" ") || "–"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Leverans</p>
                        <p className="text-slate-800">
                          {[d.delivery_date, d.delivery_slot].filter(Boolean).join(" ") || d.estimated_delivery || "–"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Tvätt</p>
                        <p className="text-slate-800">{d.wash ?? "–"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Påse</p>
                        <p className="text-slate-800">{d.bag ?? "–"}</p>
                      </div>
                      {(d.price != null || d.scent) && (
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">Pris / Doft</p>
                          <p className="text-slate-800">
                            {d.price != null ? `${d.price} kr` : ""}
                            {d.price != null && d.scent ? " · " : ""}
                            {d.scent ?? ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                      Typ
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Referens
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Kund
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-slate-600 sm:px-4">
                      Adress
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
                      <td className="px-3 py-3 sm:px-4">
                        <span
                          className={
                            order.guest_lead_id
                              ? "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                              : "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                          }
                        >
                          {order.guest_lead_id ? "Gäst" : "Konto"}
                        </span>
                      </td>
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
                        <span className="text-slate-500">{order.customer_email || "–"}</span>
                        {order.customer_phone && (
                          <>
                            <br />
                            <span className="text-slate-500">{order.customer_phone}</span>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-700 sm:px-4 max-w-[180px]">
                        <span className="block truncate" title={`${order.address_line1 || ""} ${order.postal_code || ""} ${order.city || ""}`.trim()}>
                          {order.address_line1 || "–"}
                          {(order.postal_code || order.city) && (
                            <><br />{[order.postal_code, order.city].filter(Boolean).join(" ")}</>
                          )}
                        </span>
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
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Notis:</span>
                            <button
                              type="button"
                              onClick={() => setNotifyChannel("email")}
                              className={`min-h-[32px] rounded-lg px-2 py-1 text-xs font-medium touch-manipulation ${
                                notifyChannel === "email"
                                  ? "bg-slate-900 text-white"
                                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              E-post
                            </button>
                            <button
                              type="button"
                              onClick={() => setNotifyChannel("sms")}
                              className={`min-h-[32px] rounded-lg px-2 py-1 text-xs font-medium touch-manipulation ${
                                notifyChannel === "sms"
                                  ? "bg-slate-900 text-white"
                                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              SMS
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {["TVÄTTAS", "PÅ_VÄG", "LEVERERAD"].map((s) => (
                              <button
                                key={s}
                                type="button"
                                disabled={!!notifyLoading}
                                onClick={() => setStatusAndNotify(order.id, s)}
                                className="min-h-[32px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 touch-manipulation"
                              >
                                {s === "PÅ_VÄG" ? "På väg" : s === "LEVERERAD" ? "Levererad" : "Tvättas"}
                              </button>
                            ))}
                          </div>
                          {notifyMessage && (
                            <p className="text-xs text-slate-600 max-w-[200px] text-right">{notifyMessage}</p>
                          )}
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
                          <button
                            type="button"
                            disabled={!!deleteLoading}
                            onClick={() => deleteOrder(order.id)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 touch-manipulation"
                            title="Ta bort beställning"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Ta bort
                          </button>
                        </div>
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
