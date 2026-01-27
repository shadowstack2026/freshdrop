"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets, User, LogIn } from "lucide-react";

const navLinks = [
  { href: "/", label: "Hem" },
  { href: "/order/new", label: "Boka tvätt" },
  { href: "/dashboard", label: "Mina beställningar" },
  { href: "/admin", label: "Admin" }
];

function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          <span className="font-semibold tracking-tight">FreshDrop</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              <span>Logga in</span>
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-sky-400"
            >
              <User className="h-4 w-4" />
              <span>Skapa konto</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export const metadata = {
  title: "FreshDrop – Tvätt hämtad och levererad inom 48 timmar",
  description:
    "FreshDrop hämtar dina kläder hemma hos dig, tvättar och levererar tillbaka inom 48 timmar. Enkel bokning, tydligt pris: 60 kr/kg."
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t bg-white py-4 mt-8">
          <div className="container flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} FreshDrop.</span>
            <span>Tvätt hämtad, tvättad och levererad inom 48 timmar.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
