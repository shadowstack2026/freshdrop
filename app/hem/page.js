"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Package, ChevronRight, Menu, X, CalendarDays } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

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
      <header className="container flex items-center justify-end py-6">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>{profile ? `${profile.first_name || 'Användare'}` : 'Min profil'}</span>
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
      </header>

      <main className="container py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sky-300 text-center mb-10 drop-shadow-lg">
          Välkommen {profile ? profile.first_name : 'tillbaka'}!
        </h1>

        {/* Bokningssektion */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Dina tjänster</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 flex flex-col items-center text-center bg-sky-50 border-sky-200 shadow-md transition-all hover:scale-105">
              <Package className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Boka ny tvätt</h3>
              <p className="text-slate-600 mb-4">Starta en ny tvättbeställning.</p>
              <Button onClick={scrollToBooking} className="bg-primary text-white hover:bg-sky-500 flex items-center gap-2 mt-auto">
                Boka tvätt <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center bg-slate-50 border-slate-200 shadow-md opacity-70 cursor-not-allowed">
              <CalendarDays className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Mina beställningar</h3>
              <p className="text-slate-600 mb-4">Se status på dina aktuella och tidigare tvättar.</p>
              <Button disabled className="bg-slate-300 text-slate-600 mt-auto">Kommer snart</Button>
            </Card>
          </div>
        </section>

        {/* Välj typ av tvätt - sektion */}
        <section id="boka-tvatt" className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Välj typ av tvätt</h2>
          <div className="border border-dashed border-slate-300 p-8 text-center text-slate-500 rounded-lg">
            <p className="text-lg">Här kommer alternativen för tvätt att läggas till.</p>
            <p className="text-sm mt-2">T.ex. "Standardtvätt", "Kemtvätt", "Endast strykning"</p>
          </div>
        </section>
      </main>
    </div>
  );
}
