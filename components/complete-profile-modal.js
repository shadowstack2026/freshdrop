"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import {
  ALLOWED_POSTAL_CODES,
  normalizePostalCode,
  POSTAL_CODE_CITY_MAP
} from "@/lib/allowed-postal-codes";

const NAME_REGEX = /^[A-Za-zÅÄÖåäö\s-]+$/;
const PHONE_REGEX = /^(\+46|0)7\d{8}$/;
const POSTAL_REGEX = /^\d{5}$/;

/**
 * Modal som visas för användare (t.ex. efter Google-inloggning) som saknar
 * komplett profil. Steg 1: postnummer (zonkontroll). Steg 2: namn, efternamn,
 * adress, telefon. E-post hämtas från inloggningen och behöver inte fyllas i.
 * Kan inte stängas förrän profilen är sparad.
 */
export default function CompleteProfileModal({ user, onComplete }) {
  const supabase = createClientComponentClient();
  const [step, setStep] = useState(1);
  const [postalCode, setPostalCode] = useState("");
  const [postalTouched, setPostalTouched] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedPostal = normalizePostalCode(postalCode);
  const postalFormatValid = POSTAL_REGEX.test(normalizedPostal);
  const postalAllowed = postalFormatValid && ALLOWED_POSTAL_CODES.has(normalizedPostal);
  const showPostalError = postalTouched && (!postalFormatValid || !postalAllowed);
  const postalErrorMessage = !postalFormatValid
    ? "Ange ett giltigt postnummer (5 siffror)."
    : "Detta postnummer stöds ej";

  useEffect(() => {
    if (postalAllowed) {
      const mappedCity = POSTAL_CODE_CITY_MAP.get(normalizedPostal);
      if (mappedCity && !city.trim()) setCity(mappedCity);
    }
  }, [postalAllowed, normalizedPostal, city]);

  const isNameValid = (v) => NAME_REGEX.test((v || "").trim());
  const hasLetter = (v) => /[A-Za-zÅÄÖåäö]/.test(v || "");
  const normalizedPhone = (phone || "").replace(/\s+/g, "");
  const phoneValid = !normalizedPhone || PHONE_REGEX.test(normalizedPhone);
  const addressValid = (address1 || "").trim().length >= 5 && hasLetter(address1);
  const cityValid = isNameValid(city);
  const firstNameValid = isNameValid(firstName);
  const lastNameValid = isNameValid(lastName);

  const canGoToStep2 = postalAllowed;
  const canSubmit =
    firstNameValid &&
    lastNameValid &&
    phoneValid &&
    normalizedPhone.length > 0 &&
    addressValid &&
    cityValid;

  async function handlePostnummerNext() {
    setPostalTouched(true);
    if (!postalAllowed) return;
    setError("");
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !user?.id) return;
    setLoading(true);
    setError("");

    const fullName = `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim();
    const phoneNormalized = (phone || "").replace(/\s+/g, "");
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email || "",
        full_name: fullName,
        phone: phoneNormalized,
        address_line1: (address1 || "").trim(),
        postal_code: normalizedPostal,
        city: (city || "").trim(),
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      setError(updateError.message || "Kunde inte spara profilen. Försök igen.");
      setLoading(false);
      return;
    }
    setLoading(false);
    onComplete?.();
  }

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-profile-title"
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="complete-profile-title" className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Komplettera din profil
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Vi behöver några uppgifter för att kunna leverera till dig. Postnummer används för zonkontroll.
        </p>

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <Input
              id="complete-postal"
              label="Postnummer"
              value={postalCode}
              onChange={(e) => {
                setPostalTouched(true);
                setPostalCode(e.target.value);
              }}
              placeholder="T.ex. 25244"
              error={showPostalError ? postalErrorMessage : undefined}
              helpText="Postnummer används för zonkontroll och sparas automatiskt."
              inputClassName="text-base"
            />
            {postalFormatValid && !postalAllowed && postalTouched && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Ej i vårt område</p>
                <p>Detta postnummer stöds ej</p>
              </div>
            )}
            {postalAllowed && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <p className="font-semibold">Postnummer godkänt</p>
                <p>Vi levererar till din stad. Fyll i resten nedan.</p>
              </div>
            )}
            <Button
              type="button"
              onClick={handlePostnummerNext}
              disabled={!postalAllowed}
              className="w-full rounded-full bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fortsätt
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="complete-email"
              label="E-post"
              type="email"
              value={user.email || ""}
              disabled
              inputClassName="bg-slate-50 text-slate-500"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="complete-firstName"
                label="Förnamn"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                error={firstName && !firstNameValid ? "Ange ett giltigt förnamn." : undefined}
              />
              <Input
                id="complete-lastName"
                label="Efternamn"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                error={lastName && !lastNameValid ? "Ange ett giltigt efternamn." : undefined}
              />
            </div>
            <Input
              id="complete-phone"
              label="Telefonnummer"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="07XXXXXXXX"
              error={
                phone && !phoneValid
                  ? "Ange ett svenskt mobilnummer (07... eller +46...)"
                  : undefined
              }
            />
            <Input
              id="complete-address"
              label="Gatuadress"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              required
              error={
                address1 && !addressValid
                  ? "Ange en adress med minst 5 tecken."
                  : undefined
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="complete-city"
                label="Stad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                error={city && !cityValid ? "Ange en giltig stad." : undefined}
              />
              <Input
                id="complete-postalLocked"
                label="Postnummer"
                value={normalizedPostal}
                readOnly
                inputClassName="bg-slate-50 text-slate-500"
              />
            </div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50"
              >
                Tillbaka
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || loading}
                className="flex-1 rounded-full bg-primary px-5 py-3 text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {loading ? "Sparar..." : "Spara och fortsätt"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
