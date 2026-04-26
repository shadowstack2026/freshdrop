"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, X, HelpCircle, Plus, Minus } from "lucide-react";
import Testimonials from "@/components/testimonials";
import HowItWorksSection from "@/components/how-it-works";
import BookingFlow from "@/components/booking-flow";
import FaqSection from "@/components/faq-section";
import Card from "@/components/ui/card";
import { supabaseBrowserClient } from "@/lib/supabase/client";

const bagPricing = [
  {
    id: "vanlig",
    title: "Vanlig påse",
    price: "279 kr",
    subtitle: "För vardaglig tvätt och grovtvätt.",
    capacity: "8–10 kg",
    imageSrc: "/images/bags/vanlig.png",
    details:
      "Rymmer cirka 8–10 kg. Perfekt för vardaglig tvätt och grovtvätt. I priset ingår sortering, hämtning, tvätt, strykning på skjortor och leverans."
  },
  {
    id: "stor",
    title: "Stor påse",
    price: "329 kr",
    subtitle: "För vardaglig tvätt och grovtvätt.",
    capacity: "10–13 kg",
    imageSrc: "/images/bags/stor.png",
    details:
      "Rymmer cirka 10–13 kg. För dig som vill ta allt i ett svep. I priset ingår sortering, hämtning, tvätt, strykning på skjortor och leverans."
  }
];

const subscriptionPricing = [
  {
    title: "3 tvättar/månad",
    price: "499 kr",
    bullets: ["3 gratis tvättar/månad", "Flexibel ändring", "Prioriterad service"],
    details: [
      "Abonnemang – FreshDrop Standard (3 tvättar/månad)",
      "Så funkar det:",
      "Varje månad får du 3 gratis tvättar. Krediterna återställs den första varje månad. Varje upphämtning omfattar en stor FreshDrop-påse, där du fritt kan blanda vardagstvätt och grovtvätt i samma påse.",
      "Har du mer tvätt än vad som ryms i påsen? Då kan du enkelt boka en extra tvätt till ordinarie pris."
    ]
  },
  {
    title: "5 tvättar/månad",
    price: "899 kr",
    bullets: ["5 gratis tvättar/månad", "Först i kön", "Premiumsupport"],
    details: [
      "Abonnemang – FreshDrop Premium (5 tvättar/månad)",
      "Så funkar det:",
      "Varje månad får du 5 gratis tvättar. Krediterna återställs den första varje månad. Varje upphämtning omfattar en stor FreshDrop-påse, där du fritt kan blanda vardagstvätt och grovtvätt i samma påse.",
      "Har du mer tvätt än vad som ryms i påsen? Då kan du enkelt boka en extra tvätt till ordinarie pris."
    ]
  }
];

