"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="relative overflow-hidden bg-slate-50">
      <section className="relative flex min-h-[380px] items-center justify-center overflow-hidden text-white hero-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 to-sky-400/60 z-10 hero-overlay" />
        <div className="container relative z-20 text-center">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white mb-4">
            Vi finns här
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 drop-shadow-sm">
            Kontakta oss
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto opacity-90 drop-shadow-sm">
            Har du frågor om tvätt, bokning eller abonnemang? Skicka ett meddelande så svarar vi så snart vi kan.
          </p>
        </div>
      </section>

      <section className="relative py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />
        </div>
        <div className="container relative max-w-2xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            {submitted ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium text-slate-800">Tack för ditt meddelande.</p>
                <p className="mt-2 text-sm text-slate-600">
                  Vi återkommer till dig så snart vi kan.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                >
                  Tillbaka till startsidan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="kontakt-namn" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Namn
                  </label>
                  <input
                    id="kontakt-namn"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Ditt namn"
                  />
                </div>
                <div>
                  <label htmlFor="kontakt-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    E-post
                  </label>
                  <input
                    id="kontakt-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="din@epost.se"
                  />
                </div>
                <div>
                  <label htmlFor="kontakt-meddelande" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Meddelande
                  </label>
                  <textarea
                    id="kontakt-meddelande"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y min-h-[120px]"
                    placeholder="Skriv ditt meddelande..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                >
                  Skicka meddelande
                </button>
              </form>
            )}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-600">
            <a
              href="mailto:hej@freshdrop.se"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              hej@freshdrop.se
            </a>
            <a
              href="tel:+46701234567"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              070-123 45 67
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
