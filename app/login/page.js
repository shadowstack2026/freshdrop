"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card"; // Import Card component
import { LogIn, XCircle } from "lucide-react"; // Import icon
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/hem";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Supabase signIn error:", signInError);
      setError(signInError.message || "Inloggning misslyckades. Kontrollera uppgifterna och försök igen.");
      setLoading(false);
      return;
    }

    // Verify session after sign-in attempt
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Supabase getSession error after signIn:", sessionError);
      setError(sessionError.message || "Ett oväntat fel uppstod vid hämtning av sessionen.");
      setLoading(false);
      return;
    }

    if (session && session.user) {
      // Claim orders if any
      try {
        await fetch("/api/auth/claim-orders", {
          method: "POST",
        });
      } catch (err) {
        console.error("Error claiming orders after login:", err);
        // Ignorera fel här, dashboard laddar ändå.
      }

      router.push(redirectTo);
      router.refresh();
    } else {
      // This case should ideally not happen if signInWithPassword was successful,
      // but it's a fallback if session is somehow not established.
      setError("Inloggning misslyckades. Ingen aktiv session kunde etableras.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-sky-300 mb-10 drop-shadow-lg">Välkommen tillbaka</h1>

        <Card className="p-8 space-y-6 shadow-2xl border-none bg-white/90 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center gap-5 text-center">
            <LogIn className="h-16 w-16 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-slate-800">Logga in på ditt konto</h2>
            <p className="text-lg text-slate-600 max-w-sm leading-relaxed">
              Få tillgång till dina beställningar och hantera din profil.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up mt-8">
            <Input
              id="email"
              label="E-post"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-lg pl-5 pr-5 py-3 rounded-xl border-2 focus:border-primary-dark transition-all duration-300"
            />
            <Input
              id="password"
              label="Lösenord"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-lg pl-5 pr-5 py-3 rounded-xl border-2 focus:border-primary-dark transition-all duration-300"
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                <XCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-sky-500 focus:ring-primary/80 py-3 text-base font-semibold transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
            >
              {loading ? "Loggar in..." : "Logga in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-base text-slate-600">
            Har du inget konto?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Skapa konto här
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
