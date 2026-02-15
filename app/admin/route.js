import { NextResponse } from "next/server";

/**
 * Failsafe:
 * Om något (t.ex. en felaktig redirect eller form) POST:ar till `/admin`
 * ska vi aldrig svara med 405. Returnera istället en 303 så att klienten
 * gör en GET till `/admin` och laddar admin-sidan normalt.
 */
export async function POST(request) {
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}

