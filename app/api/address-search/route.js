import { NextResponse } from "next/server";
import { ALLOWED_POSTAL_CODES, normalizePostalCode } from "@/lib/allowed-postal-codes";

/*
 * REQUIRED:
 * - GOOGLE_PLACES_API_KEY_SERVER must be set in .env.local
 * - Must NOT have Application restriction = Websites
 * - Restart dev server after changes
 */

const POSTAL_CODE_REGEX = /^\d{5}$/;
const POSTAL_LOCATION_RADIUS_METERS = 20000;
const isDev = process.env.NODE_ENV !== "production";

/**
 * Läser och validerar server-nyckeln. Servern får ENDAST använda denna nyckel (ingen fallback till web key).
 * @returns {{ key: string } | { key: null, error: string }}
 */
function getServerPlacesKey() {
  const raw = process.env.GOOGLE_PLACES_API_KEY_SERVER;
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return {
      key: null,
      error: "Missing GOOGLE_PLACES_API_KEY_SERVER",
      hint: "Add it to .env.local and restart dev server"
    };
  }
  const key = raw.trim();
  if (!key.startsWith("AIza")) {
    return {
      key: null,
      error:
        "GOOGLE_PLACES_API_KEY_SERVER har ogiltigt format (ska börja med AIza). Kontrollera värdet i .env.local.",
      hint: "Add it to .env.local and restart dev server"
    };
  }
  return { key, error: null, hint: null };
}

function logDev(endpoint, googleStatus) {
  if (isDev && endpoint != null) {
    console.log("[address-search]", { endpoint, google_status: googleStatus });
  }
}

const geocodePostalCode = async (postalCode, apiKey) => {
  const normalized = normalizePostalCode(postalCode);
  if (!POSTAL_CODE_REGEX.test(normalized)) return null;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${normalized} Sweden`)}&key=${apiKey}&region=se&language=sv`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  const status = data?.status ?? "UNKNOWN";
  logDev("textsearch", status);
  if (status !== "OK") {
    return null;
  }
  const location = data?.results?.[0]?.geometry?.location;
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") return null;
  return { lat: location.lat, lng: location.lng };
};

/**
 * GET /api/address-search?query=xxx  → Google Places Autocomplete (Sverige)
 * GET /api/address-search?placeId=xxx → Place Details + koll mot era postnummer
 */
export async function GET(request) {
  console.log("ENV CHECK - HAS_SERVER_KEY:", Boolean(process.env.GOOGLE_PLACES_API_KEY_SERVER));
  console.log("ENV CHECK - KEY_PREFIX:", (process.env.GOOGLE_PLACES_API_KEY_SERVER || "").slice(0, 6));

  const { key, error, hint } = getServerPlacesKey();

  if (isDev) {
    console.log("HAS_SERVER_KEY", Boolean(key));
    console.log("KEY_PREFIX", key ? key.slice(0, 6) : "");
  }

  if (error) {
    if (process.env.GOOGLE_PLACES_API_KEY_SERVER === undefined) {
      console.warn("SERVER KEY NOT FOUND – using fallback is disabled");
    }
    return NextResponse.json(
      hint ? { error, hint } : { error },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const placeId = searchParams.get("placeId")?.trim() ?? "";
  const postalCode = normalizePostalCode(searchParams.get("postalCode")?.trim() ?? "");

  // Place details
  if (placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${key}&fields=address_components&language=sv`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      const status = data?.status ?? "UNKNOWN";
      logDev("details", status);

      if (data.status === "REQUEST_DENIED" && (data.error_message || "").toLowerCase().includes("referer")) {
        return NextResponse.json(
          {
            error:
              "Du använder en referer-begränsad nyckel på servern. Skapa en server key (Application restrictions: None) och sätt GOOGLE_PLACES_API_KEY_SERVER i .env.local."
          },
          { status: 502 }
        );
      }

      if (data.status !== "OK" || !data.result?.address_components?.length) {
        return NextResponse.json({ allowed: false, address: "", city: "", postal_code: "" });
      }
      const components = data.result.address_components;
      let streetNumber = "";
      let route = "";
      let postalCodeFromComponents = "";
      let city = "";
      for (const c of components) {
        if (c.types.includes("street_number")) streetNumber = c.long_name || "";
        if (c.types.includes("route")) route = c.long_name || "";
        if (c.types.includes("postal_code")) postalCodeFromComponents = normalizePostalCode(c.long_name || "");
        if (c.types.includes("postal_town")) city = c.long_name || city;
        if (c.types.includes("locality") && !city) city = c.long_name || "";
      }
      const address = [route, streetNumber].filter(Boolean).join(" ").trim() || "";
      const allowed = ALLOWED_POSTAL_CODES.has(postalCodeFromComponents);
      return NextResponse.json({
        address,
        city,
        postal_code: postalCodeFromComponents,
        allowed
      });
    } catch (e) {
      return NextResponse.json(
        { error: "Kunde inte hämta adressdetaljer." },
        { status: 500 }
      );
    }
  }

  // Autocomplete
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const encoded = encodeURIComponent(query);
  let locationBias = "";
  if (POSTAL_CODE_REGEX.test(postalCode)) {
    try {
      const loc = await geocodePostalCode(postalCode, key);
      if (loc) {
        locationBias = `&location=${encodeURIComponent(`${loc.lat},${loc.lng}`)}&radius=${POSTAL_LOCATION_RADIUS_METERS}`;
      }
    } catch (e) {
      // ignore
    }
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encoded}&key=${key}&components=country:se&language=sv&types=address${locationBias}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const status = data?.status ?? "UNKNOWN";
    logDev("autocomplete", status);

    if (data?.status === "REQUEST_DENIED" && (data.error_message || "").toLowerCase().includes("referer")) {
      return NextResponse.json(
        {
          error:
            "Du använder en referer-begränsad nyckel på servern. Skapa en server key (Application restrictions: None) och sätt GOOGLE_PLACES_API_KEY_SERVER i .env.local."
        },
        { status: 502 }
      );
    }

    if (data?.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        {
          error: "Google Places Autocomplete misslyckades.",
          google_status: data.status,
          google_message: data.error_message || ""
        },
        { status: 502 }
      );
    }

    if (data.status === "ZERO_RESULTS" || !Array.isArray(data.predictions)) {
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
