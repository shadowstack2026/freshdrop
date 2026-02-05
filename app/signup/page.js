"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/password-input";
import Card from "@/components/ui/card";
import {
  ALLOWED_POSTAL_CODES,
  normalizePostalCode,
  POSTAL_CODE_CITY_MAP
} from "@/lib/allowed-postal-codes";

const NAME_REGEX = /^[A-Za-zÅÄÖåäö\s-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+46|0)7\d{8}$/;
const POSTAL_REGEX = /^\d{5}$/;

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [postalCode, setPostalCode] = useState("");
  const [postalTouched, setPostalTouched] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const normalizedPostal = normalizePostalCode(postalCode);
  const postalFormatValid = POSTAL_REGEX.test(normalizedPostal);
  const postalAllowed = postalFormatValid && ALLOWED_POSTAL_CODES.has(normalizedPostal);

  useEffect(() => {
    if (postalAllowed) {
      const mappedCity = POSTAL_CODE_CITY_MAP.get(normalizedPostal);
      if (mappedCity && !city.trim()) {
        setCity(mappedCity);
      }
    }
  }, [postalAllowed, normalizedPostal, city]);

  const showPostalError = postalTouched && (!postalFormatValid || !postalAllowed);
  const postalErrorMessage = !postalFormatValid
    ? "Ange ett giltigt postnummer (5 siffror)."
    : "Detta postnummer stöds ej";

  const isNameValid = (value) => NAME_REGEX.test(value.trim());
  const hasLetter = (value) => /[A-Za-zÅÄÖåäö]/.test(value);

  const normalizedPhone = phone.replace(/\s+/g, "");
  const hasPhone = Boolean(normalizedPhone);
  const hasEmail = Boolean(email.trim());
  const phoneValid = !hasPhone || PHONE_REGEX.test(normalizedPhone);
  const emailValid = !hasEmail || EMAIL_REGEX.test(email.trim());
  const contactMethodValid = (hasPhone && phoneValid) || (hasEmail && emailValid);
  const addressValid = address1.trim().length >= 5 && hasLetter(address1);
  const cityValid = isNameValid(city);

  const firstNameValid = isNameValid(firstName);
  const lastNameValid = isNameValid(lastName);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  const canShowForm = postalAllowed;

  const canSubmit =
    canShowForm &&
    firstNameValid &&
    lastNameValid &&
    contactMethodValid &&
    addressValid &&
    cityValid &&
    passwordValid &&
    passwordsMatch;

  const formBlockClasses = `transition-all duration-300 ease-out ${
    canShowForm ? "max-h-[2000px] opacity-100 mt-8" : "max-h-0 opacity-0"
  }`;

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setSignupError("");

    const signupEmail = email.trim() || `phone-${normalizedPhone}@freshdrop.local`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail,
      password
    });

    if (signUpError || !data?.user) {
      setSignupError(signUpError?.message || "Kunde inte skapa konto. Försök igen.");
      setLoading(false);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: signupEmail,
      full_name: fullName,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: normalizedPhone,
      address_line1: address1.trim(),
      postal_code: normalizedPostal,
      city: city.trim()
    });

    if (profileError) {
      setSignupError("Konto skapades men profilen kunde inte sparas. Försök logga in.");
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/auth/claim-orders", { method: "POST" });
    } catch (error) {
      // Ignore claim errors for now.
    }

    router.replace("/hem");
    setLoading(false);
  };

  return (
    <div className="bg-slate-50">
      <div className="container py-12 md:py-16">
        <Card className="rounded-3xl border-slate-200 bg-white/95 p-6 shadow-lg sm:p-8">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Vi ska se om denna tjänst finns i din stad
            </h1>
            <p className="text-sm text-slate-500">
              Fyll i postnummer så kontrollerar vi leveransområde innan du skapar konto.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <Input
              id="signup-postal"
              label="Postnummer"
              value={postalCode}
              onChange={(event) => {
                setPostalTouched(true);
                setPostalCode(event.target.value);
              }}
              placeholder="T.ex. 25244"
              error={showPostalError ? postalErrorMessage : undefined}
              helpText="Postnummer används för zonkontroll och sparas automatiskt."
              inputClassName="text-base"
            />

            {postalFormatValid && !postalAllowed && postalTouched && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Ej i ert område</p>
                <p>Detta postnummer stöds ej</p>
              </div>
            )}

            {postalAllowed && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <p className="font-semibold">Postnummer godkänt</p>
                <p>Vi finns i ditt område. Fortsätt med dina uppgifter.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSignupSubmit} className={formBlockClasses}>
            <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="firstName"
                  label="Förnamn"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  error={firstName && !firstNameValid ? "Ange ett giltigt förnamn." : undefined}
                />
                <Input
                  id="lastName"
                  label="Efternamn"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  error={lastName && !lastNameValid ? "Ange ett giltigt efternamn." : undefined}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="phone"
                  label="Telefonnummer"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required={false}
                  placeholder="07XXXXXXXX"
                  error={
                    phone && !phoneValid
                      ? "Ange ett svenskt mobilnummer (07... eller +46...)"
                      : undefined
                  }
                />
                <Input
                  id="email"
                  label="E-post"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required={false}
                  error={email && !emailValid ? "Ange en giltig e-postadress." : undefined}
                />
              </div>
              {!contactMethodValid && (phone || email) && (
                <p className="text-xs text-amber-600">
                  Ange minst en kontaktväg: telefon eller e-post.
                </p>
              )}
              {!hasPhone && !hasEmail && (
                <p className="text-xs text-amber-600">
                  Ange minst en kontaktväg: telefon eller e-post.
                </p>
              )}
              <Input
                id="address1"
                label="Gatuadress"
                value={address1}
                onChange={(event) => setAddress1(event.target.value)}
                required
                error={
                  address1 && !addressValid
                    ? "Ange en adress med minst 5 tecken."
                    : undefined
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="city"
                  label="Stad"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                  error={city && !cityValid ? "Ange en giltig stad." : undefined}
                />
                <Input
                  id="postalCodeLocked"
                  label="Postnummer"
                  value={normalizedPostal}
                  readOnly
                  inputClassName="bg-slate-50 text-slate-500"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordInput
                  id="password"
                  label="Lösenord"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <PasswordInput
                  id="confirmPassword"
                  label="Bekräfta lösenord"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              {password && !passwordValid && (
                <p className="text-xs text-amber-600">Lösenordet måste vara minst 8 tecken.</p>
              )}
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">Lösenorden matchar inte.</p>
              )}
              {signupError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {signupError}
                </div>
              )}
              <Button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full rounded-full bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {loading ? "Skapar konto..." : "Skapa konto"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
