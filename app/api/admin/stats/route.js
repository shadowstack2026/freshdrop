import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

function getStartOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfToday() {
  const d = getStartOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

function getStartOfThisWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
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

  const startOfToday = getStartOfToday().toISOString();
  const endOfToday = getEndOfToday().toISOString();
  const startOfWeek = getStartOfThisWeek().toISOString();

  // Använd service role så att alla orders visas (inkl. gästbeställningar som RLS annars kan dölja)
  const adminSupabase = createSupabaseServiceRoleClient();
  const dataClient = adminSupabase || supabase;

  const [
    { count: totalUsers },
    { data: orders, error: ordersError },
    { data: subscriptions, error: subsError },
    { data: guestLeads, error: guestLeadsError }
  ] = await Promise.all([
    dataClient.from("profiles").select("*", { count: "exact", head: true }),
    dataClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }),
    dataClient.from("subscriptions").select("plan"),
    dataClient.from("guest_leads").select("*").order("created_at", { ascending: false })
  ]);

  if (ordersError) {
    return NextResponse.json(
      { message: "Kunde inte hämta beställningar." },
      { status: 500 }
    );
  }

  const ordersList = orders || [];
  const guestLeadsList = guestLeads || [];
  if (guestLeadsError) {
    // guest_leads kan vara blockerad av RLS om dataClient är anon; ignorerar
  }

  const guestLeadsWithOrders = guestLeadsList.map((gl) => ({
    ...gl,
    orders: ordersList.filter((o) => o.guest_lead_id === gl.id)
  }));
  const ordersToday = ordersList.filter(
    (o) => o.created_at >= startOfToday && o.created_at < endOfToday
  ).length;
  const ordersThisWeek = ordersList.filter((o) => o.created_at >= startOfWeek).length;
  const revenuePaid = ordersList
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.estimated_total_price || 0), 0);

  const subscriptionsByPlan = { free: 0, standard_biweekly: 0, premium_weekly: 0 };
  (subscriptions || []).forEach((s) => {
    if (s.plan in subscriptionsByPlan) subscriptionsByPlan[s.plan]++;
    else subscriptionsByPlan[s.plan] = 1;
  });

  const ordersByStatus = {};
  ordersList.forEach((o) => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
  });

  return NextResponse.json({
    ordersToday,
    ordersThisWeek,
    totalUsers: totalUsers ?? 0,
    totalOrders: ordersList.length,
    revenuePaid: Math.round(revenuePaid),
    subscriptionsByPlan,
    ordersByStatus,
    recentOrders: ordersList.slice(0, 20),
    allOrders: ordersList,
    guestLeads: guestLeadsWithOrders
  });
}
