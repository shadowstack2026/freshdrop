import { NextResponse } from "next/server";

/**
 * Debug endpoint: visar om GOOGLE_PLACES_API_KEY_SERVER är satt (ingen känslig data).
 * Ta bort eller skydda i produktion om du inte vill exponera detta.
 */
export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY_SERVER;
  return NextResponse.json({
    hasServerKey: Boolean(key),
    prefix: (key || "").slice(0, 6)
  });
}
