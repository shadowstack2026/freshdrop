"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError("Inloggning misslyckades. Kontrollera uppgifterna och försök igen.");
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/auth/claim-orders", {
        method: "POST"
      });
    } catch {
      // Ignorera fel här, dashboard laddar ändå.
    }

    if (data?.user) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">Logga in</h1>
      <p className="text-xs text-slate-600 mb-6">
        Logga in för att se och följa dina beställningar.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? "Loggar in..." : "Logga in"}
        </Button>
      </form>
      <p className="mt-4 text-xs text-slate-600">
        Har du inget konto?{" "}
        <a href="/signup" className="text-primary hover:underline">
          Skapa konto
        </a>
        .
      </p>
    </div>
  );
}

