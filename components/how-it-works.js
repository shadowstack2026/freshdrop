"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    title: "Boka upphämtning",
    description:
      "Välj tid som passar dig. Vi hämtar tvätten direkt hemma hos dig – enkelt och utan krångel.",
    accent: "from-primary/70 via-sky-400/40 to-sky-500/50",
    src: "/images/pickup-2.png"
  },
  {
    title: "Vi tvättar och viker",
    description:
      "Vi tvättar dina kläder varsamt, viker dem snyggt och ser till att allt är fräscht och klart.",
    accent: "from-slate-500/20 via-slate-400/10 to-primary/20",
    src: "/images/wash-2.png"
  },
  {
    title: "Leverans till dörren",
    description:
      "Inom 48 timmar levererar vi tillbaka din tvätt – ren, vikt och redo att användas.",
    accent: "from-sky-400/40 via-primary/30 to-primary/70",
    src: "/images/deliver-2.png"
  }
];

export default function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.step) {
            const index = Number(entry.target.dataset.step);
            setVisibleSteps((current) => {
              if (current.includes(index)) {
                return current;
              }
              return [...current, index];
            });
          }
        });
      },
      { threshold: 0.35 }
    );

    stepRefs.current.forEach((stepEl) => {
      if (stepEl) {
        observer.observe(stepEl);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-sky-50 border-y border-slate-200">
      <div className="container space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Så fungerar FreshDrop
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
            En enkel, trygg process som känns modern och fräsch. Scrolla igenom varje steg
            för att få en tydlig bild av hur vi tar hand om din tvätt från start till slut.
          </p>
        </div>

        <div className="space-y-10">
          {steps.map((step, index) => {
            const isVisible = visibleSteps.includes(index);
            return (
              <div
                key={step.title}
                ref={(el) => (stepRefs.current[index] = el)}
                data-step={index}
                className={`flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl shadow-slate-200/50 transition duration-700 ease-out md:flex-row lg:gap-10 ${
                  isVisible
                    ? "opacity-100 translate-y-0 animate-fade-slide-up"
                    : "opacity-0 translate-y-6"
                }`}
                style={isVisible ? { animationDelay: `${index * 120}ms` } : undefined}
              >
                <div className="flex flex-col items-center gap-3 md:items-start md:w-60">
                  <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br ${step.accent} text-base font-semibold text-white shadow-lg shadow-slate-200/60`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 text-center md:text-left">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="flex-1 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-inner">
                  <div className="relative h-44 md:h-56 w-full overflow-hidden rounded-2xl bg-slate-100/80 shadow-inner shadow-slate-200/60 transition duration-1000 ease-out">
                    <Image
                      src={step.src}
                      alt={`${step.title} illustration`}
                      fill
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-contain opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-white/10 to-sky-100/30 mix-blend-soft-light" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
