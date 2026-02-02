"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";

const TIME_SLOTS = [
  { id: "morning", label: "Morgon", emoji: "🌅", start: "08:00", end: "11:00" },
  { id: "foren", label: "Förmiddag", emoji: "☀️", start: "11:00", end: "14:00" },
  { id: "afternoon", label: "Eftermiddag", emoji: "🌤", start: "14:00", end: "17:00" },
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
    price: 199,
    subtitle: "Perfekt för vardagsplagg och småtvätt."
  },
  {
    id: "medium",
    title: "Mellan påse",
    price: 299,
    subtitle: "Lagom för helgens blandade tvätt."
  },
  {
    id: "large",
    title: "Stor påse",
    price: 399,
    subtitle: "För större tvätthögar eller familjen."
  }
];

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_CODE_REGEX = /^\d{5}$/;

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
  if (!POSTAL_CODE_REGEX.test(postalCode)) return "";
  const response = await fetch(`https://api.postnummer.nu/postnummer/${postalCode}.json`, {
    signal,
    headers: { Accept: "application/json" }
  });
  if (!response.ok) return "";
  const data = await response.json();
  return data?.postnummer?.ort || "";
};

const searchAddresses = async (query, postalCode, { signal } = {}) => {
  if (!query || query.trim().length < 2 || !POSTAL_CODE_REGEX.test(postalCode)) return [];
  const encoded = encodeURIComponent(`${query} ${postalCode} Sverige`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=se&q=${encoded}`;
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json", "Accept-Language": "sv-SE" }
  });
  if (!response.ok) return [];
  const results = await response.json();
  return (results || []).map((item) => ({
    id: item.place_id,
    address: item.display_name?.split(",")[0]?.trim() || item.name || "",
    city: item.address?.city || item.address?.town || item.address?.village || ""
  }));
};

export default function BookingFlow({
  showContactStep = false,
  profile = null,
  user = null
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const profileHasBasics =
    Boolean(profile?.first_name) &&
    Boolean(profile?.last_name) &&
    Boolean(profile?.address) &&
    Boolean(profile?.postal_code);

  const [activeStepIndex, setActiveStepIndex] = useState(showContactStep ? 0 : 0);
  const [washType, setWashType] = useState(WASH_OPTIONS[0].id);
  const [scent, setScent] = useState(SCENT_OPTIONS[0].id);
  const [bagSize, setBagSize] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupSlot, setPickupSlot] = useState(TIME_SLOTS[0].id);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState(TIME_SLOTS[0].id);
  const [contactSaved, setContactSaved] = useState(showContactStep && profileHasBasics);
  const [contactError, setContactError] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
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
  const addressRequestIdRef = useRef(0);
  const addressBlurTimerRef = useRef(null);
  const postalLookupIdRef = useRef(0);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingCompletionError, setBookingCompletionError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shouldScrollSummary, setShouldScrollSummary] = useState(false);
  const [postalStatus, setPostalStatus] = useState("idle");
  const postalTimerRef = useRef(null);
  const summaryRef = useRef(null);
  const wizardTopRef = useRef(null);
  const confirmationRef = useRef(null);
  const confirmationModalRef = useRef(null);
  const [confirmationChannel, setConfirmationChannel] = useState("email");
  const [confirmationEmail, setConfirmationEmail] = useState(user?.email || contactInfo.email);
  const [confirmationPhone, setConfirmationPhone] = useState(contactInfo.phone);
  const [confirmationError, setConfirmationError] = useState("");
  const [confirmationSending, setConfirmationSending] = useState(false);

  useEffect(() => {
    if (showContactStep && profileHasBasics) {
      setContactInfo({
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        address: profile?.address_line1 || "",
        address2: profile?.address_line2 || "",
        postalCode: profile?.postal_code || "",
        city: profile?.city || "",
        phone: profile?.phone || "",
        email: user?.email || ""
      });
      setContactSaved(true);
    setActiveStepIndex(2);
    }
  }, [showContactStep, profileHasBasics]);

  useEffect(() => {
    setContactInfo((prev) => ({
      firstName: profile?.first_name || prev.firstName,
      lastName: profile?.last_name || prev.lastName,
      address: profile?.address_line1 || prev.address,
      address2: profile?.address_line2 || prev.address2,
      postalCode: profile?.postal_code || prev.postalCode,
      city: profile?.city || prev.city,
      phone: profile?.phone || prev.phone,
      email: user?.email || prev.email
    }));
  }, [profile, user]);

  useEffect(() => {
    setConfirmationEmail(contactInfo.email || user?.email || "");
    setConfirmationPhone(contactInfo.phone || "");
  }, [contactInfo.email, contactInfo.phone, user?.email]);

  useEffect(() => {
    const query = contactInfo.address.trim();
    const postalCode = contactInfo.postalCode.trim();
    if (!query || query.length < 2 || !POSTAL_CODE_REGEX.test(postalCode)) {
      setAddressSuggestions([]);
      setAddressLoading(false);
      return;
    }

    const requestId = addressRequestIdRef.current + 1;
    addressRequestIdRef.current = requestId;
    setAddressLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const results = await searchAddresses(query, postalCode, { signal: controller.signal });
        if (addressRequestIdRef.current !== requestId) return;
        setAddressSuggestions(results);
      } catch (error) {
        if (error?.name === "AbortError") return;
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

  useEffect(() => {
    return () => {
      if (postalTimerRef.current) {
        clearTimeout(postalTimerRef.current);
      }
      if (addressBlurTimerRef.current) {
        clearTimeout(addressBlurTimerRef.current);
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
    if (bookingSuccess && confirmationRef.current) {
      confirmationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [bookingSuccess]);

  useEffect(() => {
    if (showConfirmationModal && confirmationModalRef.current) {
      confirmationModalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showConfirmationModal]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    if (showConfirmationModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showConfirmationModal]);

  const selectedBag = BAG_OPTIONS.find((option) => option.id === bagSize);
  const price = useMemo(() => selectedBag?.price ?? 0, [selectedBag]);

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

  const handleAddressSelect = (suggestion) => {
    setContactSaved(false);
    setContactError("");
    setContactInfo((prev) => ({
      ...prev,
      address: suggestion.address,
      city: suggestion.city ? suggestion.city : prev.city
    }));
    if (suggestion.city) {
      setCityAutoFilled(true);
    }
    setAddressDropdownOpen(false);
    setAddressSuggestions([]);
  };

  const handlePostalChange = (event) => {
    handleContactChange("postalCode")(event);
    const value = event.target.value;
    const trimmed = value.trim();
    if (postalTimerRef.current) {
      clearTimeout(postalTimerRef.current);
      postalTimerRef.current = null;
    }
    if (!trimmed) {
      setPostalStatus("idle");
      return;
    }
    if (POSTAL_CODE_REGEX.test(trimmed)) {
      setPostalStatus("valid");
      setContactError("");
      const requestId = postalLookupIdRef.current + 1;
      postalLookupIdRef.current = requestId;
      fetchCityFromPostal(trimmed)
        .then((autoCity) => {
          if (!autoCity) return;
          if (postalLookupIdRef.current !== requestId) return;
          if (cityAutoFilled || !contactInfo.city.trim()) {
            setContactInfo((prev) => ({ ...prev, city: autoCity }));
            setCityAutoFilled(true);
          }
        })
        .catch(() => {});
      postalTimerRef.current = setTimeout(() => {
        if (activeStepIndex === 0) {
          setActiveStepIndex((prev) => Math.min(prev + 1, stepCount - 1));
        }
        setPostalStatus("idle");
        postalTimerRef.current = null;
      }, 1000);
      return;
    }
    setPostalStatus("invalid");
  };

  const stepCount = showContactStep ? 6 : 4;
  const baseStepOffset = showContactStep ? 2 : 1;
  const getBaseStepNumber = (index) => index + baseStepOffset;
  const baseSteps = [
    {
      id: "wash",
      title: "Välj typ av tvätt",
      render: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Steg {getBaseStepNumber(0)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">Välj typ av tvätt</h3>
              <p className="text-sm text-slate-600">Grovtvätt eller vardagstvätt – välj en stil som matchar dina plagg.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">Endast ett val åt gången</span>
          </div>
          <div className="grid gap-4 grid-cols-1">
            {WASH_OPTIONS.map((option) => {
              const isSelected = washType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setWashType(option.id);
                  }}
                  className={`group relative flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/80 p-4 text-left transition duration-300 sm:p-5 ${
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
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600">Detta ingår</p>
                      <ul className="mt-2 space-y-1 text-sm font-medium text-emerald-800">
                        {option.included.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
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
                  <div className="mt-auto flex gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-[11px]">
                    <div className="flex-1 rounded-2xl bg-emerald-100/80 p-3 text-emerald-700">✓ Rätt plagg</div>
                    <div className="flex-1 rounded-2xl bg-red-100/80 p-3 text-red-600">✕ Fel plagg</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
      isComplete: () => Boolean(washType)
    },
    {
      id: "scent",
      title: "Välj doft",
      render: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Steg {getBaseStepNumber(1)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">Välj doft</h3>
              <p className="text-sm text-slate-600">Färgade kort för en tillfredsställande känsla.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">Doften appliceras på hela tvätten</span>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
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
                  <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.4em] text-slate-500 sm:text-[11px]">
                    {isNeutral ? "Doftfri" : "Doften appliceras på hela tvätten"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ),
      isComplete: () => Boolean(scent)
    },
    {
      id: "pickup",
      title: "Upphämtning & leverans",
      render: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Steg {getBaseStepNumber(2)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">Upphämtning & leverans</h3>
              <p className="text-sm text-slate-600">
                Välj datum och tider för upphämtning och leverans i samma steg.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
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
            />
          </div>
          <p className="text-sm text-slate-600">
            Leverans sker till din dörr – rent, vikt och klart inom 48 timmar efter upphämtning.
          </p>
        </div>
      ),
      isComplete: () => Boolean(pickupDate && pickupSlot && deliveryDate && deliverySlot)
    },
    {
      id: "bag-size",
      title: "Välj påse",
      render: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Steg {getBaseStepNumber(3)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">Välj påse</h3>
              <p className="text-sm text-slate-600">
                Välj den påse som passar din tvättmängd bäst.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {BAG_OPTIONS.map((option) => {
              const isSelected = bagSize === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBagSize(option.id)}
                  className={`group flex h-full flex-col items-start gap-3 rounded-[28px] border bg-white/90 p-4 text-left transition duration-200 ${
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
        </div>
      ),
      isComplete: () => Boolean(bagSize)
    }
  ];

  const postalCodeValue = contactInfo.postalCode.trim();
  const isPostalCodeValid = POSTAL_CODE_REGEX.test(postalCodeValue);
  const postalInvalid = Boolean(contactInfo.postalCode) && !isPostalCodeValid;

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
    if (showContactStep && !isPostalCodeValid) {
      missing.push("postnummer");
    }
    if (showContactStep && !contactInputsValid) {
      missing.push("kontaktuppgifter");
    }
    if (!washType) {
      missing.push("tvättyp");
    }
    if (!scent) {
      missing.push("doftval");
    }
    if (!pickupDate || !pickupSlot) {
      missing.push("upphämtning");
    }
    if (!deliveryDate || !deliverySlot) {
      missing.push("leverans");
    }
    if (!bagSize) {
      missing.push("påse");
    }
    return missing;
  };

  const DateSelectionCard = ({ title, dateValue, onDateChange, slotValue, onSlotChange }) => {
    const [viewDate, setViewDate] = useState(() => new Date());
    const minDate = useMemo(() => {
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      base.setDate(base.getDate() + 1);
      return base;
    }, []);

    useEffect(() => {
      if (!dateValue) return;
      const selected = new Date(dateValue);
      if (!Number.isNaN(selected.getTime())) {
        setViewDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
      }
    }, [dateValue]);

    const selectedDate = dateValue ? new Date(dateValue) : null;
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startWeekday = (startOfMonth.getDay() + 6) % 7;
    const monthLabel = viewDate.toLocaleString("sv-SE", { month: "long", year: "numeric" });
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const isPrevDisabled =
      viewDate.getFullYear() === minMonth.getFullYear() && viewDate.getMonth() === minMonth.getMonth();

    const toISO = (date) => date.toISOString().split("T")[0];
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
            {["M", "T", "O", "T", "F", "L", "S"].map((label) => (
              <span key={label} className="text-center">
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
                  className={`h-9 rounded-xl text-sm font-semibold transition ${
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
                className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition duration-200 ${
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
    title: "Kontroll om vi finns i din stad",
    render: () => (
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Steg 0</p>
          <h3 className="text-xl font-semibold text-slate-900">Kontroll om vi finns i din stad</h3>
          <p className="text-sm text-slate-600">
            Ange postnummer så kollar vi att vi levererar till din adress.
          </p>
        </div>
        <Input
          label="Postnummer"
          value={contactInfo.postalCode}
          onChange={handlePostalChange}
          error={postalInvalid ? "Endast fem siffror godkänns" : undefined}
          helpText="Postnummer används för zonkontroll och sparas automatiskt."
          inputClassName={
            postalStatus === "valid"
              ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200"
              : postalStatus === "invalid"
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : ""
          }
        />
      </div>
    ),
    isComplete: () => isPostalCodeValid
  };

  const contactStep = {
    id: "contact",
    title: "Information",
    render: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Steg 1</p>
            <h3 className="text-xl font-semibold text-slate-900">Information</h3>
            <p className="text-sm text-slate-600">
              Ange kontaktuppgifter som vi sparar i {user ? "din profil" : "Gästlistan"}.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Förnamn"
            value={contactInfo.firstName}
            onChange={handleContactChange("firstName")}
            required
          />
          <Input
            label="Efternamn"
            value={contactInfo.lastName}
            onChange={handleContactChange("lastName")}
            required
          />
          <div className="relative space-y-1">
            <label htmlFor="address-input" className="block text-xs font-medium text-slate-700">
              Adress<span className="text-red-500"> *</span>
            </label>
            <input
              id="address-input"
              type="text"
              value={contactInfo.address}
              onChange={handleAddressChange}
              onFocus={() => setAddressDropdownOpen(true)}
              onBlur={() => {
                if (addressBlurTimerRef.current) {
                  clearTimeout(addressBlurTimerRef.current);
                }
                addressBlurTimerRef.current = setTimeout(() => {
                  setAddressDropdownOpen(false);
                }, 150);
              }}
              placeholder="Gata och nummer"
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              required
              autoComplete="street-address"
            />
            {addressDropdownOpen && (addressLoading || addressSuggestions.length > 0) && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {addressLoading ? (
                  <div className="px-4 py-3 text-xs font-semibold text-slate-500">
                    Söker adresser…
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto py-2">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleAddressSelect(suggestion)}
                        className="flex w-full flex-col gap-1 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-900">{suggestion.address}</span>
                        <span className="text-xs text-slate-500">{suggestion.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!POSTAL_CODE_REGEX.test(contactInfo.postalCode.trim()) && (
              <p className="text-[11px] text-slate-500">
                Fyll i postnummer i steg 0 för att få adressförslag.
              </p>
            )}
          </div>
          <Input
            label="Adressrad 2 (frivillig)"
            value={contactInfo.address2}
            onChange={handleContactChange("address2")}
          />
          <Input
            label="Stad"
            value={contactInfo.city}
            onChange={handleCityChange}
            required
          />
          <Input
            label="Telefonnummer"
            value={contactInfo.phone}
            onChange={handlePhoneChange}
            error={phoneError}
            placeholder="+46 70 000 00 00"
          />
          <Input
            label="E-post"
            value={contactInfo.email}
            readOnly={Boolean(user?.email)}
            onChange={handleEmailChange}
            helpText={Boolean(user?.email) ? "Låst från inloggningen" : undefined}
            error={emailError}
          />
        </div>
        {contactTouched && contactMethodError && (
          <p className="text-xs font-semibold text-amber-600">
            {contactMethodError}
          </p>
        )}
        {contactError && <p className="text-xs text-red-500">{contactError}</p>}
      </div>
    ),
    isComplete: () => contactInputsValid
  };

  const steps = showContactStep ? [cityCheckStep, contactStep, ...baseSteps] : baseSteps;
  const totalSteps = steps.length;
  const missingBookingFields = getMissingBookingFields();
  const isBookingComplete = missingBookingFields.length === 0;
  const bookingHelperText = "Fyll i alla steg för att kunna bekräfta.";
  const currentStep = steps[activeStepIndex];
  const progressStepCount = showContactStep ? baseSteps.length + 1 : baseSteps.length;
  const progressStepIndex = showContactStep
    ? Math.min(Math.max(activeStepIndex, 0), progressStepCount)
    : Math.min(activeStepIndex + 1, progressStepCount);
  const progressPercent = Math.min(100, (progressStepIndex / progressStepCount) * 100);
  const stepLabelNumber = showContactStep ? activeStepIndex : activeStepIndex + 1;
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
    if (showContactStep && !isPostalCodeValid) {
      setContactError("Postnummer måste vara fem siffror.");
      return;
    }

    setContactSaving(true);
    let result;

    if (user) {
      const payload = {
        id: profile?.id || user?.id,
        first_name: contactInfo.firstName,
        last_name: contactInfo.lastName,
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

  const handleConfirmBooking = async () => {
    if (!isBookingComplete) {
      setBookingCompletionError("Du måste slutföra alla steg innan du kan bekräfta bokningen.");
      setShowSummary(true);
      setSummaryOpen(true);
      scrollSummaryIntoView();
      return;
    }
    setBookingCompletionError("");
    scrollSummaryIntoView();
    setShowSummary(false);
    setSummaryOpen(false);
    await handlePersistContact({ skipStepAdvance: true });
    scrollToWizardTop();
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmationError("");
    router.replace("/dashboard");
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
      // Placeholder for future API call – keep modal handling consistent for now.
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setConfirmationSending(false);
    }
    setShowConfirmationModal(false);
    router.replace("/dashboard");
  };

  const handleBack = () => {
    setShowSummary(false);
    setSummaryOpen(false);
    setBookingSuccess("");
    setBookingCompletionError("");
    if (activeStepIndex === 0) return;
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
    scrollToWizardTop();
  };

  const summaryVisible = showSummary || summaryOpen;
  const showNavigationButtons = activeStepIndex > 0;
  const renderNavigationButtons = (className, style) => (
    <div className={`relative z-30 ${className}`} style={style}>
      <button
        type="button"
        onClick={handleBack}
        disabled={activeStepIndex === 0}
        className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Tillbaka
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed}
        className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
          canProceed
            ? "bg-primary hover:bg-sky-500"
            : "bg-slate-200 text-slate-500 cursor-not-allowed"
        }`}
      >
        {currentStep.id === "bag-size" ? "Boka" : "Nästa"}
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
      <div
        ref={wizardTopRef}
        className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 sm:text-xs">
            Steg {stepLabelNumber} av {stepLabelTotal}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-[2.25rem]">
            Bygg din FreshDrop-upplevelse
          </h2>
        </div>
        <div className="text-xs font-semibold text-slate-600 sm:text-sm">
          {price > 0 ? `Livepris: ${price} kr` : "Välj påse för pris"}
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-200 sm:mt-5">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] px-0 sm:px-0 lg:px-0">
        <div className="relative z-10 flex flex-col gap-6 pb-[140px] sm:pb-12">
          <div className="pb-6 lg:relative lg:min-h-[520px]">
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
                  {step.render()}
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
                "hidden w-full flex-col gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 sm:mt-3 sm:flex-row sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none lg:flex lg:static lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none"
              )}
            </>
          )}
          {bookingSuccess && (
            <p
              ref={confirmationRef}
              className="mt-2 flex scroll-mt-24 items-center gap-2 text-sm font-semibold text-emerald-600 animate-pulse"
            >
              <CheckCircle2 className="h-4 w-4" />
              {bookingSuccess}
            </p>
          )}
        </div>

        <aside
          ref={summaryRef}
          className="space-y-4 lg:max-w-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Sammanfattning</p>
              <h3 className="text-lg font-semibold text-slate-900">Ditt val</h3>
            </div>
            <button
              type="button"
              onClick={toggleSummaryAccordion}
              className="flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              <span>{summaryVisible ? "Dölj sammanfattning" : "Visa sammanfattning"}</span>
              <ChevronDown
                className={`h-4 w-4 transition ${summaryVisible ? "rotate-180" : "rotate-0"}`}
                aria-hidden
              />
            </button>
          </div>
          {summaryVisible ? (
            <Card className="space-y-3 rounded-3xl bg-white/80 p-4 shadow-lg sm:p-5">
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Wash:</span>{" "}
                  {WASH_OPTIONS.find((option) => option.id === washType)?.title}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Doft:</span>{" "}
                  {SCENT_OPTIONS.find((option) => option.id === scent)?.label}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Upphämtning:</span>{" "}
                  {pickupDate ? pickupDate : "Välj datum"} {selectedPickup ? `· ${selectedPickup.label}` : ""}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Leverans:</span>{" "}
                  {deliveryDate ? deliveryDate : "Välj datum"} {selectedDelivery ? `· ${selectedDelivery.label}` : ""}
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
                <p>
                  <span className="font-semibold text-slate-900">Påse:</span>{" "}
                  {selectedBag ? selectedBag.title : "Ej vald"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Pris:</span>{" "}
                  {price > 0 ? `${price} kr` : "–"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Beräknad leverans</p>
                <p className="font-semibold text-slate-900">
                  {deliveryEstimate || "Välj upphämtningstid för exakt datum"}
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
                  onClick={handleConfirmBooking}
                  disabled={contactSaving || !isBookingComplete}
                  className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {contactSaving ? "Sparar..." : "Bekräfta bokning"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelSummary}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
                >
                  Avbryt
                </button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-3xl bg-white/80 p-4 shadow-lg sm:p-5">
              <p className="text-sm text-slate-600">
                När du fyllt i stegen kan du öppna sammanfattningen, trycka på ”Boka” och få bekräftelsen direkt.
              </p>
            </Card>
          )}
        </aside>
      </div>
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm sm:items-center">
          <div
            ref={confirmationModalRef}
            className="w-full max-w-lg transform rounded-[32px] bg-white p-6 shadow-2xl shadow-slate-900/40 transition duration-300 ease-out max-h-[85vh] overflow-y-auto scroll-mt-24"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Klart</p>
                <h3 className="text-2xl font-semibold text-slate-900">Bokning bekräftad ✅</h3>
                <p className="text-sm text-slate-600">Tack! Du kan få bekräftelsen via SMS eller e-post.</p>
              </div>
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Stäng"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Tvätt:</span>{" "}
                {WASH_OPTIONS.find((option) => option.id === washType)?.title}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Doft:</span>{" "}
                {SCENT_OPTIONS.find((option) => option.id === scent)?.label}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Upphämtning:</span>{" "}
                {pickupDate ? pickupDate : "Välj datum"} {selectedPickup ? `· ${selectedPickup.label}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {selectedPickup ? `${selectedPickup.start}–${selectedPickup.end}` : ""}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Leverans:</span>{" "}
                {deliveryDate ? deliveryDate : "Välj datum"} {selectedDelivery ? `· ${selectedDelivery.label}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {selectedDelivery ? `${selectedDelivery.start}–${selectedDelivery.end}` : ""}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Påse:</span>{" "}
                {selectedBag ? selectedBag.title : "Ej vald"} · {price > 0 ? `${price} kr` : "Pris ej klart"}
              </p>
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
          </div>
        </div>
      )}
    </section>
  );
}
