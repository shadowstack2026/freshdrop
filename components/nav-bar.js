"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Droplets, User, LogIn, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur-lg">
      <nav className="container flex h-20 items-center justify-between gap-4">
        {/* FreshDrop Logo Link (Always visible) */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" style={{ minHeight: '44px' }}>
          <Droplets className="h-8 w-8 text-primary" />
          <span className="font-semibold tracking-tight text-xl text-slate-800">FreshDrop</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Conditional Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              loggedInNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-3 text-base font-medium transition-colors rounded-lg ${
                    pathname === link.href || (link.href === "/" && pathname === "/hem")
                      ? "text-primary underline decoration-2 decoration-primary-dark"
                      : "text-slate-700 hover:text-primary hover:underline hover:decoration-2 hover:decoration-primary/50"
                  }`}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-3 text-base font-medium transition-colors rounded-lg ${
                    pathname === link.href || (link.href === "/" && pathname === "/dashboard")
                      ? "text-primary underline decoration-2 decoration-primary-dark"
                      : "text-slate-700 hover:text-primary hover:underline hover:decoration-2 hover:decoration-primary/50"
                  }`}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Auth/Profile Section - Conditional Rendering */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className={`inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2`}
                style={{ minHeight: '44px' }}
              >
                <User className="h-4 w-4" />
                <span>Min profil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                style={{ minHeight: '44px' }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logga ut</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
                style={{ minHeight: '44px' }}
              >
                <LogIn className="h-4 w-4" />
                <span>Logga in</span>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 rounded-full border border-primary text-primary bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
                style={{ minHeight: '44px' }}
              >
                <User className="h-4 w-4" />
                <span>Skapa konto</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
