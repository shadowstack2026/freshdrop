"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import {
  ALLOWED_POSTAL_CODES,
  normalizePostalCode,
  POSTAL_CODE_CITY_MAP
} from "@/lib/allowed-postal-codes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarClock, CheckCircle2, Droplets, LayoutGrid, MapPin, Package, Shirt, Sparkles, Thermometer, UserCircle, Wind, XCircle } from "lucide-react";

// Endast för webbläsare ("use client"). Nyckel med HTTP referrer-begränsning. Använd aldrig server-nyckeln här.
const GOOGLE_PLACES_BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

const TIME_SLOTS = [
  { id: "foren", label: "Förmiddag", emoji: "☀️", start: "08:00", end: "11:00" },
  { id: "afternoon", label: "Efter middag", emoji: "🌤", start: "14:00", end: "17:00" },
  { id: "evening", label: "Kväll", emoji: "🌙", start: "17:00", end: "20:00" }
];

const WASH_OPTIONS = [
  {
    id: "grovtvatt",
    title: "Grovtvätt",
    description: "För kraftigare plagg som tål hårdare tvätt.",
    included: ["Handdukar", "Sängkläder", "Jeans", "Arbetskläder"],
    excluded: ["Ull", "Silke", "Fina klänningar"]
  },
  {
    id: "vardagstvatt",
    title: "Vardagstvätt",
    description: "För vardagskläder och känsligare plagg.",
    included: ["T-shirts", "Underkläder", "Tröjor"],
    excluded: ["Kraftigt smutsade arbetskläder"]
  },
  {
    id: "mattvatt",
    title: "Mattvätt",
    description: "Professionell mattvätt. Samma pris för alla mattor, frakt ingår.",
    included: ["Samma pris för alla mattor", "Frakt ingår i priset", "Erfarenhet av mattvätt"],
    excluded: ["Viskos, silke, tencel och bambu tvättas på egen risk"]
  }
];

const SCENT_OPTIONS = [
  {
    id: "fresh-linen",
    label: "Fresh Linen",
    note: "Ljus och ren känsla",
    color: "from-sky-50 to-blue-100",
    accent: "text-sky-700",
    icon: "🌊"
  },
  {
    id: "citrus-clean",
    label: "Citrus Clean",
    note: "Fräsch och pigg",
    color: "from-amber-50 to-amber-100",
    accent: "text-amber-700",
    icon: "🍊"
  },
  {
    id: "lavender-calm",
    label: "Lavender Calm",
    note: "Avslappnande doft",
    color: "from-purple-50 to-purple-100",
    accent: "text-purple-700",
    icon: "💜"
  },
  {
    id: "doftfri",
    label: "Doftfri",
    note: "Neutral känsla",
    color: "from-slate-50 to-slate-100",
    accent: "text-slate-800",
    icon: "⚪"
  }
];

const BAG_OPTIONS = [
  {
    id: "small",
    title: "Liten påse",
    price: 219,
    subtitle: "För vardaglig tvätt och grovtvätt."
  },
  {
    id: "medium",
    title: "Mellan påse",
    price: 279,
    subtitle: "För vardaglig tvätt och grovtvätt."
  },
  {
    id: "large",
    title: "Stor påse",
    price: 329,
    subtitle: "För vardaglig tvätt och grovtvätt."
  }
];

const RUG_PRICE_PER_M2 = 50;
const RUG_MIN_M2 = 3;

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_CODE_REGEX = /^\d{5}$/;
const SERVICE_AREA_CITIES = [
  "Mölle",
  "Arild",
  "Jonstorp",
  "Lerberget",
  "Viken",
  "Höganäs",
  "Nyhamnsläge",
  "Farhult",
  "Utvälinge",
  "Ängelholm",
  "Vejbystrand",
  "Strövelstorp",
  "Hjärnarp",
  "Össjö",
  "Kvidinge",
  "Åstorp",
  "Hyllinge",
  "Helsingborg",
  "Påarp",
  "Ramlösa",
  "Vallåkra",
  "Rydebäck",
  "Gantofta",
  "Bjuv",
  "Billesholm",
  "Klippan",
  "Östra Ljungby",
  "Riseberga",
  "Gråmanstorp",
  "Svalöv",
  "Teckomatorp",
  "Billeberga",
  "Kågeröd",
  "Landskrona",
  "Häljarp",
  "Asmundtorp"
];
const normalizeCity = (value) => value.trim().normalize("NFKC").toLocaleLowerCase("sv-SE");
const SERVICE_AREA_SET = new Set(SERVICE_AREA_CITIES.map(normalizeCity));

const normalizePhoneDigits = (value) => value.replace(/[^\d]/g, "");

const isValidSwedishPhone = (value) => {
  const digits = normalizePhoneDigits(value);
  if (!digits) return false;
  const startsWithCountry = digits.startsWith("46");
  const startsWithZero = digits.startsWith("0");
  if (!startsWithCountry && !startsWithZero) return false;
  if (digits.length < 8 || digits.length > 12) return false;
  return true;
};

const fetchCityFromPostal = async (postalCode, { signal } = {}) => {
  if (!POSTAL_CODE_REGEX.test(postalCode)) return null;
  const response = await fetch(`/api/postnummer?code=${postalCode}`, { signal });
  if (!response.ok) return null;
  const data = await response.json();
  return {
    city: data?.city || "",
    municipality: data?.municipality || ""
  };
};

const searchAddresses = async (query, postalCode, { signal } = {}) => {
  if (!query || query.trim().length < 2) return [];
  const encodedQuery = encodeURIComponent(query.trim());
  const normalizedPostal = normalizePostalCode(postalCode || "");
  const postalParam = POSTAL_CODE_REGEX.test(normalizedPostal)
    ? `&postalCode=${encodeURIComponent(normalizedPostal)}`
    : "";
  const response = await fetch(`/api/address-search?query=${encodedQuery}${postalParam}`, { signal });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.google_status || data?.error
        ? `Adressförslag misslyckades: ${data.google_status || "ERROR"}${data.google_message ? ` (${data.google_message})` : ""}`
        : "Adressförslag misslyckades.";
    throw new Error(message);
  }
  const results = data;
  return (Array.isArray(results) ? results : []).map((item) => ({
    id: item.place_id || item.id,
    place_id: item.place_id || item.id,
    address: item.address || "",
    city: item.city || ""
  }));
};

const parseFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

