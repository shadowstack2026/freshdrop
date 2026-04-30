import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  HeartHandshake,
  MapPin,
  Sparkles,
  Truck
} from "lucide-react";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
      {children}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}

export const metadata = {
  title: "Om oss – FreshDrop",
  description:
    "Lär känna FreshDrop: tvätt hämtad och levererad i Helsingborg. Enkelt, premium och klart inom 48 timmar."
};

export default function OmOssPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-slate-50" />
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        </div>

        <div className="container relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div className="space-y-5">
            <Pill>Om FreshDrop</Pill>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Vi gör din vardag enklare.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              FreshDrop hämtar, tvättar och levererar din tvätt – så att du kan fokusera på det som betyder
              något. Vi vill att det ska kännas premium, tryggt och enkelt varje gång.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/#boka-tvatt"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 active:scale-[0.98] touch-manipulation"
              >
                Boka din första tvätt <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] touch-manipulation"
              >
                Kontakta oss
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                Enkelt & smidigt
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                Nöjd kund-garanti
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                Säker hantering
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-xl">
              <Image
                src="/images/hero-bg.jpg"
                alt="FreshDrop – tvättservice"
                width={1400}
                height={900}
                className="h-[320px] w-full object-cover sm:h-[380px] md:h-[440px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/20 via-transparent to-sky-500/20" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Helsingborg
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-sky-600" />
                Lokalt team · Snabb leverans
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Varför finns FreshDrop?
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-slate-600 md:text-base">
              FreshDrop grundades i Helsingborg med en enkel idé: att göra tvätt till något du inte behöver
              tänka på. Vi såg hur många kämpar med tvättstugan, tider och stress – och bestämde oss för att
              skapa en lösning som sparar tid och energi.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Clock}
              title="Sparar din tid"
              text="Slipp tvättstugan – vi fixar allt."
            />
            <FeatureCard
              icon={BadgeCheck}
              title="Kvalitet i varje steg"
              text="Noggrant tvättat, vikt och kvalitetskontrollerat."
            />
            <FeatureCard
              icon={Truck}
              title="Leverans till dörren"
              text="Vi levererar rent och fräscht direkt hem."
            />
            <FeatureCard
              icon={Sparkles}
              title="Inom 48 timmar"
              text="Snabbt, smidigt och pålitligt – alltid."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 md:py-20">
        <div className="container space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Så fungerar FreshDrop
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
              Tydligt, tryggt och enkelt – från upphämtning till leverans.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Boka upphämtning",
                text: "Välj tid och lämna tvätten vid dörren.",
                src: "/images/pickup-2.png"
              },
              {
                title: "Vi tvättar & viker",
                text: "Skonsam tvätt, noggrant vikt och fräscht.",
                src: "/images/wash-2.png"
              },
              {
                title: "Leverans",
                text: "Tillbaka till dörren – redo att användas.",
                src: "/images/deliver-2.png"
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm"
              >
                <div className="relative h-44 overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-slate-100">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-6"
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {[
              { n: "1", title: "Tvätt", text: "Vi sorterar och tvättar noggrant och skonsamt." },
              { n: "2", title: "Tork & vik", text: "Vi torkar och viker din tvätt med omsorg." },
              { n: "3", title: "Kvalitetskontroll", text: "Rent, fräscht och perfekt – innan leverans." },
              { n: "4", title: "Klart!", text: "Din tvätt är klar för leverans." }
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sm font-bold text-sky-700">
                    {step.n}
                  </div>
                  <p className="text-base font-semibold text-slate-900">{step.title}</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container grid gap-8 md:grid-cols-5 md:items-center">
          <div className="md:col-span-3 space-y-4">
            <Pill>Leveransområde</Pill>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Vi hämtar och levererar i Helsingborg.
            </h2>
            <p className="text-sm text-slate-600 md:text-base">
              Just nu fokuserar vi på att göra tjänsten riktigt bra lokalt. Vi hämtar och levererar i hela
              Helsingborg med omnejd – snabbt, smidigt och med ett team som bryr sig.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                <HeartHandshake className="h-4 w-4 text-sky-600" />
                Personlig service
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                <Clock className="h-4 w-4 text-sky-600" />
                48 timmar
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Redo att slippa tvättstugan?</p>
              <p className="mt-1 text-sm text-slate-600">Boka din första tvätt idag – det tar bara en minut.</p>
              <Link
                href="/#boka-tvatt"
                className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] touch-manipulation"
              >
                Boka nu <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-xs text-slate-500">
                Enkelt & smidigt · Nöjd kund-garanti · Säker hantering
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
