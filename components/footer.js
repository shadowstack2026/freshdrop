"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const quickLinks = [
  { label: "Hem", href: "/" },
  { label: "Så funkar det", href: "/#how-it-works", sectionId: "how-it-works" },
  { label: "Priser", href: "/#pricing", sectionId: "pricing" },
  { label: "Om oss", href: "/om-oss" },
  { label: "Offert", href: "/offert" },
  { label: "Kontakt", href: "/kontakt" }
];

const infoLinks = [
  { label: "Vanliga frågor", href: "/#faq", sectionId: "faq" },
  { label: "Integritetspolicy", href: "/integritet" },
  { label: "Villkor", href: "/villkor" },
  { label: "Cookies", href: "/cookies" }
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Instagram
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: Facebook
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin
  }
];

const linkClasses =
  "group relative inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const underlineClasses =
  "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-sky-400 transition-transform duration-300 group-hover:scale-x-100";

function FooterLink({ link, linkClasses, underlineClasses }) {
  const pathname = usePathname();
  const isSectionLink = "sectionId" in link && link.sectionId;
  const isHome = pathname === "/";

  const handleClick = (e) => {
    if (isSectionLink && isHome) {
      e.preventDefault();
      const el = document.getElementById(link.sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Link
      href={link.href}
      className={`${linkClasses} hover:-translate-y-0.5`}
      onClick={handleClick}
    >
      {link.label}
      <span className={underlineClasses} />
    </Link>
  );
}

export default function Footer() {
  const footerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="relative mt-16 bg-white">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />
      </div>
      <div
        className={`container relative py-12 sm:py-16 ${
          hasAnimated ? "animate-fade-slide-up" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">FreshDrop</p>
              <p className="mt-2 text-sm text-slate-600">
                Premiumtvätt hämtad och levererad till din dörr. Rent, vikt och klart – inom
                <span className="font-semibold text-slate-900"> 48 timmar</span>.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Snabb leverans · Enkel bokning
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Snabblänkar
            </p>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} linkClasses={linkClasses} underlineClasses={underlineClasses} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Support &amp; info
            </p>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} linkClasses={linkClasses} underlineClasses={underlineClasses} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Socialt
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-600 hover:shadow-[0_0_15px_rgba(56,189,248,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon className="h-5 w-5 transition duration-300 group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Följ oss för tips, erbjudanden och nyheter.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} FreshDrop AB. Org.nr 559000-0000.</p>
          <p className="text-slate-400">Made with care i Sverige.</p>
        </div>
      </div>
    </footer>
  );
}
