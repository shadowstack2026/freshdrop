"use client";

import Link from "next/link";
import { Droplets, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import BookingForm from "@/components/booking-form";
import Testimonials from "@/components/testimonials";
import Card from "@/components/ui/card";
import { useRouter } from "next/navigation";

const PRICE_PER_KG = 60;

const howItWorksSteps = [
  {
    title: "Boka upphämtning",
    description: "Välj en tid som passar dig. Vi kommer och hämtar din tvätt direkt vid din dörr.",
    icon: Calendar
  },
  {
    title: "Vi tvättar & viker",
    description: "Dina kläder tvättas professionellt, torkas och viks med omsorg.",
    icon: Droplets
  },
  {
    title: "Leverans inom 48 timmar",
    description: "Få tillbaka din rena, fräscha tvätt inom 48 timmar från upphämtning.",
    icon: CheckCircle2
  }
];

export default function HomePage() {
  const router = useRouter();

  function handleScrollToBooking() {
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleBookingSuccess(checkoutUrl) {
    router.push(checkoutUrl);
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden hero-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-sky-400/60 z-10"></div>
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
              Boka tvätt
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white px-6 py-3 text-base font-medium shadow-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2"
            >
              Logga in / Skapa konto
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-sky-50 border-y">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center text-slate-900 mb-12">
            Så fungerar FreshDrop
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <Card key={step.title} className="text-center p-6 bg-white border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/15 text-primary mx-auto mb-6">
                  <step.icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-base text-slate-700 leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-section" className="py-16 md:py-24 bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center text-slate-900 mb-12">
            Boka din tvätt
          </h2>
          <div className="max-w-3xl mx-auto border border-primary/20 rounded-xl shadow-lg p-6 md:p-8 bg-sky-50">
            <BookingForm embedded onSubmitSuccess={handleBookingSuccess} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ / Contact Section */}
      <section className="bg-slate-50 border-t py-16 md:py-24">
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
