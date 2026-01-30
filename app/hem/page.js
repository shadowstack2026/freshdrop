"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Package, ChevronRight, Menu, X, CalendarDays } from "lucide-react";
import Card from "@/components/ui/card";
import BookingFlow from "@/components/booking-flow";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndProfile() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        router.push("/login");
        return;
      }
      setUser(user);

      if (user) {
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("first_name, last_name, phone, address, postal_code, city").eq("id", user.id).single();
        if (profileError && profileError.code !== "PGRST116") { // PGRST116 means no rows found
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    }
    fetchUserAndProfile();
  }, [supabase, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const scrollToBooking = () => {
    const bookingSection = document.getElementById("boka-tvatt");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center">
        <p className="text-white text-lg">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark text-slate-900">
      <header className="container flex flex-col gap-4 px-0 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">FreshDrop</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Välkommen {profile ? profile.first_name || "tillbaka" : "tillbaka"}!
          </h1>
          <p className="max-w-xl text-sm text-white/80 leading-relaxed md:text-base">
            Planera dina hämtningar, se dina tjänster och följ din bokning i ett mobilanpassat flöde.
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-white shadow-md transition hover:bg-white/20"
          >
            <User className="h-5 w-5" />
            <span>{profile ? `${profile.first_name || "Användare"}` : "Min profil"}</span>
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {isMenuOpen && (
            <Card className="absolute right-0 mt-2 w-48 space-y-2 bg-white p-2 shadow-lg rounded-2xl text-sm text-slate-700">
              <Link href="/profil" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-800 transition hover:bg-slate-100">
                <User className="h-4 w-4" /> Min profil
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-start gap-2 rounded-xl px-3 py-2 text-red-500 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logga ut
              </button>
            </Card>
          )}
        </div>
      </header>

      <main className="container space-y-10 pb-16 pt-4">
        <section className="space-y-6 rounded-3xl bg-white/90 px-6 py-8 shadow-xl">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Dina tjänster</p>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Boka, följ upp och njut.</h2>
            <p className="text-sm text-slate-600 leading-relaxed md:text-base">
              Allt du behöver för att boka tvätt, se leveransflödet och hålla koll på historiken – utan att lämna mobilen.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex min-h-[220px] flex-col justify-between gap-4 bg-sky-50 p-6 shadow-lg transition hover:scale-[1.01]">
              <Package className="h-12 w-12 text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Boka ny tvätt</h3>
                <p className="text-sm text-slate-600 mt-1">Öppna bokningsflödet och fyll i vikt, upphämtning och leverans.</p>
              </div>
              <button
                type="button"
                onClick={scrollToBooking}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-slate-100"
              >
                Starta ny bokning <ChevronRight className="h-4 w-4" />
              </button>
            </Card>
            <Card className="flex min-h-[220px] flex-col justify-between gap-4 bg-white/80 p-6 shadow-md">
              <CalendarDays className="h-12 w-12 text-slate-400" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Mina beställningar</h3>
                <p className="text-sm text-slate-600 mt-1">Se status på tidigare och aktuella tvättar, eller skapa en ny.</p>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                Visa historik
              </div>
            </Card>
          </div>
        </section>

        {profile && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Profil</p>
                <h2 className="text-2xl font-semibold text-white">Din information</h2>
              </div>
              <span className="text-sm font-semibold text-white/80">Uppdaterad</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/90 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Namn</p>
                <p className="mt-1 text-lg font-semibold">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-sm text-slate-500">Profil sparad</p>
              </Card>
              <Card className="bg-white/90 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Telefon</p>
                <p className="mt-1 text-lg font-semibold">{profile.phone || "Ej angivet"}</p>
                <p className="text-sm text-slate-500">Vi hör av oss vid behov</p>
              </Card>
              <Card className="bg-white/90 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Adress</p>
                <p className="mt-1 text-lg font-semibold">{profile.address || "Ej angivet"}</p>
                <p className="text-sm text-slate-500">{profile.city || "-"}, {profile.postal_code || "-"}</p>
              </Card>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Bokning</p>
              <h2 className="text-2xl font-semibold text-white">Steg för steg</h2>
            </div>
            <p className="text-sm font-semibold text-white/80">Mobilanpassat med stora element</p>
          </div>
          <BookingFlow showContactStep profile={profile} user={user} />
        </section>

        <Testimonials />
      </main>
    </div>
  );
}
