"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

const PRICE_PER_KG = 60;

const PICKUP_WINDOWS = [
  "08:00-10:00",
  "10:00-12:00",
  "16:00-18:00",
  "18:00-20:00"
];

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export default function NewOrderPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    pickup_date: "",
    pickup_window: PICKUP_WINDOWS[0],
    estimated_weight_kg: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const estimatedPrice = useMemo(() => {
    const weight = parseFloat(form.estimated_weight_kg);
    if (isNaN(weight) || weight <= 0) return 0;
    return Math.round(weight * PRICE_PER_KG);
  }, [form.estimated_weight_kg]);

  const deliveryEstimate = useMemo(() => {
    if (!form.pickup_date || !form.pickup_window) return null;
    const [start] = form.pickup_window.split("-");
    const [hours, minutes] = start.split(":").map((v) => parseInt(v, 10));
    const pickup = new Date(form.pickup_date + "T00:00:00");
    pickup.setHours(hours, minutes, 0, 0);
    const delivery = addHours(pickup, 48);
    return delivery.toLocaleString("sv-SE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [form.pickup_date, form.pickup_window]);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value
      }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.name || !form.address_line1 || !form.postal_code || !form.city || !form.pickup_date) {
      setError("Fyll i alla obligatoriska fält.");
      return;
    }

    const weight = parseFloat(form.estimated_weight_kg);
    if (isNaN(weight) || weight <= 0) {
      setError("Uppskattad vikt måste vara ett positivt tal.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          estimated_weight_kg: weight
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Kunde inte skapa beställning.");
      }

      const { checkoutUrl } = await res.json();
      router.push(checkoutUrl);
    } catch (err) {
      setError(err.message || "Något gick fel. Försök igen.");
      setLoading(false);
    }
  }

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">Boka tvätt</h1>
      <p className="text-xs text-slate-600 mb-6">
        Fyll i dina uppgifter för att boka upphämtning. Du kan boka som gäst
        genom att ange din e-postadress. Betalning sker via säker kassa.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <Input
                id="email"
                label="E-post"
                type="email"
                required
                value={form.email}
                onChange={handleChange("email")}
              />
              <Input
                id="name"
                label="Namn"
                required
                value={form.name}
                onChange={handleChange("name")}
              />
              <Input
                id="phone"
                label="Telefon"
                required
                value={form.phone}
                onChange={handleChange("phone")}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  id="address_line1"
                  label="Adress"
                  required
                  value={form.address_line1}
                  onChange={handleChange("address_line1")}
                />
                <Input
                  id="address_line2"
                  label="Adressrad 2 (valfritt)"
                  value={form.address_line2}
                  onChange={handleChange("address_line2")}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  id="postal_code"
                  label="Postnummer"
                  required
                  value={form.postal_code}
                  onChange={handleChange("postal_code")}
                />
                <Input
                  id="city"
                  label="Stad"
                  required
                  value={form.city}
                  onChange={handleChange("city")}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Uppskattad vikt (kg)
                    <span className="text-red-500"> *</span>
                  </label>
                  <input
                    id="estimated_weight_kg"
                    type="number"
                    min="0.5"
                    step="0.1"
                    required
                    value={form.estimated_weight_kg}
                    onChange={handleChange("estimated_weight_kg")}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-[11px] text-slate-500">
                    Pris: {PRICE_PER_KG} kr/kg. Du betalar efter faktisk vikt.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  id="pickup_date"
                  label="Upphämtningsdatum"
                  type="date"
                  required
                  value={form.pickup_date}
                  onChange={handleChange("pickup_date")}
                />
                <div className="space-y-1">
                  <label
                    htmlFor="pickup_window"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Tidsfönster
                    <span className="text-red-500"> *</span>
                  </label>
                  <select
                    id="pickup_window"
                    required
                    value={form.pickup_window}
                    onChange={handleChange("pickup_window")}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {PICKUP_WINDOWS.map((window) => (
                      <option key={window} value={window}>
                        {window}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-sky-400"
            >
              {loading ? "Skapar beställning..." : "Gå till betalning"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Sammanfattning
            </h2>
            <dl className="space-y-1 text-xs text-slate-700">
              <div className="flex justify-between">
                <dt>Uppskattad vikt</dt>
                <dd>{form.estimated_weight_kg || "–"} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt>Pris per kg</dt>
                <dd>{PRICE_PER_KG} kr</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Beräknat pris</dt>
                <dd>{estimatedPrice ? `${estimatedPrice} kr` : "–"}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Leverans
            </h2>
            <p className="text-xs text-slate-600">
              Leverans sker alltid inom 48 timmar från vald upphämtningstid.
            </p>
            {deliveryEstimate && (
              <p className="mt-2 text-xs font-medium text-slate-800">
                Beräknad leverans senast: {deliveryEstimate}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

