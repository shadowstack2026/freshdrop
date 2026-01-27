import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/account", "/orders", "/admin"];

export async function middleware(req) {
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

  const pathname = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!session && isProtected) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/orders/:path*", "/admin/:path*"]
};

