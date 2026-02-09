import Link from "next/link";
import Logo from "@/components/logo";
import {
  Phone,
  Mail,
  Clock,
  Truck,
  Shirt,
  Zap,
  Repeat,
  Building2,
  Instagram,
  Facebook,
  Music2
} from "lucide-react";

const currentYear = new Date().getFullYear();

const services = [
  { label: "Tvätt & vikning", icon: Shirt },
  { label: "Express", icon: Zap },
  { label: "Prenumeration", icon: Repeat },
  { label: "Företag", icon: Building2 }
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#e8f6f8] text-slate-700">
      {/* Top – tagline */}
      <div className="relative py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-base font-medium tracking-tight text-slate-700 sm:text-lg md:text-xl lg:text-2xl">
            Fräscha kläder. Hämtas och levereras inom 48 timmar.
          </p>
          <p className="mt-2 text-sm font-medium text-teal-600">— FreshDrop</p>
        </div>
      </div>

      {/* Main: 4 columns – mobil först 1 kolumn, sedan 2, desktop 4 */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 pb-10 md:pb-14 pt-2">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Logo (bara droppen) + beskrivning */}
          <div className="flex flex-col gap-4">
            <Logo href="/" variant="light" showText={false} logoSize={72} blendBg />
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              Vi hämtar din tvätt, tvättar och levererar tillbaka inom 48 timmar. Enkelt och tydligt pris.
            </p>
          </div>

          {/* Column 2: Tjänster + ikoner */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">
              Tjänster
            </h3>
            <ul className="space-y-3">
              {services.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-3 min-h-[44px] sm:min-h-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-teal-600 sm:h-8 sm:w-8">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-slate-600">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Öppettider + leverans */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">
              Öppettider
            </h3>
            <div className="flex items-start gap-3 min-h-[44px] sm:min-h-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-teal-600 sm:h-8 sm:w-8">
                <Clock className="h-4 w-4" />
              </span>
              <p className="text-sm text-slate-600 pt-1">
                Mån–Fre 08:00–18:00
                <br />
                Lör 09:00–14:00
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 min-h-[44px] sm:min-h-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-teal-600 sm:h-8 sm:w-8">
                <Truck className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-teal-600">Leverans inom 48h</span>
            </div>
          </div>

          {/* Column 4: Kontakt + sociala */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-teal-600">
              Kontakt
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="tel:+46701234567"
                  className="flex items-center gap-3 min-h-[48px] rounded-lg py-2 text-sm text-slate-600 transition hover:text-teal-600 sm:min-h-0 sm:py-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-teal-600 sm:h-8 sm:w-8">
                    <Phone className="h-4 w-4" />
                  </span>
                  +46 70 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:hej@freshdrop.se"
                  className="flex items-center gap-3 min-h-[48px] rounded-lg py-2 text-sm text-slate-600 transition hover:text-teal-600 sm:min-h-0 sm:py-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-teal-600 sm:h-8 sm:w-8">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="break-all">hej@freshdrop.se</span>
                </a>
              </li>
            </ul>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-teal-600">
              Följ oss
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-teal-600 transition hover:bg-teal-500 hover:text-white sm:h-9 sm:w-9"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-teal-600 transition hover:bg-teal-500 hover:text-white sm:h-9 sm:w-9"
                aria-label="TikTok"
              >
                <Music2 className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-teal-600 transition hover:bg-teal-500 hover:text-white sm:h-9 sm:w-9"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar – mobil: stapla, desktop: rad */}
      <div className="border-t border-teal-200/80">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-center sm:flex-row sm:text-left">
          <span className="text-xs text-slate-500">
            © {currentYear} FreshDrop. Alla rättigheter förbehållna.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/integritet"
              className="min-h-[44px] flex items-center justify-center text-xs text-slate-500 transition hover:text-teal-600 sm:min-h-0"
            >
              Integritet
            </Link>
            <Link
              href="/villkor"
              className="min-h-[44px] flex items-center justify-center text-xs text-slate-500 transition hover:text-teal-600 sm:min-h-0"
            >
              Villkor
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
