"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, ChevronRight, Sparkles } from "lucide-react";
import Card from "@/components/ui/card";
import { getPlanConfig } from "@/lib/subscription";

function formatDate(str) {
  if (!str) return "";
  const d = new Date(str + "T12:00:00");
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

export default function SubscriptionCard({
  subscription,
  loading,
  onRefresh,
  onBookWithCredit,
  useSubscriptionCredit = false
}) {
  const [consuming, setConsuming] = useState(false);

  const planConfig = getPlanConfig(subscription?.plan);
  const isFree = !subscription || subscription.plan === "free";
  const creditsRemaining = subscription?.credits_remaining ?? 0;
  const hasCredits = creditsRemaining > 0;
  const nextReset = subscription?.period_end;

  const handleBookWithCredit = async () => {
    if (!hasCredits || consuming) return;
    setConsuming(true);
    try {
      await onBookWithCredit?.();
    } finally {
      setConsuming(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-sky-50/90 to-white p-5 shadow-md sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-sky-100" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-sky-50/50 shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-3xl">
      <div className="relative p-5 sm:p-6">
        <div className="absolute right-3 top-3 opacity-20">
          <Sparkles className="h-8 w-8 text-sky-500" />
        </div>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-200">
            <CreditCard className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
              Ditt FreshDrop-kort
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              {planConfig.name}
            </h3>
            {!isFree && (
              <p className="mt-1 text-sm font-medium text-emerald-600">
                Status: Aktiv
              </p>
            )}
          </div>
        </div>

        {isFree ? (
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-slate-400">•</span>
              Pay-as-you-go (betala per tvätt)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-slate-400">•</span>
              Standardhämtning
            </li>
            <li className="flex items-center gap-2">
              <span className="text-slate-400">•</span>
              Ingen prioritet
            </li>
            <li className="flex items-center gap-2">
              <span className="text-slate-400">•</span>
              Ingen återkommande dag
            </li>
          </ul>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Bokningar kvar denna period:{" "}
              <span className="text-primary">{creditsRemaining}</span>
            </p>
            <p className="text-sm text-slate-600">
              Nästa reset:{" "}
              <span className="font-medium text-slate-800">{formatDate(nextReset)}</span>
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {!isFree && (
            <button
              type="button"
              disabled={!hasCredits || consuming}
              onClick={handleBookWithCredit}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200/50 transition active:scale-[0.98] hover:from-sky-600 hover:to-sky-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none touch-manipulation"
            >
              {consuming ? "Öppnar..." : "Boka med abonnemang"}
            </button>
          )}
          {!isFree && !hasCredits && (
            <p className="text-xs text-amber-700">
              Inga bokningar kvar – nästa reset {formatDate(nextReset)}
            </p>
          )}
          <Link
            href="/abonnemang"
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700 transition active:scale-[0.98] hover:border-sky-400 hover:bg-sky-50 touch-manipulation"
          >
            {isFree ? "Uppgradera till abonnemang" : "Hantera abonnemang"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
