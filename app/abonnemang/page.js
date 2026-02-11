"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChevronDown, ChevronRight, CreditCard, Check, Sparkles } from "lucide-react";
import Card from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { getPlanConfig } from "@/lib/subscription";

const PLANS = [
  {
    id: "standard_biweekly",
    name: "FreshDrop Standard",
    intervalLabel: "Varannan vecka",
    price: 499,
    description:
      "Varannan vecka får du en bekymmersfri tvättdag med FreshDrop. Varje upphämtning omfattar en stor FreshDrop-påse (ca 10–12 kg), där du fritt kan blanda vardagstvätt och grovtvätt i samma påse. Det finns inga särskilda begränsningar per plagg – så länge allt ryms i en påse per hämtning.",
    bullets: [
      "Prioriterad service",
      "Flexibel ändring",
      "Regelbunden hämtning"
    ],
    moreCopy:
      "Har du mer tvätt än vad som ryms i påsen? Då kan du enkelt boka en extra tvätt till ordinarie pris."
  },
  {
    id: "premium_weekly",
    name: "FreshDrop Premium",
    intervalLabel: "Varje vecka",
    price: 899,
    description:
      "Med FreshDrop Premium får du en smidig, återkommande tvättlösning varje vecka. Varje upphämtning omfattar en stor FreshDrop-påse (ca 10–12 kg), där du fritt kan blanda vardagstvätt och grovtvätt i samma påse. Det finns inga särskilda begränsningar per plagg – så länge allt ryms i en påse per hämtning.",
    bullets: [
      "Premiumsupport",
      "Först i kön",
      "Maximal bekvämlighet"
    ],
    moreCopy:
      "Har du mer tvätt än vad som ryms i påsen? Då kan du enkelt boka en extra tvätt till ordinarie pris."
  }
];

export default function AbonnemangPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [purchaseModalPlan, setPurchaseModalPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [purchasing, setPurchasing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user: u },
        error
      } = await supabase.auth.getUser();
      if (error || !u) {
        router.replace("/login");
        return;
      }
      setUser(u);
      try {
        const res = await fetch("/api/subscription/ensure");
        if (res.ok) setSubscription(await res.json());
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handlePurchase = async () => {
    if (!purchaseModalPlan || purchasing) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/subscription/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: purchaseModalPlan.id })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ type: "error", message: data.message || "Köp misslyckades" });
        return;
      }
      setPurchaseModalPlan(null);
      setSubscription(await res.json());
      setToast({ type: "success", message: "Klart! Abonnemanget är aktivt." });
      setTimeout(() => router.push("/hem"), 1200);
    } catch (e) {
      setToast({ type: "error", message: "Något gick fel" });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Laddar...</p>
      </div>
    );
  }

  const currentPlanConfig = getPlanConfig(subscription?.plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50/50 pb-16">
      <div className="container py-8 sm:py-10">
        <div className="mb-8">
          <Link
            href="/hem"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            ← Tillbaka till startsidan
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Abonnemang
          </h1>
          <p className="mt-2 text-slate-600">
            Välj den plan som passar dig. Du kan när som helst ändra eller avsluta.
          </p>
        </div>

        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Ditt nuvarande kort
          </p>
          <Card className="mt-3 rounded-2xl border-sky-100 bg-gradient-to-br from-sky-50/90 to-white p-5 shadow-md sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-200">
                <CreditCard className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {currentPlanConfig.name}
                </h2>
                <p className="text-sm font-medium text-emerald-600">
                  Status: Aktiv
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Uppgradera
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {PLANS.map((plan) => {
              const isExpanded = expandedId === plan.id;
              const isCurrent = subscription?.plan === plan.id;
              return (
                <Card
                  key={plan.id}
                  className="overflow-hidden rounded-2xl border-sky-100 bg-white/95 shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-3xl"
                >
                  <div className="relative p-5 sm:p-6">
                    <div className="absolute right-3 top-3 opacity-20">
                      <Sparkles className="h-8 w-8 text-sky-500" />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-sky-600">
                          {plan.intervalLabel} – {plan.price} kr
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      Så funkar det:
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {plan.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                          <Check className="h-4 w-4 text-emerald-500" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : plan.id)
                      }
                      className="mt-4 flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
                    >
                      {isExpanded ? "Visa mindre" : "Läs mer"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <p className="mt-2 rounded-xl bg-sky-50/80 p-3 text-sm text-slate-600">
                        {plan.moreCopy}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => setPurchaseModalPlan(plan)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200/50 transition hover:from-sky-600 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCurrent ? "Aktuell plan" : "Välj abonnemang"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <Modal
        isOpen={Boolean(purchaseModalPlan)}
        onClose={() => !purchasing && setPurchaseModalPlan(null)}
        overlayClassName="items-end sm:items-center p-4"
        panelClassName="max-w-md rounded-t-3xl sm:rounded-3xl p-6"
      >
        {purchaseModalPlan && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Bekräfta köp
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {purchaseModalPlan.name} – {purchaseModalPlan.intervalLabel}
            </p>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {purchaseModalPlan.price} kr
            </p>
            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Betalmetod
              </p>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 transition has-[:checked]:border-primary has-[:checked]:bg-sky-50/50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium text-slate-800">Kort</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 transition has-[:checked]:border-primary has-[:checked]:bg-sky-50/50">
                <input
                  type="radio"
                  name="payment"
                  value="swish"
                  checked={paymentMethod === "swish"}
                  onChange={() => setPaymentMethod("swish")}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium text-slate-800">Swish</span>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
              >
                {purchasing ? "Bearbetar..." : "Betala"}
              </button>
              <button
                type="button"
                onClick={() => setPurchaseModalPlan(null)}
                disabled={purchasing}
                className="flex-1 rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div
          className={`fixed bottom-6 left-4 right-4 z-[1000] rounded-2xl px-4 py-3 text-center text-sm font-semibold shadow-lg sm:left-auto sm:right-6 sm:max-w-sm ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          } animate-modal-panel`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
