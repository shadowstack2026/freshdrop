import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE(req, { params }) {
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

  const adminSupabase = createSupabaseServiceRoleClient();
  if (!adminSupabase) {
    return NextResponse.json(
      { message: "Server konfiguration saknas." },
      { status: 500 }
    );
  }

  const { error } = await adminSupabase
    .from("orders")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Kunde inte ta bort beställningen." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: true });
}
