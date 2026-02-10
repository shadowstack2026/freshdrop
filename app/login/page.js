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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedPhone = identifier.replace(/\s+/g, "");
  const isPhoneIdentifier = /^(\+46|0)7\d{8}$/.test(normalizedPhone);
  const loginEmail = isPhoneIdentifier
    ? `phone-${normalizedPhone}@freshdrop.local`
    : identifier.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
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

  async function handleGoogleSignIn() {
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message || "Google-inloggning misslyckades.");
    }
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
              id="identifier"
              label="E-post eller telefonnummer"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="mejl@exempel.se eller 07..."
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

            <div className="flex items-center gap-3 pt-1">
              <span className="flex-1 h-px bg-slate-300" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-500">Eller</span>
              <span className="flex-1 h-px bg-slate-300" aria-hidden="true" />
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 text-base font-semibold rounded-xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-primary/80 transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Fortsätt med Google
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
