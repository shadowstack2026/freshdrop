"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Testimonials from "@/components/testimonials";
import HowItWorksSection from "@/components/how-it-works";
import BookingFlow from "@/components/booking-flow";
import Card from "@/components/ui/card";

const bagPricing = [
  {
    title: "Liten påse",
    price: "199 kr",
    subtitle: "Perfekt för vardagsplagg och småtvätt."
  },
  {
    title: "Mellan påse",
    price: "299 kr",
    subtitle: "Lagom för helgens blandade tvätt."
  },
  {
    title: "Stor påse",
    price: "399 kr",
    subtitle: "För större tvätthögar eller familjen."
  }
];

const subscriptionPricing = [
  {
    title: "Varannan vecka",
    price: "499 kr",
    bullets: ["Regelbunden hämtning", "Flexibel ändring", "Prioriterad service"]
  },
  {
    title: "Varje vecka",
    price: "899 kr",
    bullets: ["Maximal bekvämlighet", "Först i kön", "Premiumsupport"]
  }
];

export default function HomePage() {
  const pricingCardRefs = useRef([]);
  const [visiblePricingCards, setVisiblePricingCards] = useState([]);

  function handleScrollToBooking() {
    const bookingSection = document.getElementById("boka-tvatt");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  }

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

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden hero-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-sky-400/60 z-10 hero-overlay"></div>
        <div className="container relative z-20 text-center">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white mb-4">
            Enklare tvätt, renare liv
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-tight drop-shadow-sm">
            Tvätt hämtad, tvättad och levererad inom{" "}
            <span className="text-white">48 timmar</span>.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90 drop-shadow-sm">
            FreshDrop gör din vardag enklare. Vi hämtar dina kläder hemma hos
            dig, tvättar och levererar tillbaka – allt utan att du behöver
            lyfta ett finger. Upplev friheten med enkel tvätt.
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
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Priser & abonnemang
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Priser & abonnemang
            </h2>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              Välj det upplägg som passar din vardag. Alltid tydligt pris, alltid premiumkänsla.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 text-center">
              Fast pris per påse (väldigt populärt)
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {bagPricing.map((item, index) => {
                const isVisible = visiblePricingCards.includes(index);
                return (
                  <div
                    key={item.title}
                    ref={(el) => (pricingCardRefs.current[index] = el)}
                    data-pricing-card={index}
                    className={`group rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-700 ease-out ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    } hover:-translate-y-1 hover:shadow-xl`}
                  >
                    <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-200 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">
                      Bild kommer här
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                      <span className="text-lg font-semibold text-primary">{item.price}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.subtitle}</p>
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
            <div className="grid gap-6 md:grid-cols-2">
              {subscriptionPricing.map((item, index) => {
                const cardIndex = bagPricing.length + index;
                const isVisible = visiblePricingCards.includes(cardIndex);
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
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                      >
                        Välj abonnemang
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

      {/* FAQ / Contact Section */}
      <section id="fragor-kontakt" className="bg-slate-50 border-t py-16 md:py-24">
        <div className="container space-y-12">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center text-slate-900 mb-10">
            Frågor & Kontakt
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            <Card className="bg-white border-none shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Pris och betalning
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Du anger en uppskattad vikt när du bokar, så beräknar vi ett
                preliminärt pris. Slutligt pris baseras på uppmätt vikt vid
                tvätt. All betalning sker via säker kassa med Stripe.
              </p>
            </Card>
            <Card className="bg-white border-none shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Vanliga frågor
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700 leading-relaxed">
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
            </Card>
            <Card className="bg-white border-none shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Kontakt
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Har du frågor om din bokning eller vill du göra ändringar?
                Kontakta oss på{" "}
                <a href="mailto:kontakt@freshdrop.se">
                  kontakt@freshdrop.se
                </a>
                .
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
