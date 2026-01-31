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

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function calculatePrice(weight) {
  if (!weight || weight <= 0) return 0;
  if (weight < 5) {
    return Math.round(weight * 69);
  }
  if (weight <= 10) {
    const ratio = (weight - 5) / 5;
    return Math.round(200 + ratio * 200);
  }
  return Math.round(400 + (weight - 10) * 69);
}

const POSTAL_CODE_REGEX = /^\d{5}$/;

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
  const [weight, setWeight] = useState("");
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
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shouldScrollSummary, setShouldScrollSummary] = useState(false);
  const [postalStatus, setPostalStatus] = useState("idle");
  const postalTimerRef = useRef(null);
  const summaryRef = useRef(null);
  const wizardTopRef = useRef(null);
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
    return () => {
      if (postalTimerRef.current) {
        clearTimeout(postalTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shouldScrollSummary && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setShouldScrollSummary(false);
    }
  }, [shouldScrollSummary]);

  const parsedWeight = parseFloat(weight);
  const price = useMemo(() => calculatePrice(parsedWeight), [parsedWeight]);
  const weightIsValid = Number.isFinite(parsedWeight) && parsedWeight > 0;

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

  const handleWeightChange = (value) => {
    const floatValue = parseFloat(value);
    if (!value) {
      setWeight("");
    } else if (!Number.isNaN(floatValue)) {
      setWeight(value);
    }
  };

  const handleContactChange = (field) => (event) => {
    setContactSaved(false);
    setContactError("");
    setContactInfo((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
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
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Upphämtning</p>
              <label className="text-sm font-semibold text-slate-700">
                Datum
                <input
                  type="date"
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                  }}
                />
              </label>
              <p className="text-sm font-semibold text-slate-700">Tid på dagen</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TIME_SLOTS.map((slot) => {
                  const isActive = pickupSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setPickupSlot(slot.id);
                      }}
                      className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition duration-200 ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <span>{slot.emoji}</span>
                      <span>{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Leverans</p>
              <label className="text-sm font-semibold text-slate-700">
                Datum
                <input
                  type="date"
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                  }}
                />
              </label>
              <p className="text-sm font-semibold text-slate-700">Tid på dagen</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TIME_SLOTS.map((slot) => {
                  const isActive = deliverySlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setDeliverySlot(slot.id);
                      }}
                      className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition duration-200 ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <span>{slot.emoji}</span>
                      <span>{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Leverans sker till din dörr – rent, vikt och klart inom 48 timmar efter upphämtning.
          </p>
        </div>
      ),
      isComplete: () => Boolean(pickupDate && pickupSlot && deliveryDate && deliverySlot)
    },
    {
      id: "weight",
      title: "Uppskattad vikt",
      render: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Steg {getBaseStepNumber(3)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">Uppskattad vikt</h3>
              <p className="text-sm text-slate-600">
                Berätta hur mycket tvätt du planerar att lämna så räknar vi ett pris åt dig.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              id="weight-step"
              label="Vikt (kg)"
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(event) => handleWeightChange(event.target.value)}
              placeholder="Ex: 5.0"
            />
            <p className="text-xs text-slate-500">
              Pris:{" "}
              <span className="font-semibold text-slate-900">
                {price > 0 ? `${price} kr` : "Välj vikt"}
              </span>
            </p>
          </div>
        </div>
      ),
      isComplete: () => weightIsValid
    }
  ];

  const postalCodeValue = contactInfo.postalCode.trim();
  const isPostalCodeValid = POSTAL_CODE_REGEX.test(postalCodeValue);
  const postalInvalid = Boolean(contactInfo.postalCode) && !isPostalCodeValid;

  const contactInputsValid =
    Boolean(contactInfo.firstName.trim()) &&
    Boolean(contactInfo.lastName.trim()) &&
    Boolean(contactInfo.address.trim()) &&
    Boolean(contactInfo.city.trim());

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
          <Input
            label="Adress"
            value={contactInfo.address}
            onChange={handleContactChange("address")}
            required
          />
          <Input
            label="Adressrad 2 (frivillig)"
            value={contactInfo.address2}
            onChange={handleContactChange("address2")}
          />
          <Input
            label="Stad"
            value={contactInfo.city}
            onChange={handleContactChange("city")}
          />
          <Input
            label="Telefonnummer"
            value={contactInfo.phone}
            onChange={handleContactChange("phone")}
          />
          <Input
            label="E-post"
            value={contactInfo.email}
            readOnly={Boolean(user?.email)}
            onChange={handleContactChange("email")}
            helpText={Boolean(user?.email) ? "Låst från inloggningen" : undefined}
          />
        </div>
        {contactError && <p className="text-xs text-red-500">{contactError}</p>}
      </div>
    ),
    isComplete: () => contactInputsValid
  };

  const steps = showContactStep ? [cityCheckStep, contactStep, ...baseSteps] : baseSteps;
  const totalSteps = steps.length;
  const currentStep = steps[activeStepIndex];
  const progressStepCount = showContactStep ? baseSteps.length + 1 : baseSteps.length;
  const progressStepIndex = showContactStep
    ? Math.min(Math.max(activeStepIndex, 0), progressStepCount)
    : Math.min(activeStepIndex + 1, progressStepCount);
  const progressPercent = Math.min(100, (progressStepIndex / progressStepCount) * 100);
  const stepLabelNumber = showContactStep ? activeStepIndex : activeStepIndex + 1;
  const stepLabelTotal = progressStepCount;

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

  const handleNext = () => {
    setBookingSuccess("");
    setShowSummary(false);
    if (!canProceed) return;
    if (activeStepIndex >= totalSteps - 1) {
      setSummaryOpen(true);
      setShowSummary(true);
      setShouldScrollSummary(true);
      scrollToWizardTop();
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
    setShowSummary(false);
    setSummaryOpen(false);
    await handlePersistContact({ skipStepAdvance: true });
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmationError("");
    router.replace("/dashboard");
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateConfirmationInput = () => {
    if (confirmationChannel === "email") {
      const cleanedEmail = (confirmationEmail || "").trim();
      setConfirmationEmail(cleanedEmail);
      if (!cleanedEmail || !emailRegex.test(cleanedEmail)) {
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
    if (activeStepIndex === 0) return;
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
    scrollToWizardTop();
  };

  const summaryVisible = showSummary || summaryOpen;
  const showNavigationButtons = activeStepIndex > 0;
  const renderNavigationButtons = (className, style) => (
    <div className={className} style={style}>
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
        {currentStep.id === "weight" ? "Boka" : "Nästa"}
      </button>
    </div>
  );
  const summaryContactInfo = contactSaved
    ? `${contactInfo.firstName || ""} ${contactInfo.lastName || ""}`.trim()
    : "Ej sparad";

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
          {price > 0 ? `Livepris: ${price} kr` : "Ange vikt för pris"}
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-200 sm:mt-5">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] px-0 sm:px-0 lg:px-0">
        <div className="flex flex-col gap-6 pb-[140px] sm:pb-12">
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
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-600 animate-pulse">
              <CheckCircle2 className="h-4 w-4" />
              {bookingSuccess}
            </p>
          )}
        </div>

        <aside
          ref={summaryRef}
          className="space-y-4 lg:max-w-sm"
        >
          <div className="flex items-center justify-between">
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
                      {summaryContactInfo || "Ej sparad"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Tel:</span>{" "}
                      {contactInfo.phone || "–"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Postnummer:</span>{" "}
                      {contactInfo.postalCode || "–"}
                    </p>
                  </>
                )}
                <p>
                  <span className="font-semibold text-slate-900">Vikt:</span>{" "}
                  {weight ? `${weight} kg` : "Ej angiven"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Beräknad leverans</p>
                <p className="font-semibold text-slate-900">
                  {deliveryEstimate || "Välj upphämtningstid för exakt datum"}
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={contactSaving}
                  className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg transform rounded-[32px] bg-white p-6 shadow-2xl shadow-slate-900/40 transition duration-300 ease-out">
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
                <span className="font-semibold text-slate-900">Vikt:</span>{" "}
                {weight ? `${weight} kg` : "Ej angiven"} · {price > 0 ? `${price} kr` : "Pris ej klart"}
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
