"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/password-input";
import Card from "@/components/ui/card";
import { CheckCircle2, XCircle, MapPin, Search } from "lucide-react";

// Central lista/konfig för godkända postnummer
const ALLOWED_POSTCODES = new Set([
  "11122", // Exempelpostnummer
  "12233",
  "12345",
  "54321",
]);

function validatePostalCodeLogic(postalCode) {
  const normalizedPostalCode = postalCode.replace(/\s/g, '');
  return /^[0-9]{5}$/.test(normalizedPostalCode) && ALLOWED_POSTCODES.has(normalizedPostalCode);
}

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/hem";

  const [postalCode, setPostalCode] = useState("");
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(null); // null: no check, true: valid, false: invalid
  const [postalCodeMessage, setPostalCodeMessage] = useState("");
  const postalCodeInputRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false); // Keep for email verification if needed

  // Automatic postcode validation on change
  useEffect(() => {
    if (postalCode.length === 5) {
      const normalized = postalCode.replace(/\s/g, '');
      if (!/^[0-9]{5}$/.test(normalized)) {
        setIsPostalCodeValid(false);
        setPostalCodeMessage("Ange ett giltigt postnummer (5 siffror).");
      } else if (ALLOWED_POSTCODES.has(normalized)) {
        setIsPostalCodeValid(true);
        setPostalCodeMessage("Vi finns i ditt område! Du kan nu skapa konto.");
      } else {
        setIsPostalCodeValid(false);
        setPostalCodeMessage("Ej i ert område. Detta postnummer stöds ej.");
      }
    } else if (postalCode.length > 5) {
      setIsPostalCodeValid(false);
      setPostalCodeMessage("Postnumret får bara innehålla 5 siffror.");
    } else {
      setIsPostalCodeValid(null);
      setPostalCodeMessage("");
    }
  }, [postalCode]);

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setSignupError("");
    setLoading(true);
    setShowVerificationModal(false);

    if (password !== confirmPassword) {
      setSignupError("Lösenorden matchar inte.");
      setLoading(false);
      return;
    }

    // Check if postal code is valid before attempting signup
    if (isPostalCodeValid !== true) {
      setSignupError("Vänligen ange ett giltigt postnummer först.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Supabase signUp error:", signUpError);
      setSignupError(signUpError.message || "Kunde inte skapa konto. Försök igen.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setSignupError("Kunde inte skapa konto. Ingen användardata mottogs.");
      setLoading(false);
      return;
    }

    if (data.session) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        first_name: fullName.split(' ')[0] || '',
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        postal_code: postalCode.replace(/\s/g, ''), // Save normalized postal code
      });

      if (profileError) {
        console.error("Supabase profile upsert error:", profileError);
        setSignupError("Konto skapades men profilen kunde inte sparas. Försök logga in.");
        setLoading(false);
        router.push(redirectTo);
        router.refresh();
        return;
      }

      try {
        await fetch("/api/auth/claim-orders", {
          method: "POST",
        });
      } catch (err) {
        console.error("Error claiming orders:", err);
      }

      router.push(redirectTo);
      router.refresh();
    } else {
      setShowVerificationModal(true);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-sky-300 mb-10 drop-shadow-lg">Skapa ditt FreshDrop-konto</h1>

        <Card className="p-8 space-y-6 shadow-2xl border-none bg-white/90 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center gap-5 text-center">
            {isPostalCodeValid === true && <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce-in" />}
            {isPostalCodeValid === false && <XCircle className="h-16 w-16 text-red-500 animate-shake" />}
            {isPostalCodeValid === null && <MapPin className="h-16 w-16 text-primary animate-pulse" />}
            
            <h2 className="text-3xl font-bold text-slate-800">
              {isPostalCodeValid === true
                ? "Område bekräftat!"
                : "Börja din beställning"}
            </h2>
            <p className="text-lg text-slate-600 max-w-sm leading-relaxed">
              {isPostalCodeValid === true
                ? "Fyll i dina uppgifter för att skapa ditt konto."
                : "Verifiera ditt postnummer för att se om FreshDrop finns i ditt område."}
            </p>
          </div>

          <div className="relative">
            <Input
              ref={postalCodeInputRef}
              id="postalCode"
              label="Postnummer"
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full text-lg pl-5 pr-12 py-3 rounded-xl border-2 focus:border-primary-dark transition-all duration-300"
              placeholder="T.ex. 12345"
              error={isPostalCodeValid === false && postalCodeMessage}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              {isPostalCodeValid === true && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              {isPostalCodeValid === false && <XCircle className="h-6 w-6 text-red-500" />}
              {isPostalCodeValid === null && postalCode.length > 0 && <Search className="h-6 w-6 text-slate-400 animate-pulse-fast" />}
            </span>
          </div>

          {isPostalCodeValid === true && ( // Conditionally render signup form
            <form onSubmit={handleSignupSubmit} className="space-y-5 animate-fade-in-up mt-8 border-t border-slate-200 pt-6">
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
              {signupError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                  <XCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{signupError}</p>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white hover:bg-sky-500 focus:ring-primary/80 py-3 text-base font-semibold transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
              >
                {loading ? "Skapar konto..." : "Skapa konto"}
              </Button>
            </form>
          )}

          {isPostalCodeValid === false && postalCode.length === 5 && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in mt-6">
              <XCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{postalCodeMessage}</p>
            </div>
          )}
        </Card>

        {/* Email verification modal (retained if needed for Supabase config) */}
        {/* <Modal
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
        </Modal> */}
      </div>
    </div>
  );
}
