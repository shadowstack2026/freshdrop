"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/password-input";
import Modal from "@/components/ui/modal";

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowVerificationModal(false);

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      console.error("Supabase signUp error:", signUpError);
      setError(signUpError.message || "Kunde inte skapa konto. Försök igen.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Kunde inte skapa konto. Ingen användardata mottogs.");
      setLoading(false);
      return;
    }

    // Om Supabase skickar en session, betyder det att ingen verifiering behövs (Email Confirmation är OFF)
    if (data.session) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName
      });

      if (profileError) {
        console.error("Supabase profile upsert error:", profileError);
        setError("Konto skapades men profilen kunde inte sparas. Försök logga in.");
        setLoading(false);
        router.push(redirectTo);
        router.refresh();
        return;
      }

      try {
        await fetch("/api/auth/claim-orders", {
          method: "POST"
        });
      } catch (err) {
        console.error("Error claiming orders:", err);
      }

      router.push(redirectTo);
      router.refresh();

    } else {
      // Ingen session, så e-postverifiering krävs.
      setShowVerificationModal(true);
    }

    setLoading(false);
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
        <PasswordInput
          id="password"
          label="Lösenord"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          id="confirmPassword"
          label="Bekräfta lösenord"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="Verifiera din e-post"
      >
        <p className="text-sm text-slate-700 mb-4">
          Ett verifieringsmejl har skickats till <span className="font-medium">{email}</span>.
          Vänligen klicka på länken i mejlet för att aktivera ditt konto.
        </p>
        <Button
          onClick={() => setShowVerificationModal(false)}
          className="w-full bg-primary text-white hover:bg-sky-400"
        >
          Stäng
        </Button>
      </Modal>
    </div>
  );
}
