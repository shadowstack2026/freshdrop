import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function updateProfile(formData) {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Du måste vara inloggad." };
  }

  const payload = {
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    address_line1: formData.get("address_line1"),
    address_line2: formData.get("address_line2"),
    postal_code: formData.get("postal_code"),
    city: formData.get("city")
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Kunde inte uppdatera profilen." };
  }

  return { success: true };
}

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container py-10 max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Konto
      </h1>
      <p className="text-xs text-slate-600 mb-6">
        Uppdatera dina kontaktuppgifter och adress som används vid bokningar.
      </p>

      <form action={updateProfile} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            E-post
          </label>
          <input
            name="email"
            defaultValue={profile?.email || user.email}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
            readOnly
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Namn
          </label>
          <input
            name="full_name"
            defaultValue={profile?.full_name || ""}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Telefon
          </label>
          <input
            name="phone"
            defaultValue={profile?.phone || ""}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Adress
            </label>
            <input
              name="address_line1"
              defaultValue={profile?.address_line1 || ""}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Adressrad 2
            </label>
            <input
              name="address_line2"
              defaultValue={profile?.address_line2 || ""}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Postnummer
            </label>
            <input
              name="postal_code"
              defaultValue={profile?.postal_code || ""}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Stad
            </label>
            <input
              name="city"
              defaultValue={profile?.city || ""}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Spara ändringar
        </button>
      </form>
    </div>
  );
}

