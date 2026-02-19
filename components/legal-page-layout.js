"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ChevronDown, ChevronRight } from "lucide-react";

const legalPages = [
  { label: "Integritetspolicy", href: "/integritet" },
  { label: "Användarvillkor", href: "/villkor" },
  { label: "Cookies", href: "/cookies" }
];

export default function LegalPageLayout({
  title,
  description,
  updated = "februari 2025",
  toc = [],
  children,
  currentPath
}) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50/30">
      {/* Hero */}
      <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent bottom-0" />
        <div className="container py-10 md:py-14">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Juridiskt
              </p>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                {description}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Senast uppdaterad: {updated}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Table of contents – sticky on desktop */}
          {toc.length > 0 && (
            <aside className="lg:w-56 lg:shrink-0">
              <div className="lg:sticky lg:top-24">
                <button
                  type="button"
                  onClick={() => setTocOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm lg:hidden"
                >
                  Innehåll
                  {tocOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                <nav
                  className={`mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:mt-0 ${
                    tocOpen ? "block" : "hidden lg:block"
                  }`}
                  aria-label="Sidans innehåll"
                >
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Innehåll
                  </p>
                  <ul className="space-y-0.5">
                    {toc.map(({ id, label }) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-sky-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}

          {/* Main content */}
          <article className="min-w-0 flex-1">
            <div className="space-y-8 md:space-y-10">
              {children}
            </div>

            {/* Related legal pages */}
            <div className="mt-12 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Relaterade sidor
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {legalPages
                  .filter((p) => p.href !== currentPath)
                  .map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                    >
                      {p.label}
                    </Link>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ id, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="border-l-4 border-primary pl-4 md:pl-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      <div className="legal-prose mt-5 md:mt-6">{children}</div>
    </section>
  );
}
