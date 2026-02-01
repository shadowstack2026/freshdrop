"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Droplets, User, LogIn, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

const sectionLinks = [
  { label: "Hur det funkar", targetId: "hur-det-funkar" },
  { label: "Boka tvätt", targetId: "boka-tvatt" },
  { label: "Frågor & Kontakt", targetId: "fragor-kontakt" }
];

const authenticatedNavLinks = [
  { label: "Mitt konto", href: "/account" },
  { label: "Mina abonnemang", href: "/subscriptions" },
  { label: "Mina bokningar", href: "/bookings" }
];

const guestNavLinks = [
  { label: "Logga in / Skapa konto", href: "/login" }
];

export default function NavBar() {
  const router = useRouter();
  const supabase = supabaseBrowserClient;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const highlightTimeouts = useRef(new Map());

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

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setProfileOpen(false);
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [profileOpen]);

  useEffect(() => {
    return () => {
      highlightTimeouts.current.forEach((timer) => clearTimeout(timer));
      highlightTimeouts.current.clear();
    };
  }, []);

  const animateSectionHighlight = (section) => {
    const highlightClass = "section-scroll-highlight";
    const existingTimer = highlightTimeouts.current.get(section);
    if (existingTimer) {
      clearTimeout(existingTimer);
      highlightTimeouts.current.delete(section);
    }
    section.classList.remove(highlightClass);
    section.classList.add(highlightClass);
    const timer = window.setTimeout(() => {
      section.classList.remove(highlightClass);
      highlightTimeouts.current.delete(section);
    }, 1200);
    highlightTimeouts.current.set(section, timer);
  };

  const scrollToSection = (targetId) => {
    if (typeof document === "undefined") return false;
    const section = document.getElementById(targetId);
    if (!section) return false;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    animateSectionHighlight(section);
    return true;
  };

  const handleSectionClick = (targetId) => {
    if (scrollToSection(targetId)) {
      setProfileOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setProfileOpen(false);
    router.push("/");
  };

  const navButtonClasses =
    "text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <nav className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Droplets className="h-8 w-8 text-primary" />
          <span>FreshDrop</span>
        </Link>
        <div className="flex flex-1 items-center justify-center gap-4 text-sm font-semibold text-slate-700 md:gap-6">
          {sectionLinks.map((link) => (
            <button
              key={link.targetId}
              type="button"
              onClick={() => handleSectionClick(link.targetId)}
              className={navButtonClasses}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              ref={buttonRef}
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <User className="h-5 w-5" />
            </button>
            {profileOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm"
              >
                <div className="space-y-1">
                  {(isLoggedIn ? authenticatedNavLinks : guestNavLinks).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary hover:text-primary"
                      onClick={() => setProfileOpen(false)}
                    >
                      <span>{link.label}</span>
                      {!isLoggedIn && <LogIn className="h-4 w-4 text-slate-400" />}
                    </Link>
                  ))}
                </div>
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logga ut
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
