"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Card from "./ui/card";

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

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const nextTestimonial = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[current];

  return (
    <section className="py-16 md:py-24 bg-white border-y">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center text-slate-900 mb-12">
          Vad våra kunder säger
        </h2>
        <Card className="relative max-w-2xl mx-auto p-8 bg-sky-50 border border-primary/20 shadow-lg">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
              />
            ))}
          </div>
          <p className="text-center text-slate-700 text-lg italic mb-6 leading-relaxed">
            "{currentTestimonial.quote}"
          </p>
          <p className="text-center font-semibold text-slate-800">
            — {currentTestimonial.author}
          </p>

          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Föregående recension"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Nästa recension"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </Card>
      </div>
    </section>
  );
}
