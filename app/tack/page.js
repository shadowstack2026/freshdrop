"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="relative overflow-hidden bg-slate-50">
      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden text-white hero-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 to-sky-400/60 z-10 hero-overlay" />
        <div className="container relative z-20 text-center">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white mb-4">
            Tack för din bokning
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 drop-shadow-sm">
            Vi har tagit emot din bokning ✅
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto opacity-90 drop-shadow-sm">
            Tack för din bokning hos oss! Kolla gärna ditt telefonnummer eller mail för vidare
            information. Vi hoppas vi syns igen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 py-3 text-base font-medium shadow-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2"
            >
              Tillbaka till startsidan
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
