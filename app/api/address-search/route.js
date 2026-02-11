import { NextResponse } from "next/server";
import { ALLOWED_POSTAL_CODES, normalizePostalCode } from "@/lib/allowed-postal-codes";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * GET /api/address-search?query=xxx  → Google Places Autocomplete (Sverige)
 * GET /api/address-search?placeId=xxx → Place Details + koll mot era postnummer
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const placeId = searchParams.get("placeId")?.trim() ?? "";

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Adresssökning är inte konfigurerad (saknar API-nyckel)." },
      { status: 503 }
    );
  }

  // Place details: hämta adress + postnummer och kolla mot era postorter
  if (placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${GOOGLE_API_KEY}&fields=address_components&language=sv`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.status !== "OK" || !data.result?.address_components?.length) {
        return NextResponse.json({ allowed: false, address: "", city: "", postal_code: "" });
      }
      const components = data.result.address_components;
      let streetNumber = "";
      let route = "";
      let postalCode = "";
      let city = "";
      for (const c of components) {
        if (c.types.includes("street_number")) streetNumber = c.long_name || "";
        if (c.types.includes("route")) route = c.long_name || "";
        if (c.types.includes("postal_code")) postalCode = normalizePostalCode(c.long_name || "");
        if (c.types.includes("postal_town")) city = c.long_name || city;
        if (c.types.includes("locality") && !city) city = c.long_name || "";
      }
      const address = [route, streetNumber].filter(Boolean).join(" ").trim() || "";
      const allowed = ALLOWED_POSTAL_CODES.has(postalCode);
      return NextResponse.json({
        address,
        city,
        postal_code: postalCode,
        allowed
      });
    } catch (e) {
      return NextResponse.json(
        { error: "Kunde inte hämta adressdetaljer." },
        { status: 500 }
      );
    }
  }

  // Autocomplete: bara query krävs
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const encoded = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encoded}&key=${GOOGLE_API_KEY}&components=country:se&language=sv`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data.status === "ZERO_RESULTS" || !Array.isArray(data.predictions)) {
      return NextResponse.json([]);
    }
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json([]);
    }

    const results = (data.predictions || []).map((p) => ({
      id: p.place_id,
      place_id: p.place_id,
      address: p.structured_formatting?.main_text || p.description || "",
      city: p.structured_formatting?.secondary_text || ""
    }));

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json([]);
  }
}