export default function BookingFlow({
  showContactStep = false,
  profile = null,
  user = null,
  useSubscriptionCredit = false,
  onSubscriptionCreditUsed = null,
  subscription = null
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const nameParts = parseFullName(profile?.full_name || "");
  const profileHasBasics =
    Boolean(profile?.full_name) &&
    Boolean(profile?.address_line1) &&
    Boolean(profile?.postal_code);
  const isLoggedInFlow = Boolean(showContactStep && profile && profileHasBasics);

  const [activeStepIndex, setActiveStepIndex] = useState(showContactStep && !isLoggedInFlow ? 0 : 0);
  const [washType, setWashType] = useState("");
  const [scent, setScent] = useState("");
  const [bagSize, setBagSize] = useState("");
  const [rugWidthCm, setRugWidthCm] = useState(200);
  const [rugHeightCm, setRugHeightCm] = useState(150);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupSlot, setPickupSlot] = useState(TIME_SLOTS[0].id);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState(TIME_SLOTS[0].id);
  const [contactSaved, setContactSaved] = useState(showContactStep && profileHasBasics);
  const [contactError, setContactError] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    address: profile?.address_line1 || "",
    address2: profile?.address_line2 || "",
    postalCode: profile?.postal_code || "",
    city: profile?.city || "",
    phone: profile?.phone || "",
    email: user?.email || ""
  });
  const [cityAutoFilled, setCityAutoFilled] = useState(false);
  const [contactTouched, setContactTouched] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [googlePlacesLoaded, setGooglePlacesLoaded] = useState(false);
  const addressRequestIdRef = useRef(0);
  const addressBlurTimerRef = useRef(null);
  const addressInputRef = useRef(null);
  const placesAutocompleteRef = useRef(null);
  const placesPostalBiasRef = useRef("");
  const postalLookupIdRef = useRef(0);
  const postalLookupAbortRef = useRef(null);
  const postalCacheRef = useRef(new Map());
  const [postalError, setPostalError] = useState("");
  const [postalLookup, setPostalLookup] = useState({
    city: "",
    municipality: "",
    allowed: false
  });
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingCompletionError, setBookingCompletionError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shouldScrollSummary, setShouldScrollSummary] = useState(false);
  const [stepDirection, setStepDirection] = useState(1); // 1 = next, -1 = prev
  const [postalStatus, setPostalStatus] = useState("idle");
  const postalTimerRef = useRef(null);
  const summaryRef = useRef(null);
  const wizardTopRef = useRef(null);
  const confirmationModalRef = useRef(null);
  const confirmationScrollYRef = useRef(0);
  const confirmationWasOpenRef = useRef(false);
  const [confirmationChannel, setConfirmationChannel] = useState("email");
  const [confirmationEmail, setConfirmationEmail] = useState(user?.email || contactInfo.email);
  const [confirmationPhone, setConfirmationPhone] = useState(contactInfo.phone);
  const [confirmationError, setConfirmationError] = useState("");
  const [confirmationSending, setConfirmationSending] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentModalProcessing, setPaymentModalProcessing] = useState(false);

  useEffect(() => {
    if (showContactStep && profileHasBasics) {
      const nextNameParts = parseFullName(profile?.full_name || "");
      setContactInfo({
        firstName: nextNameParts.firstName,
        lastName: nextNameParts.lastName,
        address: profile?.address_line1 || "",
        address2: profile?.address_line2 || "",
        postalCode: profile?.postal_code || "",
        city: profile?.city || "",
        phone: profile?.phone || "",
        email: user?.email || ""
      });
      setContactSaved(true);
      setActiveStepIndex(isLoggedInFlow ? 0 : 2);
    }
  }, [showContactStep, profileHasBasics, isLoggedInFlow]);

  useEffect(() => {
    const nextNameParts = parseFullName(profile?.full_name || "");
    setContactInfo((prev) => ({
      firstName: nextNameParts.firstName || prev.firstName,
      lastName: nextNameParts.lastName || prev.lastName,
      address: profile?.address_line1 || prev.address,
      address2: profile?.address_line2 || prev.address2,
      postalCode: profile?.postal_code || prev.postalCode,
      city: profile?.city || prev.city,
      phone: profile?.phone || prev.phone,
      email: user?.email || prev.email
    }));
  }, [profile, user]);

  useEffect(() => {
    if (!isLoggedInFlow || !profile?.postal_code) return;
    const normalized = normalizePostalCode(profile.postal_code);
    if (!POSTAL_CODE_REGEX.test(normalized) || !ALLOWED_POSTAL_CODES.has(normalized)) return;
    let cancelled = false;
    fetchCityFromPostal(normalized)
      .then((result) => {
        if (cancelled) return;
        setPostalLookup({
          city: result?.city || "",
          municipality: result?.municipality || "",
          allowed: true
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isLoggedInFlow, profile?.postal_code]);

  useEffect(() => {
    setConfirmationEmail(contactInfo.email || user?.email || "");
    setConfirmationPhone(contactInfo.phone || "");
  }, [contactInfo.email, contactInfo.phone, user?.email]);

  useEffect(() => {
    // Hämta adressförslag från servern när användaren skriver (kräver giltigt postnummer från steg 0).
    const query = contactInfo.address.trim();
    const postalCode = normalizePostalCode(contactInfo.postalCode);
    if (!query || query.length < 2 || !POSTAL_CODE_REGEX.test(postalCode)) {
      setAddressSuggestions([]);
      setAddressLoading(false);
      if (query && query.length >= 2 && postalCode && !POSTAL_CODE_REGEX.test(postalCode)) {
        setAddressError("Ange ett giltigt postnummer (5 siffror) för att få adressförslag.");
      }
      return;
    }

    const requestId = addressRequestIdRef.current + 1;
    addressRequestIdRef.current = requestId;
    setAddressLoading(true);
    setAddressError("");
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const results = await searchAddresses(query, postalCode, { signal: controller.signal });
        if (addressRequestIdRef.current !== requestId) return;
        setAddressSuggestions(results);
        setAddressError(results.length > 0 ? "" : "Inga adresser hittades. Testa att skriva mer (t.ex. gata + nummer).");
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (addressRequestIdRef.current === requestId) {
          setAddressSuggestions([]);
          setAddressError(error?.message || "Kunde inte hämta adressförslag.");
        }
      } finally {
        if (addressRequestIdRef.current === requestId) {
          setAddressLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [contactInfo.address, contactInfo.postalCode]);

  // Vi använder alltid serverns förslag och egen dropdown – Googles Autocomplete-widget kopplas inte in.
  useEffect(() => {
    return;
    if (typeof window === "undefined") return;
    const google = window.google;
    if (!google?.maps?.places || !addressInputRef.current) return;
    if (!placesAutocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "se" },
        fields: ["address_components", "formatted_address"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace?.();
        const components = place?.address_components || [];
        const get = (type) => components.find((c) => c.types?.includes(type));

        const route = get("route")?.long_name || "";
        const streetNumber = get("street_number")?.long_name || "";
        const postalCode = normalizePostalCode(get("postal_code")?.long_name || "");
        const city =
          get("postal_town")?.long_name ||
          get("locality")?.long_name ||
          get("administrative_area_level_2")?.long_name ||
          "";

        const address = [route, streetNumber].filter(Boolean).join(" ").trim() || (place?.formatted_address || "");

        setContactSaved(false);
        setContactError("");
        setAddressError("");
        setAddressDropdownOpen(false);
        setAddressSuggestions([]);
        setAddressLoading(false);

        setContactInfo((prev) => ({
          ...prev,
          address: address || prev.address,
          city: city || prev.city,
          postalCode: postalCode || prev.postalCode
        }));

        if (city) setCityAutoFilled(true);

        if (postalCode) {
          const allowed = ALLOWED_POSTAL_CODES.has(postalCode);
          setPostalLookup((prev) => ({ ...prev, allowed }));
          setPostalStatus(allowed ? "valid" : "invalid");
          if (!allowed) {
            setPostalError("Tyvärr levererar vi inte till detta område ännu men inom snart framtid 😊");
            setAddressError("Tyvärr levererar vi inte till detta område ännu men inom snart framtid 😊");
          } else {
            setPostalError("");
          }
        }
      });

      placesAutocompleteRef.current = autocomplete;
    }
  }, [googlePlacesLoaded]);

  useEffect(() => {
    if (!GOOGLE_PLACES_BROWSER_KEY || !googlePlacesLoaded) return;
    if (typeof window === "undefined") return;
    const google = window.google;
    const autocomplete = placesAutocompleteRef.current;
    if (!google?.maps?.Geocoder || !google?.maps?.Circle || !autocomplete) return;

    const postalCode = normalizePostalCode(contactInfo.postalCode || "");
    if (!POSTAL_CODE_REGEX.test(postalCode)) return;
    if (placesPostalBiasRef.current === postalCode) return;
    placesPostalBiasRef.current = postalCode;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: `${postalCode} Sweden`, componentRestrictions: { country: "SE" } },
      (results, status) => {
        if (status !== "OK" || !results?.[0]?.geometry?.location) return;
        const location = results[0].geometry.location;
        const circle = new google.maps.Circle({
          center: location,
          radius: 20000
        });
        const bounds = circle.getBounds?.();
        if (bounds) {
          autocomplete.setBounds(bounds);
        }
      }
    );
  }, [contactInfo.postalCode, googlePlacesLoaded]);

  useEffect(() => {
    return () => {
      if (postalTimerRef.current) {
        clearTimeout(postalTimerRef.current);
      }
      if (addressBlurTimerRef.current) {
        clearTimeout(addressBlurTimerRef.current);
      }
      if (postalLookupAbortRef.current) {
        postalLookupAbortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (shouldScrollSummary && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setShouldScrollSummary(false);
    }
  }, [shouldScrollSummary]);

  useEffect(() => {
    if (!showConfirmationModal) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowConfirmationModal(false);
        setConfirmationError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfirmationModal]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    if (showConfirmationModal) {
      confirmationScrollYRef.current = window.scrollY;
      confirmationWasOpenRef.current = true;
      document.body.style.overflow = "hidden";
    } else if (confirmationWasOpenRef.current) {
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, confirmationScrollYRef.current || 0);
      confirmationWasOpenRef.current = false;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      if (confirmationWasOpenRef.current) {
        window.scrollTo(0, confirmationScrollYRef.current || 0);
        confirmationWasOpenRef.current = false;
      }
    };
  }, [showConfirmationModal]);

  const selectedBag = BAG_OPTIONS.find((option) => option.id === bagSize);
  const rugAreaM2 = useMemo(() => {
    const w = Number(rugWidthCm) || 0;
    const h = Number(rugHeightCm) || 0;
    return Math.max(RUG_MIN_M2, (w / 100) * (h / 100));
  }, [rugWidthCm, rugHeightCm]);
  const rugPrice = useMemo(() => Math.round(rugAreaM2 * RUG_PRICE_PER_M2), [rugAreaM2]);
  const price = useMemo(
    () => (washType === "mattvatt" ? rugPrice : (selectedBag?.price ?? 0)),
    [washType, rugPrice, selectedBag]
  );

  const selectedPickup = TIME_SLOTS.find((slot) => slot.id === pickupSlot);
  const selectedDelivery = TIME_SLOTS.find((slot) => slot.id === deliverySlot);

  const deliveryEstimate = useMemo(() => {
    if (!pickupDate || !selectedPickup) return null;
    const pickup = new Date(`${pickupDate}T${selectedPickup.start}:00`);
    const delivery = addHours(pickup, 48);
    return delivery.toLocaleString("sv-SE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [pickupDate, selectedPickup]);

  const minDeliveryDate = useMemo(() => {
    if (!pickupDate) return null;
    const base = new Date(`${pickupDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return null;
    // Mattvätt: minst 1 vecka; vanlig tvätt: minst 1 dag mellanrum
    const daysToAdd = washType === "mattvatt" ? 7 : 2;
    base.setDate(base.getDate() + daysToAdd);
    return base;
  }, [pickupDate, washType]);

  useEffect(() => {
    if (!pickupDate || !deliveryDate) return;
    const minDate = minDeliveryDate;
    const current = new Date(`${deliveryDate}T00:00:00`);
    if (minDate && current < minDate) {
      setDeliveryDate("");
      setDeliverySlot(TIME_SLOTS[0].id);
    }
  }, [pickupDate, deliveryDate, minDeliveryDate]);

  const handleContactChange = (field) => (event) => {
    setContactSaved(false);
    setContactError("");
    setContactInfo((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCityChange = (event) => {
    setCityAutoFilled(false);
    handleContactChange("city")(event);
  };

  const handlePhoneChange = (event) => {
    setContactTouched(true);
    handleContactChange("phone")(event);
  };

  const handleEmailChange = (event) => {
    setContactTouched(true);
    handleContactChange("email")(event);
  };

  const handleAddressChange = (event) => {
    setContactSaved(false);
    setContactError("");
    setContactInfo((prev) => ({
      ...prev,
      address: event.target.value
    }));
    setAddressDropdownOpen(true);
  };

  const handleAddressSelect = async (suggestion) => {
    setAddressError("");
    setAddressDropdownOpen(false);
    setAddressSuggestions([]);
    const placeId = suggestion.place_id || suggestion.id;
    if (!placeId) {
      setContactInfo((prev) => ({
        ...prev,
        address: suggestion.address || prev.address,
        city: suggestion.city ? suggestion.city : prev.city
      }));
      if (suggestion.city) setCityAutoFilled(true);
      return;
    }
    try {
      const res = await fetch(`/api/address-search?placeId=${encodeURIComponent(placeId)}`);
      const data = await res.json();
      if (!res.ok) {
        setAddressError("Kunde inte hämta adressdetaljer.");
        return;
      }
      setContactSaved(false);
      setContactError("");
      setContactInfo((prev) => ({
        ...prev,
        address: data.address || suggestion.address || prev.address,
        city: data.city || suggestion.city || prev.city,
        postalCode: data.postal_code || prev.postalCode
      }));
      if (data.city) setCityAutoFilled(true);
      if (data.postal_code) {
        setPostalLookup((prev) => ({ ...prev, allowed: data.allowed }));
        setPostalStatus(data.allowed ? "valid" : "invalid");
        if (!data.allowed) {
          setPostalError("Tyvärr levererar vi inte till detta område ännu men inom snart framtid 😊");
          setAddressError("Tyvärr levererar vi inte till detta område ännu men inom snart framtid 😊");
        } else {
          setPostalError("");
        }
      }
    } catch {
      setAddressError("Kunde inte verifiera adressen.");
    }
  };

  const handlePostalChange = (event) => {
    handleContactChange("postalCode")(event);
    const value = event.target.value;
    const trimmed = value.trim();
    const normalized = normalizePostalCode(trimmed);
    if (postalTimerRef.current) {
      clearTimeout(postalTimerRef.current);
      postalTimerRef.current = null;
    }
    setPostalError("");
    setPostalLookup({ city: "", municipality: "", allowed: false });
    if (!normalized) {
      setPostalStatus("idle");
      return;
    }
    if (POSTAL_CODE_REGEX.test(normalized)) {
      if (!ALLOWED_POSTAL_CODES.has(normalized)) {
        setPostalStatus("invalid");
        setPostalError("Tyvärr levererar vi inte till detta område ännu men inom snart framtid 😊");
        return;
      }
      setPostalStatus("loading");
      setContactError("");
      setPostalLookup((prev) => ({
        ...prev,
        allowed: true
      }));
      const mappedCity = POSTAL_CODE_CITY_MAP.get(normalized);
      if (mappedCity && (cityAutoFilled || !contactInfo.city.trim())) {
        setContactInfo((prev) => ({ ...prev, city: mappedCity }));
        setCityAutoFilled(true);
      }
      postalTimerRef.current = setTimeout(() => {
        if (activeStepIndex === 0) {
          setStepDirection(1);
          setActiveStepIndex((prev) => Math.min(prev + 1, stepCount - 1));
        }
        setPostalStatus("idle");
        postalTimerRef.current = null;
      }, 1000);

      const cached = postalCacheRef.current.get(normalized);
      const applyLookup = (result) => {
        if (!result?.city) {
          return;
        }
        setPostalLookup({ city: result.city, municipality: result.municipality || "", allowed: true });
        if (cityAutoFilled || !contactInfo.city.trim()) {
          setContactInfo((prev) => ({ ...prev, city: result.city }));
          setCityAutoFilled(true);
        }
      };

      if (cached) {
        applyLookup(cached);
      } else {
        const requestId = postalLookupIdRef.current + 1;
        postalLookupIdRef.current = requestId;
        if (postalLookupAbortRef.current) {
          postalLookupAbortRef.current.abort();
        }
        const controller = new AbortController();
        postalLookupAbortRef.current = controller;
        fetchCityFromPostal(normalized, { signal: controller.signal })
          .then((result) => {
            if (postalLookupIdRef.current !== requestId) return;
            postalCacheRef.current.set(normalized, result);
            applyLookup(result);
          })
          .catch((error) => {
            if (error?.name === "AbortError") return;
            if (postalLookupIdRef.current !== requestId) return;
          });
      }
      return;
    }
    setPostalStatus("invalid");
    setPostalError("Endast fem siffror godkänns.");
  };

  const stepCount = isLoggedInFlow ? 4 : showContactStep ? 6 : 4;
  const baseStepOffset = isLoggedInFlow ? 0 : showContactStep ? 2 : 1;
  const getBaseStepNumber = (index) => index + baseStepOffset;
  const allBaseSteps = [
    {
      id: "wash",
      title: "Välj typ av tvätt",
      render: () => (
        <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <Shirt className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg {getBaseStepNumber(0)}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Välj typ av tvätt</h3>
              <p className="mt-1 text-sm text-slate-600">Grovtvätt, vardagstvätt eller mattvätt – välj en stil som matchar dina plagg.</p>
              <p className="mt-2 text-xs font-medium text-slate-500">Endast ett val åt gången</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-500">
                <span className="flex items-center gap-1.5 text-xs">
                  <Droplets className="h-3.5 w-3.5" aria-hidden />
                  Vattentvätt
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <Thermometer className="h-3.5 w-3.5" aria-hidden />
                  40°/60°
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <Thermometer className="h-3.5 w-3.5" aria-hidden />
                  60–90°
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <Wind className="h-3.5 w-3.5" aria-hidden />
                  Torktumlas
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 grid-cols-1">
            {WASH_OPTIONS.map((option) => {
              const isSelected = washType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setWashType(option.id);
                  }}
                  className={`group relative flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/80 p-4 text-left transition duration-300 touch-manipulation active:scale-[0.99] sm:p-5 ${
                    isSelected
                      ? "border-primary/80 bg-primary/10 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
                      : "hover:border-primary/50 hover:shadow-lg"
                  }`}
                  style={{ minHeight: "240px" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{option.title}</p>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 text-primary" aria-label="Valt alternativ" />
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      {option.id === "mattvatt" ? (
                        <>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600">Detta ingår</p>
                          <ul className="mt-2 space-y-1 text-sm font-medium text-emerald-800">
                            {option.included.map((item) => (
                              <li key={item} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : option.id === "vardagstvatt" ? (
                        <>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600">Det här ingår</p>
                          <ul className="mt-2 space-y-1.5 text-sm font-medium text-emerald-800">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>Vi sorterar efter färg &amp; temperatur</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>Sängkläder/lakan blir släta och krispiga</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>Strumpor paras ihop, allt viks snyggt och levereras till dörren</span>
                            </li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600">Detta ingår</p>
                          <ul className="mt-2 space-y-1 text-sm font-medium text-emerald-800">
                            {option.included.map((item) => (
                              <li key={item} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-500">Detta ingår inte</p>
                      <ul className="mt-2 space-y-1 text-sm font-medium text-red-700">
                        {option.excluded.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {option.id !== "mattvatt" && (
                    <div className="mt-auto flex gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-[11px]">
                      <div className="flex-1 rounded-2xl bg-emerald-100/80 p-3 text-emerald-700">✓ Rätt plagg</div>
                      <div className="flex-1 rounded-2xl bg-red-100/80 p-3 text-red-600">✕ Fel plagg</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      ),
      isComplete: () => Boolean(washType)
    },
    {
      id: "rug-size",
      title: "Mattstorlek",
      render: () => {
        const rawArea = ((Number(rugWidthCm) || 0) / 100) * ((Number(rugHeightCm) || 0) / 100);
        const areaValid = rawArea >= RUG_MIN_M2;
        return (
          <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <LayoutGrid className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg {getBaseStepNumber(1)}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Mattstorlek</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {RUG_PRICE_PER_M2} kr/m² · Minst {RUG_MIN_M2} m². Fyll i bredd och höjd i cm.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Bredd (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={500}
                    value={rugWidthCm}
                    onChange={(e) => setRugWidthCm(Math.max(0, Number(e.target.value) || 0))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Höjd (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={500}
                    value={rugHeightCm}
                    onChange={(e) => setRugHeightCm(Math.max(0, Number(e.target.value) || 0))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {rugWidthCm} × {rugHeightCm} = {rawArea.toFixed(1)} m²
              </p>
              {!areaValid && rawArea > 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  Minst {RUG_MIN_M2} m² krävs. Mindre mattor kan skickas med grovtvätt.
                </p>
              )}
              <p className="mt-2 text-lg font-semibold text-primary">Ert pris: {rugPrice} kr</p>
            </div>
          </Card>
        );
      },
      isComplete: () => ((Number(rugWidthCm) || 0) / 100) * ((Number(rugHeightCm) || 0) / 100) >= RUG_MIN_M2
    },
    {
      id: "scent",
      title: "Välj doft",
      render: () => (
        <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <Sparkles className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg {getBaseStepNumber(1)}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Välj doft</h3>
              <p className="mt-1 text-sm text-slate-600">Vi tvättar med Svanenmärkta, parfymfria medel.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
            {SCENT_OPTIONS.map((option) => {
              const isActive = scent === option.id;
              const isNeutral = option.id === "doftfri";
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setScent(option.id);
                  }}
                  className={`group relative flex min-h-[125px] flex-col justify-between overflow-hidden rounded-[28px] border bg-gradient-to-br p-3 text-left text-slate-900 transition duration-200 transform-gpu sm:p-4 ${
                    isActive
                      ? "border-primary/90 shadow-[0_15px_35px_rgba(15,118,232,0.25)] scale-[1.01]"
                      : "border-slate-200 hover:border-primary/50 hover:scale-[1.005]"
                  } ${option.color}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 text-sm leading-snug">
                      <p className="flex items-center gap-2 text-lg font-semibold">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="truncate">{option.label}</span>
                      </p>
                      <p className="text-xs text-slate-600 max-h-8 overflow-hidden">{option.note}</p>
                    </div>
                    {isActive && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  {isNeutral && (
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.4em] text-slate-500 sm:text-[11px]">
                      Doftfri
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      ),
      isComplete: () => Boolean(scent)
    },
    {
      id: "pickup",
      title: "Upphämtning & leverans",
      render: () => (
        <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <CalendarClock className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg {getBaseStepNumber(2)}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Upphämtning & leverans</h3>
              <p className="mt-1 text-sm text-slate-600">
                Välj datum och tider för upphämtning och leverans i samma steg.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:gap-10">
            <DateSelectionCard
              title="Upphämtning"
              dateValue={pickupDate}
              onDateChange={(value) => setPickupDate(value)}
              slotValue={pickupSlot}
              onSlotChange={setPickupSlot}
            />
            <DateSelectionCard
              title="Leverans"
              dateValue={deliveryDate}
              onDateChange={(value) => setDeliveryDate(value)}
              slotValue={deliverySlot}
              onSlotChange={setDeliverySlot}
              minDateOverride={minDeliveryDate}
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {washType === "mattvatt"
              ? "Leverans minst 1 vecka efter upphämtning – välj datum och tider."
              : "Leverans sker till din dörr – rent, vikt och klart inom 48 timmar efter upphämtning."}
          </p>
        </Card>
      ),
      isComplete: () => Boolean(pickupDate && pickupSlot && deliveryDate && deliverySlot)
    },
    {
      id: "bag-size",
      title: "Välj påse",
      render: () => (
        <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <Package className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg {getBaseStepNumber(3)}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Välj påse</h3>
              <p className="mt-1 text-sm text-slate-600">
                Välj den påse som passar din tvättmängd bäst.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {BAG_OPTIONS.map((option) => {
              const isSelected = bagSize === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBagSize(option.id)}
                  className={`group flex h-full min-h-[120px] flex-col items-start gap-3 rounded-[28px] border bg-white/90 p-4 text-left transition duration-200 touch-manipulation active:scale-[0.99] ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_20px_35px_rgba(56,189,248,0.25)]"
                      : "border-slate-200 hover:border-primary/50 hover:shadow-lg"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-900">{option.title}</p>
                    <span className="text-lg font-semibold text-primary">{option.price} kr</span>
                  </div>
                  <p className="text-sm text-slate-600">{option.subtitle}</p>
                  <div className="mt-auto text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {isSelected ? "Vald" : "Välj påse"}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      ),
      isComplete: () => Boolean(bagSize)
    }
  ];
  const baseSteps =
    washType === "mattvatt"
      ? [allBaseSteps[0], allBaseSteps[1], allBaseSteps[3]] // wash, rug-size, pickup
      : [allBaseSteps[0], allBaseSteps[2], allBaseSteps[3], allBaseSteps[4]]; // wash, scent, pickup, bag-size

  const postalCodeValue = normalizePostalCode(contactInfo.postalCode);
  const isPostalCodeFormatValid = POSTAL_CODE_REGEX.test(postalCodeValue);
  const isPostalCodeAllowed = isPostalCodeFormatValid && ALLOWED_POSTAL_CODES.has(postalCodeValue);
  const isServiceAreaValid = isPostalCodeAllowed && postalLookup.allowed;
  const postalInvalid =
    Boolean(contactInfo.postalCode) && (!isPostalCodeFormatValid || postalStatus === "invalid");

  const trimmedPhone = (contactInfo.phone || "").trim();
  const trimmedEmail = (contactInfo.email || "").trim();
  const hasPhone = Boolean(trimmedPhone);
  const hasEmail = Boolean(trimmedEmail);
  const isPhoneValid = !hasPhone || isValidSwedishPhone(trimmedPhone);
  const isEmailValid = !hasEmail || EMAIL_REGEX.test(trimmedEmail);
  const contactMethodValid =
    (hasPhone && isValidSwedishPhone(trimmedPhone)) || (hasEmail && EMAIL_REGEX.test(trimmedEmail));
  const phoneError = hasPhone && !isValidSwedishPhone(trimmedPhone)
    ? "Ange ett giltigt svenskt telefonnummer."
    : undefined;
  const emailError = hasEmail && !EMAIL_REGEX.test(trimmedEmail)
    ? "Ange en giltig e-postadress."
    : undefined;
  const contactMethodError = !hasPhone && !hasEmail
    ? "Ange telefon eller e-post."
    : undefined;

  const contactInputsValid =
    Boolean(contactInfo.firstName.trim()) &&
    Boolean(contactInfo.lastName.trim()) &&
    Boolean(contactInfo.address.trim()) &&
    Boolean(contactInfo.city.trim()) &&
    contactMethodValid &&
    isPhoneValid &&
    isEmailValid;

  const getMissingBookingFields = () => {
    const missing = [];
    if (showContactStep && !isServiceAreaValid) {
      missing.push("postnummer");
    }
    if (showContactStep && !contactInputsValid) {
      missing.push("kontaktuppgifter");
    }
    if (!washType) {
      missing.push("tvättyp");
    }
    if (washType !== "mattvatt") {
      if (!scent) missing.push("doftval");
      if (!bagSize) missing.push("påse");
    } else {
      const areaM2 = (Number(rugWidthCm) || 0) / 100 * (Number(rugHeightCm) || 0) / 100;
      if (areaM2 < RUG_MIN_M2) missing.push("mattstorlek (min 3 m²)");
    }
    if (!pickupDate || !pickupSlot) {
      missing.push("upphämtning");
    }
    if (!deliveryDate || !deliverySlot) {
      missing.push("leverans");
    }
    return missing;
  };

  const DateSelectionCard = ({
    title,
    dateValue,
    onDateChange,
    slotValue,
    onSlotChange,
    minDateOverride = null
  }) => {
    const [viewDate, setViewDate] = useState(() => new Date());
    const minDate = useMemo(() => {
      if (minDateOverride instanceof Date) {
        return minDateOverride;
      }
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      base.setDate(base.getDate() + 1);
      return base;
    }, [minDateOverride]);

    useEffect(() => {
      if (!dateValue) return;
      const [year, month, day] = dateValue.split("-").map(Number);
      const selected = new Date(year, month - 1, day);
      if (!Number.isNaN(selected.getTime())) {
        setViewDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
      }
    }, [dateValue]);

    const selectedDate = dateValue
      ? (() => {
          const [year, month, day] = dateValue.split("-").map(Number);
          return new Date(year, month - 1, day);
        })()
      : null;
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startWeekday = (startOfMonth.getDay() + 6) % 7;
    const monthLabel = viewDate.toLocaleString("sv-SE", { month: "long", year: "numeric" });
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const isPrevDisabled =
      viewDate.getFullYear() === minMonth.getFullYear() && viewDate.getMonth() === minMonth.getMonth();

    const toISO = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const isSameDay = (a, b) =>
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    return (
      <Card className="space-y-4 border-slate-100 bg-white/70 p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={isPrevDisabled}
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>
            <p className="text-sm font-semibold text-slate-700 capitalize">{monthLabel}</p>
            <button
              type="button"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-primary/40"
            >
              ›
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2 text-[11px] font-semibold text-slate-400">
            {["M", "T", "O", "T", "F", "L", "S"].map((label, index) => (
              <span key={`${label}-${index}`} className="text-center">
                {label}
              </span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: startWeekday }).map((_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isDisabled = dayDate < minDate;
              const isSelected = isSameDay(dayDate, selectedDate);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onDateChange(toISO(dayDate))}
                  className={`min-h-[40px] rounded-xl text-sm font-semibold transition touch-manipulation active:scale-95 ${
                    isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-slate-50 text-slate-700 hover:bg-primary/10"
                  } ${isDisabled ? "cursor-not-allowed opacity-40 hover:bg-slate-50" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {dateValue ? `Valt datum: ${dateValue}` : "Välj datum för att fortsätta."}
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-700">Tid på dagen</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TIME_SLOTS.map((slot) => {
            const isActive = slotValue === slot.id;
            const isDisabled = !dateValue;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={isDisabled}
                onClick={() => onSlotChange(slot.id)}
                className={`flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition duration-200 touch-manipulation active:scale-[0.98] ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:shadow-sm"
                } ${isDisabled ? "cursor-not-allowed opacity-50 hover:shadow-none" : ""}`}
              >
                <span>{slot.emoji}</span>
                <span>{slot.label}</span>
              </button>
            );
          })}
        </div>
      </Card>
    );
  };

  const cityCheckStep = {
    id: "city-check",
    title: "Kontrollera om vi finns i din stad",
    render: () => (
      <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm sm:p-6">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <MapPin className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg 0</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Kontrollera om vi finns i din stad</h3>
              <p className="mt-1 text-sm text-slate-600">
                Ange postnummer så kollar vi att vi levererar till din adress.
              </p>
            </div>
            <Input
              label="Postnummer"
              value={contactInfo.postalCode}
              onChange={handlePostalChange}
              error={postalError || (postalInvalid ? "Endast fem siffror godkänns." : undefined)}
              helpText={postalStatus === "loading" ? "Verifierar postnummer..." : undefined}
              inputClassName={
                postalStatus === "valid"
                  ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200"
                  : postalStatus === "invalid"
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : ""
              }
            />
          </div>
        </div>
      </Card>
    ),
    isComplete: () => isServiceAreaValid
  };

  const contactStep = {
    id: "contact",
    title: "Information",
    render: () => (
      <Card className="overflow-hidden border-slate-100 bg-gradient-to-br from-sky-50/80 to-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <UserCircle className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Steg 1</p>
            <h3 className="text-xl font-semibold text-slate-900">Information</h3>
            <p className="text-sm text-slate-600">
              Ange kontaktuppgifter som vi sparar i {user ? "din profil" : "Gästlistan"}.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            label="Förnamn"
            value={contactInfo.firstName}
            onChange={handleContactChange("firstName")}
            required
            inputClassName="rounded-xl transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
          />
          <Input
            label="Efternamn"
            value={contactInfo.lastName}
            onChange={handleContactChange("lastName")}
            required
            inputClassName="rounded-xl transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
          />
          <div className="relative space-y-1 md:col-span-2">
            <label htmlFor="address-input" className="block text-xs font-medium text-slate-700">
              Adress<span className="text-red-500"> *</span>
            </label>
            <input
              id="address-input"
              type="text"
              value={contactInfo.address}
              onChange={handleAddressChange}
              onFocus={() => setAddressDropdownOpen(true)}
              ref={addressInputRef}
              onBlur={() => {
                if (addressBlurTimerRef.current) {
                  clearTimeout(addressBlurTimerRef.current);
                }
                addressBlurTimerRef.current = setTimeout(() => {
                  setAddressDropdownOpen(false);
                }, 150);
              }}
              placeholder="Gata och nummer"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:shadow-md focus:shadow-primary/10"
              required
              autoComplete="street-address"
            />
            {addressDropdownOpen &&
              (addressLoading || addressSuggestions.length > 0 || addressError) && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {addressLoading ? (
                  <div className="px-4 py-3 text-xs font-semibold text-slate-500">
                    Söker adresser…
                  </div>
                ) : addressError && addressSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-xs font-semibold text-amber-700">
                    {addressError}
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto py-2">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleAddressSelect(suggestion)}
                        className="flex w-full flex-col gap-1 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50"
                      >
                        <span className="font-semibold text-slate-900">{suggestion.address}</span>
                        <span className="text-xs text-slate-500">{suggestion.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Skriv adress – förslag begränsade till Sverige. Vi levererar endast till våra postorter.
            </p>
            {addressError && (
              <p className="text-[11px] font-semibold text-amber-600" role="alert">
                {addressError}
              </p>
            )}
          </div>
          <Input
            label="Adressrad 2 (frivillig)"
            value={contactInfo.address2}
            onChange={handleContactChange("address2")}
            inputClassName="rounded-xl transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
          />
          <Input
            label="Stad"
            value={contactInfo.city}
            onChange={handleCityChange}
            required
            inputClassName="rounded-xl transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
          />
          <Input
            label="Telefonnummer"
            value={contactInfo.phone}
            onChange={handlePhoneChange}
            error={phoneError}
            placeholder="+46 70 000 00 00"
            inputClassName="rounded-xl transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
          />
          <Input
            label="E-post"
            value={contactInfo.email}
            readOnly={Boolean(user?.email)}
            onChange={handleEmailChange}
            helpText={Boolean(user?.email) ? "Låst från inloggningen" : undefined}
            error={emailError}
            inputClassName="rounded-xl transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10"
          />
        </div>
        {contactTouched && contactMethodError && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            {contactMethodError}
          </p>
        )}
        {contactError && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {contactError}
          </p>
        )}
      </Card>
    ),
    isComplete: () => contactInputsValid
  };

  const steps = isLoggedInFlow
    ? baseSteps
    : showContactStep
      ? [cityCheckStep, contactStep, ...baseSteps]
      : baseSteps;
  const totalSteps = steps.length;

  useEffect(() => {
    setActiveStepIndex((prev) => Math.min(prev, Math.max(0, totalSteps - 1)));
  }, [totalSteps]);
  const missingBookingFields = getMissingBookingFields();
  const isBookingComplete = missingBookingFields.length === 0;
  const bookingHelperText = "Fyll i alla steg för att kunna bekräfta.";
  const currentStep = steps[activeStepIndex];
  const progressStepCount = isLoggedInFlow ? 4 : showContactStep ? baseSteps.length + 1 : baseSteps.length;
  const progressStepIndex = isLoggedInFlow
    ? activeStepIndex
    : showContactStep
      ? Math.min(Math.max(activeStepIndex, 0), progressStepCount)
      : Math.min(activeStepIndex + 1, progressStepCount);
  const progressPercent = isLoggedInFlow
    ? Math.min(100, (progressStepIndex / Math.max(1, progressStepCount - 1)) * 100)
    : Math.min(100, (progressStepIndex / progressStepCount) * 100);
  const stepLabelNumber = isLoggedInFlow ? activeStepIndex : showContactStep ? activeStepIndex : activeStepIndex + 1;
  const stepLabelTotal = progressStepCount;

  useEffect(() => {
    if (isBookingComplete) {
      setBookingCompletionError("");
    }
  }, [isBookingComplete]);

  const handlePersistContact = async ({ skipStepAdvance = false } = {}) => {
    if (!contactInputsValid) {
      setContactError("Fyll i alla obligatoriska kontaktfält korrekt.");
      return;
    }
    setContactError("");
    if (showContactStep && !isServiceAreaValid) {
      setContactError("Postnummer måste vara giltigt för leverans.");
      return;
    }

    setContactSaving(true);
    let result;

    if (user) {
      const payload = {
        id: profile?.id || user?.id,
        address_line1: contactInfo.address,
        address_line2: contactInfo.address2,
        postal_code: postalCodeValue,
        city: contactInfo.city,
        phone: contactInfo.phone,
        full_name: `${contactInfo.firstName} ${contactInfo.lastName}`.trim()
      };
      result = await supabase.from("profiles").upsert(payload);
    } else {
      const payload = {
        email: contactInfo.email,
        full_name: `${contactInfo.firstName} ${contactInfo.lastName}`.trim(),
        phone: contactInfo.phone,
        address_line1: contactInfo.address,
        address_line2: contactInfo.address2,
        postal_code: postalCodeValue,
        city: contactInfo.city
      };
      result = await supabase.from("guest_leads").insert(payload);
    }

    const { error } = result;
    setContactSaving(false);

    if (error) {
      setContactError(error.message);
      return;
    }

    setContactSaved(true);
    setBookingSuccess("Tack! Din bokning är bekräftad och vi återkommer innan leverans.");
    if (skipStepAdvance) {
      setShowConfirmationModal(true);
      return;
    }
    setActiveStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const canProceed = currentStep.isComplete();

  const scrollToWizardTop = () => {
    requestAnimationFrame(() => {
      wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollSummaryIntoView = () => {
    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleNext = () => {
    setBookingSuccess("");
    setShowSummary(false);
    setBookingCompletionError("");
    if (!canProceed) return;
    if (activeStepIndex >= totalSteps - 1) {
      setSummaryOpen(true);
      setShowSummary(true);
      setShouldScrollSummary(true);
      scrollSummaryIntoView();
      return;
    }
    setStepDirection(1);
    setActiveStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    scrollToWizardTop();
  };


  const handleCancelSummary = () => {
    setShowSummary(false);
    setBookingSuccess("");
    setActiveStepIndex(0);
    scrollToWizardTop();
    setSummaryOpen(false);
  };

  const toggleSummaryAccordion = () => {
    setSummaryOpen((prev) => !prev);
    setShowSummary(false);
  };

  const handleConfirmBooking = async (useCreditOverride) => {
    if (!isBookingComplete) {
      setBookingCompletionError("Du måste slutföra alla steg innan du kan bekräfta bokningen.");
      setShowSummary(true);
      setSummaryOpen(true);
      scrollSummaryIntoView();
      return;
    }
    setBookingCompletionError("");
    setShowSummary(false);
    setSummaryOpen(false);
    setShowPaymentModal(false);

    const useCredit = useCreditOverride !== undefined ? useCreditOverride : useSubscriptionCredit;

    if (user && useCredit) {
      const consumeRes = await fetch("/api/subscription/consume-credit", { method: "POST" });
      if (!consumeRes.ok) {
        const errData = await consumeRes.json().catch(() => ({}));
        setBookingCompletionError(errData.message || "Kunde inte använda abonnemangskredit.");
        setShowSummary(true);
        setSummaryOpen(true);
        scrollSummaryIntoView();
        return;
      }
      try {
        onSubscriptionCreditUsed?.();
      } catch (_) {}
    }

    const detailsPayload = {
      wash: washType ? (WASH_OPTIONS.find((o) => o.id === washType)?.title ?? washType) : null,
      scent: washType !== "mattvatt" ? (scent ? (SCENT_OPTIONS.find((o) => o.id === scent)?.label ?? scent) : null) : null,
      pickup_date: pickupDate || null,
      pickup_slot: selectedPickup?.label ?? pickupSlot ?? null,
      delivery_date: deliveryDate || null,
      delivery_slot: selectedDelivery?.label ?? deliverySlot ?? null,
      contact: `${(contactInfo.firstName || "").trim()} ${(contactInfo.lastName || "").trim()}`.trim() || null,
      address: [contactInfo.address, contactInfo.address2, contactInfo.city].filter(Boolean).join(", ") || null,
      postal_code: normalizePostalCode(contactInfo.postalCode) || null,
      phone: (contactInfo.phone || "").trim() || null,
      email: (contactInfo.email || "").trim() || null,
      bag: washType !== "mattvatt" ? (selectedBag?.title ?? bagSize ?? null) : null,
      price: useCredit ? 0 : (price ?? null),
      estimated_delivery: deliveryEstimate || null,
      ...(washType === "mattvatt" && { rug_area_m2: rugAreaM2, rug_price: rugPrice })
    };

    let orderIdForHistory = null;

    if (user) {
      const pickupWindow = selectedPickup
        ? `${selectedPickup.start}-${selectedPickup.end}`
        : "";
      const deliveryWindow = selectedDelivery
        ? `${selectedDelivery.start}-${selectedDelivery.end}`
        : "";
      const deliveryEstimateAt =
        deliveryDate && selectedDelivery
          ? new Date(`${deliveryDate}T${selectedDelivery.end}:00`).toISOString()
          : pickupDate && selectedPickup
            ? addHours(new Date(`${pickupDate}T${selectedPickup.start}:00`), 48).toISOString()
            : null;
      const orderPrice = useCredit ? 0 : price;
      const estimatedWeightKg =
        washType === "mattvatt" ? 1 : orderPrice > 0 ? Math.max(1, Math.round(orderPrice / 60)) : 1;
      const customerName = `${(contactInfo.firstName || "").trim()} ${(contactInfo.lastName || "").trim()}`.trim() || "Kund";
      const customerEmail = (contactInfo.email || "").trim() || user?.email || "";

      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          guest_lead_id: null,
          customer_email: customerEmail || null,
          customer_name: customerName,
          customer_phone: (contactInfo.phone || "").trim() || null,
          address_line1: (contactInfo.address || "").trim() || "",
          address_line2: (contactInfo.address2 || "").trim() || null,
          postal_code: normalizePostalCode(contactInfo.postalCode) || "",
          city: (contactInfo.city || "").trim() || "",
          pickup_date: pickupDate,
          pickup_window: pickupWindow,
          delivery_window: deliveryWindow || null,
          bag_size: bagSize || null,
          wash_type: washType || null,
          estimated_weight_kg: estimatedWeightKg,
          price_per_kg: 60,
          estimated_total_price: orderPrice,
          delivery_estimate_at: deliveryEstimateAt,
          status: "MOTTAGEN",
          payment_status: "unpaid"
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("orders insert failed:", orderError);
      } else if (newOrder?.id) {
        orderIdForHistory = newOrder.id;
        // Skicka beställningsbekräftelse via e-post till inloggad användare
        fetch("/api/orders/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: newOrder.id })
        }).catch((err) => console.error("Kunde inte skicka bekräftelsemail:", err));
      }
    }

    try {
      if (!user) {
        await supabase.rpc("add_order_status_history", {
          p_order_id: orderIdForHistory,
          p_status: "booking_confirmed",
          p_details: detailsPayload
        });
      }
    } catch (err) {
      console.error("order_status_history insert failed:", err);
    }

    if (user) {
      setShowConfirmationModal(true);
      handlePersistContact({ skipStepAdvance: true }).catch(() => {});
    } else {
      await handlePersistContact({ skipStepAdvance: true });
    }
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmationError("");
    // Återställ bokningen så användaren kan göra en ny (steg 0, inga val – inte som “vald påse”-läge)
    setActiveStepIndex(0);
    setStepDirection(1);
    setWashType("");
    setScent("");
    setBagSize("");
    setRugWidthCm(200);
    setRugHeightCm(150);
    setPickupDate("");
    setPickupSlot(TIME_SLOTS[0].id);
    setDeliveryDate("");
    setDeliverySlot(TIME_SLOTS[0].id);
    setShowSummary(false);
    setSummaryOpen(false);
    setBookingSuccess("");
    setBookingCompletionError("");
    setShowPaymentModal(false);
    // Scroll till bokningssektionen så användaren hamnar i boka-tvatt efter stäng
    requestAnimationFrame(() => {
      const el = document.getElementById("boka-tvatt");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const validateConfirmationInput = () => {
    if (confirmationChannel === "email") {
      const cleanedEmail = (confirmationEmail || "").trim();
      setConfirmationEmail(cleanedEmail);
      if (!cleanedEmail || !EMAIL_REGEX.test(cleanedEmail)) {
        setConfirmationError("Ange en giltig e-postadress som vi kan nå dig på.");
        return false;
      }
    } else {
      const cleanedPhone = (confirmationPhone || "").trim();
      setConfirmationPhone(cleanedPhone);
      const digits = cleanedPhone.replace(/[^\d]/g, "");
      if (digits.length < 8) {
        setConfirmationError("Ange ett telefonnummer med minst åtta siffror.");
        return false;
      }
    }
    setConfirmationError("");
    return true;
  };

  const handleConfirmationSubmit = async () => {
    if (!validateConfirmationInput()) return;
    setConfirmationSending(true);
    try {
      if (confirmationChannel === "email") {
        const res = await fetch("/api/orders/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: (confirmationEmail || "").trim() })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setConfirmationError(data.message || "Kunde inte skicka bekräftelse. Försök igen.");
          return;
        }
      }
      // SMS: fixas senare när API är aktiverat
    } finally {
      setConfirmationSending(false);
    }
    setShowConfirmationModal(false);
    router.replace("/tack");
  };

  const handleBack = () => {
    setShowSummary(false);
    setSummaryOpen(false);
    setBookingSuccess("");
    setBookingCompletionError("");
    if (activeStepIndex === 0) return;
    setStepDirection(-1);
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
    scrollToWizardTop();
  };

  const summaryVisible = showSummary || summaryOpen;
  const showNavigationButtons = totalSteps > 0;
  const renderNavigationButtons = (className, style) => (
    <div className={`relative z-30 ${className}`} style={style}>
      <button
        type="button"
        onClick={handleBack}
        disabled={activeStepIndex === 0}
        className="w-full min-h-[44px] rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 active:bg-slate-100 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Tillbaka
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed}
        className={`w-full min-h-[44px] rounded-full px-5 py-3 text-sm font-semibold text-white transition touch-manipulation ${
          canProceed
            ? "bg-primary hover:bg-sky-500 active:bg-sky-600"
            : "bg-slate-200 text-slate-500 cursor-not-allowed"
        }`}
      >
        {currentStep.id === "bag-size" || (washType === "mattvatt" && currentStep.id === "pickup") ? "Boka" : "Nästa"}
      </button>
    </div>
  );
  const summaryContactInfo = contactSaved
    ? `${contactInfo.firstName || ""} ${contactInfo.lastName || ""}`.trim()
    : "Ej sparad";
  const summaryName = `${contactInfo.firstName || ""} ${contactInfo.lastName || ""}`.trim();
  const summaryAddress = [contactInfo.address, contactInfo.city].filter(Boolean).join(", ");
  const summaryContacts = [
    trimmedPhone ? { label: "Tel", value: trimmedPhone } : null,
    trimmedEmail ? { label: "E-post", value: trimmedEmail } : null
  ].filter(Boolean);
  const hasContactSummary = contactInputsValid || contactSaved;

  return (
    <section
      id="boka-tvatt"
      className="mx-auto w-full max-w-[min(100%,960px)] bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border border-slate-100"
    >
      {GOOGLE_PLACES_BROWSER_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_BROWSER_KEY}&libraries=places&language=sv&region=SE`}
          strategy="afterInteractive"
          onLoad={() => setGooglePlacesLoaded(true)}
          onError={() => {
            setGooglePlacesLoaded(false);
            setAddressError("Kunde inte ladda Google Places. Kontrollera att Maps JavaScript API + Places är aktiverat och att nyckeln är referrer-tillåten.");
          }}
        />
      )}
      <div
        ref={wizardTopRef}
        className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-600 sm:text-xs">
            Steg {stepLabelNumber} av {stepLabelTotal}
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem]">
            <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
              Skräddarsy din FreshDrop tvätt med oss här
            </span>
          </h2>
        </div>
        <div className="text-xs font-semibold text-slate-600 sm:text-sm">
          {useSubscriptionCredit ? (
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-700">
              Använder abonnemangskredit
            </span>
          ) : price > 0 ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
              Livepris: {price} kr
            </span>
          ) : (
            "Välj påse för pris"
          )}
        </div>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 sm:mt-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-primary shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-[width] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] px-0 sm:px-0 lg:px-0">
        <div className="relative z-10 flex min-w-0 flex-col gap-6 pb-[140px] sm:pb-12">
          <div className="pb-6 lg:relative lg:min-h-[720px]">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;
              return (
                <div
                  key={step.id}
                  className={`overflow-hidden transition-[opacity,transform,max-height] duration-300 ease-out px-4 sm:px-0 ${
                    isActive
                      ? "opacity-100 translate-y-0 max-h-[2000px] pointer-events-auto mb-10 lg:z-10 lg:max-h-none lg:opacity-100 lg:translate-y-0"
                      : "opacity-0 translate-y-4 max-h-0 pointer-events-none lg:absolute lg:inset-0 lg:z-0 lg:opacity-0 lg:translate-y-4"
                  } lg:absolute lg:inset-0 lg:overflow-visible`}
                >
                  {isActive && (
                    <div
                      key={activeStepIndex}
                      className={stepDirection === 1 ? "animate-step-enter-next" : "animate-step-enter-prev"}
                    >
                      {step.render()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {showNavigationButtons && (
            <>
              {renderNavigationButtons(
                "sticky bottom-0 z-20 mt-6 flex w-full flex-col gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 sm:mt-3 sm:flex-row sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none lg:hidden",
                {
                  paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))"
                }
              )}
              {renderNavigationButtons(
                "hidden w-full flex-col gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 sm:mt-3 sm:flex-row sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none lg:flex lg:static lg:mt-16 lg:mb-8 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none"
              )}
            </>
          )}
          {bookingSuccess && (
            <span role="status" className="sr-only">
              {bookingSuccess}
            </span>
          )}
        </div>

        <aside
          ref={summaryRef}
          className="min-w-0 space-y-4 lg:max-w-sm"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Sammanfattning</p>
            <h3 className="text-lg font-semibold text-slate-900">Ditt val</h3>
          </div>
          {summaryVisible ? (
            <Card className="space-y-3 rounded-3xl bg-white/80 p-4 shadow-lg sm:p-5">
              <button
                type="button"
                onClick={toggleSummaryAccordion}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 active:bg-slate-200 touch-manipulation"
              >
                Dölj sammanfattning
              </button>
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Tvätt:</span>{" "}
                  {washType ? WASH_OPTIONS.find((option) => option.id === washType)?.title : "Ej vald"}
                </p>
                {washType !== "mattvatt" && (
                  <p>
                    <span className="font-semibold text-slate-900">Doft:</span>{" "}
                    {scent ? SCENT_OPTIONS.find((option) => option.id === scent)?.label : "Ej vald"}
                  </p>
                )}
                <p>
                  <span className="font-semibold text-slate-900">Upphämtning:</span>{" "}
                  {pickupDate && selectedPickup ? `${pickupDate} · ${selectedPickup.label}` : "Ej valt"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Leverans:</span>{" "}
                  {deliveryDate && selectedDelivery ? `${deliveryDate} · ${selectedDelivery.label}` : "Ej valt"}
                </p>
                {showContactStep && (
                  <>
                    <p>
                      <span className="font-semibold text-slate-900">Kontakt:</span>{" "}
                      {hasContactSummary ? summaryName || "–" : "Ej sparad"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Adress:</span>{" "}
                      {hasContactSummary ? summaryAddress || "–" : "–"}
                    </p>
                    {summaryContacts.length > 0 ? (
                      summaryContacts.map((item) => (
                        <p key={item.label}>
                          <span className="font-semibold text-slate-900">{item.label}:</span>{" "}
                          {item.value}
                        </p>
                      ))
                    ) : (
                      <p>
                        <span className="font-semibold text-slate-900">Kontaktväg:</span> –
                      </p>
                    )}
                  </>
                )}
                {washType === "mattvatt" ? (
                  <p>
                    <span className="font-semibold text-slate-900">Mattstorlek:</span>{" "}
                    {rugWidthCm} × {rugHeightCm} cm = {rugAreaM2.toFixed(1)} m²
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold text-slate-900">Påse:</span>{" "}
                    {selectedBag ? selectedBag.title : "Ej vald"}
                  </p>
                )}
                <p>
                  <span className="font-semibold text-slate-900">Pris:</span>{" "}
                  {useSubscriptionCredit ? "Använder abonnemangskredit" : price > 0 ? `${price} kr` : "–"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Beräknad leverans</p>
                <p className="font-semibold text-slate-900">
                  {deliveryDate && selectedDelivery
                    ? `${deliveryDate} ${selectedDelivery.start}–${selectedDelivery.end}`
                    : deliveryEstimate || "Välj upphämtning och leveranstid"}
                </p>
              </div>
              {bookingCompletionError ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                  {bookingCompletionError}
                </p>
              ) : (
                !isBookingComplete && (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                    {bookingHelperText}
                  </p>
                )
              )}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setShowPaymentModal(true);
                    } else {
                      handleConfirmBooking(false);
                    }
                  }}
                  disabled={contactSaving || !isBookingComplete}
                  className="min-h-[48px] flex-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 touch-manipulation"
                >
                  {contactSaving ? "Sparar..." : "Bekräfta bokning och betala"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelSummary}
                  className="min-h-[48px] flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition active:scale-[0.98] hover:border-slate-400 touch-manipulation"
                >
                  Avbryt
                </button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-3xl border-slate-100 bg-gradient-to-b from-sky-50/50 to-white p-5 shadow-sm sm:p-6">
              <p className="text-sm leading-relaxed text-slate-600">
                När du fyllt i stegen kan du öppna sammanfattningen, trycka på &quot;Boka&quot; och få bekräftelsen direkt.
              </p>
              <button
                type="button"
                onClick={toggleSummaryAccordion}
                className="mt-4 w-full min-h-[44px] rounded-xl bg-sky-100 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-200 active:bg-sky-300 touch-manipulation"
              >
                Visa sammanfattning
              </button>
            </Card>
          )}
        </aside>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => !paymentModalProcessing && setShowPaymentModal(false)}
        overlayClassName="items-end sm:items-center px-4 py-6 sm:py-8"
        panelClassName="max-h-[85vh] overflow-y-auto rounded-t-[28px] p-5 sm:rounded-[32px] sm:p-6"
      >
        <div role="dialog" aria-modal="true" aria-labelledby="payment-modal-title" tabIndex={-1}>
          <h2 id="payment-modal-title" className="text-xl font-bold text-slate-900">
            Bekräfta köp
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Totalt: <span className="font-semibold text-slate-900">{price} kr</span>
          </p>
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Betalningssätt
            </p>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 transition has-[:checked]:border-primary has-[:checked]:bg-sky-50/50 touch-manipulation active:scale-[0.99]">
              <input
                type="radio"
                name="payment-method"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-medium text-slate-800">Kort</span>
            </label>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 transition has-[:checked]:border-primary has-[:checked]:bg-sky-50/50 touch-manipulation active:scale-[0.99]">
              <input
                type="radio"
                name="payment-method"
                value="swish"
                checked={paymentMethod === "swish"}
                onChange={() => setPaymentMethod("swish")}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-medium text-slate-800">Swish</span>
            </label>
            {(subscription?.credits_remaining ?? 0) > 0 && (
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 transition has-[:checked]:border-primary has-[:checked]:bg-sky-50/50 touch-manipulation active:scale-[0.99]">
                <input
                  type="radio"
                  name="payment-method"
                  value="subscription"
                  checked={paymentMethod === "subscription"}
                  onChange={() => setPaymentMethod("subscription")}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium text-slate-800">
                  Abonnemang (använd 1 tvätt – du har {(subscription?.credits_remaining ?? 0)} kvar)
                </span>
              </label>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={async () => {
                setPaymentModalProcessing(true);
                await handleConfirmBooking(paymentMethod === "subscription");
                setPaymentModalProcessing(false);
              }}
              disabled={paymentModalProcessing}
              className="min-h-[48px] flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition active:scale-[0.98] hover:bg-sky-500 disabled:opacity-60 touch-manipulation"
            >
              {paymentModalProcessing ? "Bearbetar..." : "Betala"}
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              disabled={paymentModalProcessing}
              className="min-h-[48px] flex-1 rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 transition active:scale-[0.98] hover:bg-slate-50 touch-manipulation"
            >
              Avbryt
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmationModal}
        onClose={closeConfirmationModal}
        overlayClassName="items-end sm:items-center px-4 py-6 sm:py-8"
        panelClassName="max-h-[85vh] overflow-y-auto rounded-t-[28px] p-5 sm:rounded-[32px] sm:p-6"
      >
        <div
          ref={confirmationModalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-confirmation-title"
          tabIndex={-1}
        >
          {user ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Betalt</p>
                  <h3
                    id="booking-confirmation-title"
                    className="text-2xl font-semibold text-slate-900"
                  >
                    Tack för din bokning hos oss
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Din beställning är mottagen och kommer att hanteras. Du kan följa upp den under Mina beställningar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeConfirmationModal}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 active:bg-slate-300 touch-manipulation"
                  aria-label="Stäng"
                >
                  ✕
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/bookings"
                  onClick={closeConfirmationModal}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-sky-500 touch-manipulation"
                >
                  Följ upp beställningen
                </Link>
                <button
                  type="button"
                  onClick={closeConfirmationModal}
                  className="min-h-[48px] w-full rounded-full border-2 border-slate-200 py-3 text-sm font-semibold text-slate-600 transition active:scale-[0.98] hover:bg-slate-50 touch-manipulation"
                >
                  Stäng
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Klart</p>
                  <h3
                    id="booking-confirmation-title"
                    className="text-2xl font-semibold text-slate-900"
                  >
                    Bokning bekräftad ✅
                  </h3>
                  <p className="text-sm text-slate-600">Tack! Du kan få bekräftelsen via SMS eller e-post.</p>
                </div>
                <button
                  type="button"
                  onClick={closeConfirmationModal}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 active:bg-slate-300 touch-manipulation"
                  aria-label="Stäng"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Tvätt:</span>{" "}
                  {washType ? WASH_OPTIONS.find((option) => option.id === washType)?.title : "Ej vald"}
                </p>
                {washType !== "mattvatt" && (
                  <p>
                    <span className="font-semibold text-slate-900">Doft:</span>{" "}
                    {scent ? SCENT_OPTIONS.find((option) => option.id === scent)?.label : "Ej vald"}
                  </p>
                )}
                <p>
                  <span className="font-semibold text-slate-900">Upphämtning:</span>{" "}
                  {pickupDate && selectedPickup ? `${pickupDate} · ${selectedPickup.label}` : "Ej valt"}
                </p>
                {pickupDate && selectedPickup && (
                  <p className="text-xs text-slate-500">
                    {selectedPickup.start}–{selectedPickup.end}
                  </p>
                )}
                <p>
                  <span className="font-semibold text-slate-900">Leverans:</span>{" "}
                  {deliveryDate && selectedDelivery ? `${deliveryDate} · ${selectedDelivery.label}` : "Ej valt"}
                </p>
                {deliveryDate && selectedDelivery && (
                  <p className="text-xs text-slate-500">
                    {selectedDelivery.start}–{selectedDelivery.end}
                  </p>
                )}
                {washType === "mattvatt" ? (
                  <p>
                    <span className="font-semibold text-slate-900">Mattstorlek:</span>{" "}
                    {rugAreaM2.toFixed(1)} m² · {price > 0 ? `${price} kr` : "Pris ej klart"}
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold text-slate-900">Påse:</span>{" "}
                    {selectedBag ? selectedBag.title : "Ej vald"} · {price > 0 ? `${price} kr` : "Pris ej klart"}
                  </p>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                  Hur vill du få bekräftelsen?
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      id: "email",
                      label: "E-post",
                      helper: "Får bekräftelsen i inkorgen"
                    },
                    {
                      id: "sms",
                      label: "SMS",
                      helper: "Får bekräftelsen som sms"
                    }
                  ].map((option) => {
                    const isActive = confirmationChannel === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                          isActive ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.helper}</p>
                        </div>
                        <input
                          type="radio"
                          name="confirmation-channel"
                          value={option.id}
                          checked={confirmationChannel === option.id}
                          onChange={() => {
                            setConfirmationChannel(option.id);
                            setConfirmationError("");
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                    );
                  })}
                </div>
                {confirmationChannel === "email" ? (
                  <Input
                    label="E-postadress"
                    id="confirmation-email"
                    type="email"
                    autoComplete="email"
                    value={confirmationEmail}
                    onChange={(event) => setConfirmationEmail(event.target.value)}
                    placeholder="mejladress@exempel.se"
                    required
                    inputClassName="text-base"
                  />
                ) : (
                  <Input
                    label="Mobilnummer"
                    id="confirmation-phone"
                    type="tel"
                    inputMode="tel"
                    value={confirmationPhone}
                    onChange={(event) => setConfirmationPhone(event.target.value)}
                    placeholder="+46 70 000 00 00"
                    required
                    inputClassName="text-base"
                  />
                )}
                {confirmationError && <p className="text-sm text-red-500">{confirmationError}</p>}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleConfirmationSubmit}
                  disabled={confirmationSending}
                  className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {confirmationSending ? "Skickar..." : "OK"}
                </button>
                <button
                  type="button"
                  onClick={closeConfirmationModal}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
                >
                  Avbryt
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </section>
  );
}
