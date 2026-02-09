"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Card from "./ui/card";

const AUTO_ADVANCE_MS = 5_000;

const testimonials = [
  {
    id: 1,
    quote:
      "Detta är andra gången jag använder FreshDrops tjänster, och jag är lika nöjd som första gången. De levererar konsekvent högkvalitativa resultat och utmärkt kundservice.",
    author: "David Wilson"
  },
  {
    id: 2,
    quote:
      "Jag var skeptisk först, men nu kan jag inte tänka mig att tvätta själv igen. Bekvämt, snabbt och mina kläder har aldrig varit renare!",
    author: "Anna Larsson"
  },
  {
    id: 3,
    quote:
      "Fantastisk tjänst! Det är så skönt att slippa släpa tvätten fram och tillbaka. Och leveransen inom 48 timmar är guld värd.",
    author: "Erik Johansson"
  }
];

function TestimonialSlide({ quote, author }) {
  return (
    <>
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
          />
        ))}
      </div>
      <p className="text-center text-slate-700 text-base italic mb-4 leading-relaxed sm:text-lg sm:mb-6">
        "{quote}"
      </p>
      <p className="text-center font-semibold text-slate-800">
        — {author}
      </p>
    </>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const nextTestimonial = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    resetAutoAdvance();
  };

  const resetAutoAdvance = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextTestimonial, AUTO_ADVANCE_MS);
  }, [nextTestimonial]);

  useEffect(() => {
    timerRef.current = setInterval(nextTestimonial, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextTestimonial]);

  const slidePercent = (100 / testimonials.length) * current;

  return (
    <section className="py-16 md:py-24 bg-white border-y">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center text-slate-900 mb-12">
          Vad våra kunder säger
        </h2>
        <Card className="relative max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-sky-50 border border-primary/20 shadow-lg overflow-hidden">
          {/* Synligt fönster – en slide i taget */}
          <div className="overflow-hidden">
            {/* Strip med alla slides – sveper horisontellt */}
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{
                width: `${testimonials.length * 100}%`,
                transform: `translateX(-${slidePercent}%)`
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex-shrink-0 px-0"
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <TestimonialSlide quote={t.quote} author={t.author} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex min-w-[44px] min-h-[44px] items-center justify-center rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20 active:bg-primary/25 transition-colors z-10 touch-manipulation sm:left-4 sm:p-2"
            aria-label="Föregående recension"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              nextTestimonial();
              resetAutoAdvance();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex min-w-[44px] min-h-[44px] items-center justify-center rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20 active:bg-primary/25 transition-colors z-10 touch-manipulation sm:right-4 sm:p-2"
            aria-label="Nästa recension"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </Card>
      </div>
    </section>
  );
}
