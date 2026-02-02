import { NextResponse } from "next/server";

const POSTAL_CODE_REGEX = /^\d{5}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const postalCode = searchParams.get("postalCode")?.trim() ?? "";

  if (!query || query.length < 2 || !POSTAL_CODE_REGEX.test(postalCode)) {
    return NextResponse.json([]);
  }

  const encoded = encodeURIComponent(`${query} ${postalCode} Sverige`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=se&q=${encoded}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "sv-SE",
        "User-Agent": "FreshDrop/1.0 (kontakt@freshdrop.se)"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const results = await response.json();
    const mapped = (results || []).map((item) => ({
      id: String(item.place_id),
      address: item.display_name?.split(",")[0]?.trim() || item.name || "",
      city: item.address?.city || item.address?.town || item.address?.village || ""
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json([]);
  }
}
