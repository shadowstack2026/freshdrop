"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, ChevronRight, CalendarDays } from "lucide-react";
import Card from "@/components/ui/card";
import BookingFlow from "@/components/booking-flow";
import Testimonials from "@/components/testimonials";
import SubscriptionCard from "@/components/subscription-card";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [useSubscriptionCredit, setUseSubscriptionCredit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async (userId) => {
    if (!userId) {
      setSubscriptionLoading(false);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const res = await fetch("/api/subscription/ensure");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (e) {
      console.error("Subscription fetch error:", e);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

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
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            phone: profileData.phone || "",
            address_line1: profileData.address_line1 || "",
            address_line2: profileData.address_line2 || "",
            postal_code: profileData.postal_code || "",
            city: profileData.city || ""
          });
        }
        fetchSubscription(user.id);
      } else {
        setSubscriptionLoading(false);
      }
      setLoading(false);
    }
    fetchUserAndProfile();
  }, [supabase, router, fetchSubscription]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const scrollToBooking = (withCredit = false) => {
    if (withCredit) setUseSubscriptionCredit(true);
    const scrollToSection = () => {
      const el = document.getElementById("boka-tvatt");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    setTimeout(scrollToSection, 100);
    setTimeout(scrollToSection, 400);
  };

  const handleBookWithCredit = () => {
    scrollToBooking(true);
  };

  const handleSubscriptionUpdated = () => {
    if (user?.id) fetchSubscription(user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center">
        <p className="text-white text-lg">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark text-slate-100">
      <header className="container flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-5 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:py-6">
        <div className="space-y-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/90">FreshDrop</p>
          <h1 className="text-2xl font-semibold text-primary sm:text-3xl md:text-4xl">
            Välkommen {profile ? profile.full_name || "tillbaka" : "tillbaka"}!
          </h1>
          <p className="max-w-xl text-sm text-primary/80 leading-relaxed md:text-base">
            Planera dina hämtningar, se dina tjänster och följ din bokning i ett mobilanpassat flöde.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-primary/40 bg-white/10 px-5 py-3 text-primary shadow-md transition active:bg-white/20 hover:bg-white/20 sm:py-2"
          aria-label="Logga ut"
        >
          <LogOut className="h-4 w-4" />
          Logga ut
        </button>
      </header>

      <main className="container space-y-8 pb-12 pt-4 sm:space-y-10 sm:pb-16">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">Ditt kort</p>
          <SubscriptionCard
            subscription={subscription}
            loading={subscriptionLoading}
            onRefresh={handleSubscriptionUpdated}
            onBookWithCredit={handleBookWithCredit}
          />
        </section>

        <section className="space-y-5 rounded-2xl bg-white/90 px-4 py-6 shadow-xl sm:space-y-6 sm:rounded-3xl sm:px-6 sm:py-8">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Dina tjänster</p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">Boka, följ upp och njut.</h2>
            <p className="text-sm text-slate-600 leading-relaxed md:text-base">
              Allt du behöver för att boka tvätt, se leveransflödet och hålla koll på historiken – utan att lämna mobilen.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="flex min-h-0 flex-col justify-between gap-4 bg-sky-50 p-4 shadow-lg transition hover:scale-[1.01] sm:min-h-[220px] sm:p-6">
              <Package className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Boka ny tvätt</h3>
                <p className="mt-1 text-sm text-slate-600">Öppna bokningsflödet och fyll i vikt, upphämtning och leverans.</p>
              </div>
              <button
                type="button"
                onClick={scrollToBooking}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary shadow-sm transition active:bg-slate-100 hover:bg-slate-100"
              >
                Starta ny bokning <ChevronRight className="h-4 w-4" />
              </button>
            </Card>
            <Card className="flex min-h-0 flex-col justify-between gap-4 bg-white/80 p-4 shadow-md sm:min-h-[220px] sm:p-6">
              <CalendarDays className="h-10 w-10 text-slate-400 sm:h-12 sm:w-12" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Mina beställningar</h3>
                <p className="mt-1 text-sm text-slate-600">Se status på tidigare och aktuella tvättar, eller skapa en ny.</p>
              </div>
              <Link
                href="/bookings"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition active:bg-slate-50 hover:bg-slate-50"
              >
                Visa historik <ChevronRight className="h-4 w-4" />
              </Link>
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
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="min-w-0 bg-white/90 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Namn</p>
                <p className="mt-1 text-lg font-semibold">
                  {profile.full_name || "Ej angivet"}
                </p>
                <p className="text-sm text-slate-500">Profil sparad</p>
              </Card>
              <Card className="min-w-0 bg-white/90 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Telefon</p>
                <p className="mt-1 text-lg font-semibold">{profile.phone || "Ej angivet"}</p>
                <p className="text-sm text-slate-500">Vi hör av oss vid behov</p>
              </Card>
              <Card className="min-w-0 bg-white/90 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Adress</p>
                <p className="mt-1 text-lg font-semibold">
                  {profile.address_line1 || "Ej angivet"}
                </p>
                <p className="text-sm text-slate-500">
                  {profile.address_line2 || ""} {profile.address_line2 ? "·" : ""}
                  {profile.city || "-"}, {profile.postal_code || "-"}
                </p>
              </Card>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Bokning</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Steg för steg</h2>
            </div>
            <p className="text-sm font-semibold text-white/80">Mobilanpassat med stora element</p>
          </div>
          <BookingFlow
            showContactStep
            profile={profile}
            user={user}
            subscription={subscription}
            useSubscriptionCredit={useSubscriptionCredit}
            onSubscriptionCreditUsed={handleSubscriptionUpdated}
          />
        </section>

        <Testimonials />
      </main>
    </div>
  );
}
