"use client";

import Link from "next/link";
import { Droplets, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

const PRICE_PER_KG = 60;

const steps = [
  {
    title: "Boka upphämtning",
    description:
      "Välj datum och tidsfönster som passar dig. Vi hämtar direkt vid din dörr.",
    icon: Calendar
  },
  {
    title: "Vi tvättar",
    description:
      "Dina kläder tvättas skonsamt, torkas och viks – redo att användas.",
    icon: Droplets
  },
  {
    title: "Leverans inom 48 timmar",
    description:
      "Vi levererar tillbaka dina kläder inom 48 timmar från upphämtning.",
    icon: CheckCircle2
  }
];

export default function HomePage() {
  return (
    <div className="bg-[var(--background)]">
      <section className="container py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              Ny tjänst i stan
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Tvätt hämtad och levererad{" "}
              <span className="text-primary">inom 48 timmar</span>.
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              FreshDrop hämtar dina kläder hemma hos dig, tvättar och levererar
              tillbaka – utan att du behöver lyfta ett finger. Välj upphämtning,
              luta dig tillbaka och få allt tillbaka inom 48 timmar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/order/new"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400"
              >
                Boka tvätt
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
              >
                Logga in / Skapa konto
              </Link>
            </div>
            <div className="rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 shadow-sm max-w-md">
              <div className="flex items-center justify-between">
                <span className="font-medium">Fast pris</span>
                <span className="text-primary font-semibold">
                  {PRICE_PER_KG} kr/kg
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Du betalar efter faktisk vikt. Leverans alltid inom 48 timmar
                från vald upphämtningstid.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Så funkar det
              </h2>
              <div className="mt-4 space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.title}
                    className="flex gap-3 rounded-xl bg-slate-50 px-3 py-3"
                  >
                    <div className="mt-0.5 rounded-full bg-sky-100 p-2">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {step.title}
                      </div>
                      <p className="text-xs text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Varför FreshDrop?
              </h2>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• Hämtning och leverans hemma hos dig.</li>
                <li>• Tydligt pris: 60 kr/kg, inga dolda avgifter.</li>
                <li>• Pålitlig leverans inom 48 timmar.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-white">
        <div className="container py-12 space-y-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Pris och betalning
              </h2>
              <p className="mt-2 text-xs text-slate-600">
                Du anger en uppskattad vikt när du bokar, så beräknar vi ett
                preliminärt pris. Slutligt pris baseras på uppmätt vikt vid
                tvätt. All betalning sker via säker kassa med Stripe.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Vanliga frågor
              </h2>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                <li>
                  <span className="font-medium">
                    Vad händer om vikten skiljer sig?
                  </span>
                  <br />
                  Priset justeras efter faktisk vikt, men alltid med samma
                  kilopris.
                </li>
                <li>
                  <span className="font-medium">
                    Måste jag skapa konto?
                  </span>
                  <br />
                  Nej, du kan boka som gäst med e-post. Skapar du konto senare
                  med samma e-post kopplas dina tidigare beställningar.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Kontakt
              </h2>
              <p className="mt-2 text-xs text-slate-600">
                Har du frågor om din bokning eller vill du göra ändringar?
                Kontakta oss på{" "}
                <a href="mailto:kontakt@freshdrop.se">
                  kontakt@freshdrop.se
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
