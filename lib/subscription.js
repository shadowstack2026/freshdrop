/**
 * Abonnemang: planer, perioder och kreditlogik.
 * Används av API-routes och klient för att visa/uppdatera subscription.
 */

export const PLANS = {
  free: {
    id: "free",
    name: "Gratis (Start)",
    price: 0,
    daysPerPeriod: 0,
    creditsPerPeriod: 0
  },
  standard_biweekly: {
    id: "standard_biweekly",
    name: "FreshDrop Standard",
    price: 499,
    daysPerPeriod: 0,
    periodType: "month",
    creditsPerPeriod: 3,
    intervalLabel: "3 tvättar/månad"
  },
  premium_weekly: {
    id: "premium_weekly",
    name: "FreshDrop Premium",
    price: 899,
    daysPerPeriod: 0,
    periodType: "month",
    creditsPerPeriod: 5,
    intervalLabel: "5 tvättar/månad"
  }
};

/**
 * Returnerar planinfo för en plan-id.
 */
export function getPlanConfig(planId) {
  return PLANS[planId] || PLANS.free;
}

/**
 * Beräknar period_start och period_end för en plan.
 * För månadsplaner: första och sista dagen i månaden som innehåller fromDate.
 * fromDate = Date eller "YYYY-MM-DD".
 */
export function getNextPeriod(planId, fromDate = new Date()) {
  const plan = getPlanConfig(planId);
  const d = typeof fromDate === "string" ? new Date(fromDate + "T12:00:00") : new Date(fromDate);
  d.setHours(0, 0, 0, 0);

  if (plan.periodType === "month") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
      period_start: toDateString(start),
      period_end: toDateString(end)
    };
  }
  if (!plan.daysPerPeriod) {
    return { period_start: toDateString(d), period_end: toDateString(d) };
  }
  const start = new Date(d);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.daysPerPeriod);
  return {
    period_start: toDateString(start),
    period_end: toDateString(end)
  };
}

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Om today > period_end (ny månad) ska perioden resetas och användaren få nya krediter.
 * Returnerar { shouldReset, period_start?, period_end?, credits_remaining? }.
 */
export function maybeResetPeriod(subscription, today = new Date()) {
  const todayStr = toDateString(today);
  const plan = getPlanConfig(subscription?.plan);
  const isMonthly = plan?.periodType === "month";
  const hasPeriod = isMonthly || (plan?.daysPerPeriod && plan.daysPerPeriod > 0);
  if (!hasPeriod) {
    return { shouldReset: false };
  }
  if (todayStr <= subscription.period_end) {
    return { shouldReset: false };
  }
  const { period_start, period_end } = getNextPeriod(subscription.plan, today);
  return {
    shouldReset: true,
    period_start,
    period_end,
    credits_remaining: plan.creditsPerPeriod ?? 0
  };
}

/**
 * Kan användaren använda en kredit (har kvar och period giltig, eller reset först)?
 */
export function canUseCredit(subscription) {
  if (!subscription || subscription.plan === "free") return false;
  const reset = maybeResetPeriod(subscription);
  const credits = reset.shouldReset ? reset.credits_remaining : subscription.credits_remaining;
  return credits > 0;
}
