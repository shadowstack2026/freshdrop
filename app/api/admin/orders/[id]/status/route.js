import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const ALLOWED_STATUSES = [
  "MOTTAGEN",
  "BOKAD",
  "HÄMTAD",
  "TVÄTTAS",
  "PÅ_VÄG",
  "LEVERERAD",
  "AVBRUTEN"
];

export async function POST(req, { params }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Inte inloggad." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ message: "Inte behörig." }, { status: 403 });
  }

  const formData = await req.formData();
  const status = formData.get("status");

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ message: "Ogiltig status." }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { message: "Kunde inte uppdatera status." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/admin", req.url));
}

