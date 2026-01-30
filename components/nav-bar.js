"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Droplets, User, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

// Public nav links for unauthenticated users
const publicNavLinks = [
  { href: "/", label: "Hem" },
  { href: "/order/new", label: "Boka tvätt" },
];

// Logged-in nav links for authenticated users
const loggedInNavLinks = [
  { href: "/hem", label: "Hem" },
  { href: "/order/new", label: "Boka tvätt" },
  { href: "/dashboard", label: "Mina beställningar" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowserClient;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (mounted) {
        setIsLoggedIn(Boolean(session?.user));
      }
    }

    checkSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsLoggedIn(Boolean(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <nav className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Droplets className="h-8 w-8 text-primary" />
          <span>FreshDrop</span>
        </Link>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white px-6 py-6 text-lg leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <Droplets className="h-6 w-6 text-primary" />
              FreshDrop
            </span>
            <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-8 space-y-4">
            {(isLoggedIn ? loggedInNavLinks : publicNavLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 transition hover:border-primary hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Min profil</span>
                  <User className="h-4 w-4 text-slate-400" />
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-left font-semibold text-red-500 transition hover:bg-red-100"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 transition hover:border-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Logga in</span>
                  <LogIn className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-between rounded-2xl border border-primary bg-white px-4 py-3 font-semibold text-primary transition hover:bg-sky-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Skapa konto</span>
                  <User className="h-4 w-4 text-primary" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
