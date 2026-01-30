"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Droplets, User, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Card from "@/components/ui/card";

const publicNavLinks = [
  { href: "/", label: "Hem" },
  { href: "/order/new", label: "Boka tvätt" },
];

const loggedInNavLinks = [
  { href: "/order/new", label: "Boka tvätt" },
  { href: "/dashboard", label: "Mina beställningar" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("Min profil");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchSessionAndProfile() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(session));

      if (session && session.user) {
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("first_name").eq("id", session.user.id).single();
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData && profileData.first_name) {
          setProfileName(profileData.first_name);
        }
      }
    }
    fetchSessionAndProfile();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setProfileName("Min profil");
    router.refresh();
  }

  const navLinksToRender = isLoggedIn ? loggedInNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur-lg">
      <nav className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" style={{ minHeight: '44px' }}>
          <Droplets className="h-8 w-8 text-primary" />
          <span className="font-semibold tracking-tight text-xl text-slate-800">FreshDrop</span>
        </Link>
        
        <div className={`flex items-center gap-6 ${isLoggedIn ? 'w-full justify-center' : ''}`}>
          {/* Main Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinksToRender.map((link) => (
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
            ))}
          </div>

          {/* Auth/Profile Section */}
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
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
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
                  style={{ minHeight: '44px' }}
                >
                  <User className="h-4 w-4" />
                  <span>{profileName}</span>
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>

                {isMenuOpen && (
                  <Card className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 z-10 animate-fade-in-down">
                    <Link href="/profil" className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                      <User className="h-4 w-4" /> Min profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Logga ut
                    </button>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
