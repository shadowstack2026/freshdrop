"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError || !data.user) {
      setError("Kunde inte skapa konto. Försök igen.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName
    });

    if (profileError) {
      setError("Konto skapades men profilen kunde inte sparas.");
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/auth/claim-orders", {
        method: "POST"
      });
    } catch {
      // Ignorera.
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">Skapa konto</h1>
      <p className="text-xs text-slate-600 mb-6">
        Skapa ett konto för att spara adress och följa alla dina beställningar.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="fullName"
          label="Namn"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          id="email"
          label="E-post"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Lösenord"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white hover:bg-sky-400"
        >
          {loading ? "Skapar konto..." : "Skapa konto"}
        </Button>
      </form>
    </div>
  );
}