export default function HomePage() {
  const pricingCardRefs = useRef([]);
  const [visiblePricingCards, setVisiblePricingCards] = useState([]);
  const [openSubscription, setOpenSubscription] = useState(null);
  const [openBag, setOpenBag] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const supabase = supabaseBrowserClient;

  function handleScrollToBooking() {
    const bookingSection = document.getElementById("boka-tvatt");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.dataset.pricingCard);
          if (Number.isNaN(index)) return;
          setVisiblePricingCards((current) => {
            if (current.includes(index)) return current;
            return [...current, index];
          });
        });
      },
      { threshold: 0.25 }
    );

    pricingCardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!authModalOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAuthModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [authModalOpen]);

  const handleSubscriptionSelect = async (index) => {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedSubscription(index);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden hero-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-sky-400/60 z-10 hero-overlay"></div>
        <div className="container relative z-20 text-center">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white mb-4">
            Mer tid för livet
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-tight drop-shadow-sm">
            Tvätt hämtad, tvättad och levererad inom{" "}
            <span className="text-white">48 timmar</span>.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90 drop-shadow-sm">
            FreshDrop underlättar den hektiska vardagen genom att avlasta dig med din tvätt. Allt du behöver
            göra är att packa ner din tvätt för avhämtning och sedan tvättar vi och levererar tillbaka ren tvätt
            inom 48h. Boka tvätt nedan för att frigöra mer tid i livet.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleScrollToBooking}
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 py-3 text-base font-medium shadow-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2"
            >
              Boka tvätt privatperson
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link
              href="/offert"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white px-6 py-3 text-base font-medium shadow-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2"
            >
              Boka tvätt via företag
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <HowItWorksSection sectionId="how-it-works" />

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-white border-y border-slate-200">
        <div className="container space-y-12">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-slate-800 via-slate-900 to-teal-800 bg-clip-text text-transparent">
                Priser & abonnemang
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              Välj det alternativ som passar dig bäst.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 text-center">
              Varje påse har fast pris
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {bagPricing.map((item, index) => {
                const isVisible = visiblePricingCards.includes(index);
                const isOpen = openBag === index;
                return (
                  <div
                    key={item.id}
                    ref={(el) => (pricingCardRefs.current[index] = el)}
                    data-pricing-card={index}
                    className={`group rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-700 ease-out ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    } hover:-translate-y-1 hover:shadow-xl`}
                  >
                    <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-50">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/30" />
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        width={1100}
                        height={800}
                        className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={false}
                      />
                      <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
                        Rymmer {item.capacity}
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                      <span className="text-lg font-semibold text-primary">{item.price}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.subtitle}</p>
                    <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                      {["Sortering", "Hämtning", "Tvätt", "Strykning på skjortor", "Leverans"].map((service) => (
                        <li key={`${item.id}-${service}`} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setOpenBag((prev) => (prev === index ? null : index))}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      {isOpen ? "Läs mer ↓" : "Läs mer →"}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-out ${
                        isOpen ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                        {item.details}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-slate-600 text-center">
              Vi skickar med påsarna till kunden vid beställning så att de får dem hemma.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 text-center">
              Abonnemang
            </h3>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto text-center">
              Välj ett abonnemang som passar din vardag – få tvätt hämtad och levererad utan att tänka på det.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {subscriptionPricing.map((item, index) => {
                const cardIndex = bagPricing.length + index;
                const isVisible = visiblePricingCards.includes(cardIndex);
                const isOpen = openSubscription === index;
                return (
                  <div
                    key={item.title}
                    ref={(el) => (pricingCardRefs.current[cardIndex] = el)}
                    data-pricing-card={cardIndex}
                    className={`transition duration-700 ease-out ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  >
                    <Card className="rounded-3xl border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                        <span className="text-xl font-semibold text-primary">{item.price}</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        {item.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSubscription((prev) => (prev === index ? null : index))
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                      >
                        {isOpen ? "Läs mer ↓" : "Läs mer →"}
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-out ${
                          isOpen ? "max-h-[520px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 space-y-3">
                          {item.details.map((line, detailIndex) => (
                            <p
                              key={`${item.title}-detail-${detailIndex}`}
                              className={detailIndex === 0 ? "font-semibold text-slate-900" : ""}
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                        onClick={() => handleSubscriptionSelect(index)}
                      >
                        {selectedSubscription === index ? "Valt abonnemang" : "Välj abonnemang"}
                      </button>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            ref={(el) =>
              (pricingCardRefs.current[bagPricing.length + subscriptionPricing.length] = el)
            }
            data-pricing-card={bagPricing.length + subscriptionPricing.length}
            className={`transition duration-700 ease-out ${
              visiblePricingCards.includes(bagPricing.length + subscriptionPricing.length)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/offert"
              className="block rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Företag?</p>
              <h4 className="mt-2 text-2xl font-semibold text-slate-900">
                Klicka här för att få en offert
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Vi skräddarsyr upplägg för kontor, hotell och servicebolag.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <BookingFlow showContactStep />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Vanliga frågor – accordion (inspirerad av referens, FreshDrop-tema) */}
      <FaqSection />

      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/30 transition-all duration-300 ease-out animate-fade-slide-up"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                  Abonnemang
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">Abonnemang kräver konto</h3>
                <p className="text-sm text-slate-600">
                  För att kunna använda ett abonnemang behöver du ett konto. Det gör allt
                  mycket enklare att hålla koll på din tvätt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Stäng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {[
                "Se alla bokningar & historik",
                "Ändra tider och hantera abonnemang",
                "Sparad adress & snabbare bokning",
                "Få kvitton och bekräftelser samlat"
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="flex-1 rounded-full bg-sky-100 px-5 py-3 text-center text-sm font-semibold text-sky-800 transition hover:bg-sky-200"
              >
                Skapa konto
              </Link>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
              >
                Stäng
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">
              Har du redan konto?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                Logga in
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
