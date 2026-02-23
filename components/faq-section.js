"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, Plus, Minus, ArrowRight } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "pris",
    question: "Hur fungerar priset och betalningen?",
    answer:
      "Du anger en uppskattad vikt när du bokar, så beräknar vi ett preliminärt pris. Slutligt pris baseras på uppmätt vikt vid tvätt. All betalning sker via säker kassa med Stripe."
  },
  {
    id: "vikt",
    question: "Vad händer om vikten skiljer sig från uppskattningen?",
    answer:
      "Du väljer storlek på påse (liten, mellan eller stor) och betalar det fasta priset för den påsen."
  },
  {
    id: "konto",
    question: "Måste jag skapa konto för att boka?",
    answer:
      "Nej, du kan boka som gäst med e-post. Skapar du konto senare med samma e-post kopplas dina tidigare beställningar automatiskt."
  },
  {
    id: "pasen",
    question: "Hur hittar jag rätt påsstorlek och tvätttyp?",
    answer:
      "Välj mellan liten, mellan eller stor påse utifrån hur mycket tvätt du har. Du väljer också grovtvätt eller vardagstvätt – vi guidar dig steg för steg i bokningsflödet."
  },
  {
    id: "leverans",
    question: "När hämtar och levererar ni?",
    answer:
      "Du väljer önskat datum och tidsfönster (förmiddag 8–11, efter middag eller kväll). Vi hämtar och levererar tillbaka inom 48 timmar från upphämtning."
  },
  {
    id: "kontakt",
    question: "Hur kontaktar jag er?",
    answer: (
      <>
        Har du frågor om din bokning eller vill göra ändringar? Skicka e-post till{" "}
        <a
          href="mailto:hej@freshdrop.se"
          className="font-medium text-primary underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
        >
          hej@freshdrop.se
        </a>{" "}
        så svarar vi så snart vi kan.
      </>
    )
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState(null);

  return (
    <section
      id="faq"
      className="border-t border-slate-200 bg-gradient-to-b from-sky-50 via-white to-sky-50/40 py-14 md:py-20"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
          Vanliga frågor
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="group flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5 sm:py-4"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  id={`faq-question-${item.id}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-primary">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800 sm:text-base">
                    {item.question}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-100">
                    {isOpen ? (
                      <Minus className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <Plus className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </span>
                </button>

                <div
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${item.id}`}
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5">
                      <div className="text-sm leading-relaxed text-slate-600">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/om-oss"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-sky-700"
          >
            Fler vanliga frågor och svar
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
