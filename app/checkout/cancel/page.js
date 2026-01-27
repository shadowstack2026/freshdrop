"use client";

import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Betalning avbruten
      </h1>
      <p className="text-xs text-slate-600 mb-4">
        Din Stripe-betalning avbröts. Du kan försöka igen eller göra ändringar i din bokning.
      </p>
      <div className="space-y-3 text-xs">
        <Link
          href="/order/new"
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Gör en ny bokning
        </Link>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Till startsidan
        </Link>
      </div>
    </div>
  );
}

