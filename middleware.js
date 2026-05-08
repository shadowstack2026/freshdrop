import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

const protectedPaths = ["/hem", "/profil", "/dashboard", "/account", "/orders", "/admin", "/abonnemang", "/bookings"];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Stripe webhooks MUST receive 2xx (no redirects), otherwise Stripe marks delivery as failed.
  if (pathname === "/api/stripe/webhook") {
    return NextResponse.next();
  }

  // Never run auth middleware for Next internals or static assets.
  // This avoids broken CSS/JS loads in dev/prod when middleware is applied too broadly.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Failsafe: om något POST:ar /admin (t.ex. 307-redirect från en form),
  // tvinga om till GET så vi inte får 405 på /admin-sidan.
  if (pathname === "/admin" && req.method === "POST") {
    return NextResponse.redirect(new URL("/admin", req.url), 303);
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isProtected = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Redirect logged-in users from login/signup to /hem
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/hem", req.url));
  }

  // If user is not logged in and tries to access a protected path, redirect to login
  if (!session && isProtected) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin access control: only users with role=admin may access /admin
  if (pathname.startsWith("/admin")) {
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/hem", req.url));
    }
  }

  // Inloggade användare ska aldrig komma in på landningssidan (/) – omdirigera till /hem
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/hem", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
