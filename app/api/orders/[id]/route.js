import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(_req, { params }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  );

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ message: "Order hittades inte." }, { status: 404 });
  }

  return NextResponse.json(order);
}

