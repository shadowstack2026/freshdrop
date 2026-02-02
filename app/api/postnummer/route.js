import { NextResponse } from "next/server";

const POSTAL_CODE_REGEX = /^\d{5}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim() ?? "";

  if (!POSTAL_CODE_REGEX.test(code)) {
    return NextResponse.json({ error: "Invalid postal code." }, { status: 400 });
  }

  const headers = {
    Accept: "application/json",
    "Accept-Language": "sv-SE",
    "User-Agent": "FreshDrop/1.0 (kontakt@freshdrop.se)"
  };

  const urls = [
    `https://api.postnummer.nu/postnummer/${code}.json`,
    `https://api.postnummer.nu/postnummer/${code}`,
    `http://api.postnummer.nu/postnummer/${code}.json`,
    `http://api.postnummer.nu/postnummer/${code}`
  ];

  try {
    for (const url of urls) {
      const response = await fetch(url, { headers, cache: "no-store" });
      if (!response.ok) {
        continue;
      }
      const data = await response.json();
      const city = data?.postnummer?.ort || "";
      const municipality = data?.postnummer?.kommun || "";
      if (city) {
        return NextResponse.json({ city, municipality });
      }
    }
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  }
}
