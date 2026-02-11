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
    daysPerPeriod: 14,
    creditsPerPeriod: 1,
    intervalLabel: "Varannan vecka"
  },
  premium_weekly: {
    id: "premium_weekly",
    name: "FreshDrop Premium",
    price: 899,
    daysPerPeriod: 7,
    creditsPerPeriod: 1,
    intervalLabel: "Varje vecka"
  }
};

/**
 * Returnerar planinfo för en plan-id.
 */
export function getPlanConfig(planId) {
  return PLANS[planId] || PLANS.free;
}

/**
 * Beräknar nästa period_start och period_end för en plan.
 * today = Date eller "YYYY-MM-DD".
 */
export function getNextPeriod(planId, fromDate = new Date()) {
  const plan = getPlanConfig(planId);
  if (!plan.daysPerPeriod) {
    return { period_start: toDateString(fromDate), period_end: toDateString(fromDate) };
  }
  const d = typeof fromDate === "string" ? new Date(fromDate + "T12:00:00") : new Date(fromDate);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
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
 * Om today > period_end ska perioden resetas och användaren få ny credit.
 * Returnerar { shouldReset, period_start?, period_end?, credits_remaining? }.
 */
export function maybeResetPeriod(subscription, today = new Date()) {
  const todayStr = toDateString(today);
  const plan = getPlanConfig(subscription?.plan);
  if (!plan?.daysPerPeriod || subscription.credits_remaining > 0) {
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
    credits_remaining: plan.creditsPerPeriod ?? 1
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
