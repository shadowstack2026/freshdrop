"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Save, Edit, XCircle, CheckCircle2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: ""
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchUserAndProfile() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error fetching user or no user found:", userError);
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") { // PGRST116 means no rows found
        console.error("Error fetching profile:", profileError);
        setError("Kunde inte ladda profildata.");
      } else if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address_line1: profileData.address_line1 || "",
          address_line2: profileData.address_line2 || "",
          postal_code: profileData.postal_code || "",
          city: profileData.city || ""
        });
      }
      setLoading(false);
    }
    fetchUserAndProfile();
  }, [supabase, router]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !authUser) {
      console.error("Error fetching user:", userError);
      setError("Du måste vara inloggad för att spara profilen.");
      setLoading(false);
      return;
    }

    const payload = {
      full_name: profile.full_name,
      phone: profile.phone,
      address_line1: profile.address_line1,
      address_line2: profile.address_line2,
      postal_code: profile.postal_code,
      city: profile.city
    };

    console.log("payload", payload);

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", authUser.id)
      .select()
      .single();

    if (updateError) {
      console.log("save error", updateError);
      setError(updateError.message || "Kunde inte uppdatera profilen.");
    } else {
      setProfile({
        full_name: updatedProfile?.full_name || "",
        phone: updatedProfile?.phone || "",
        address_line1: updatedProfile?.address_line1 || "",
        address_line2: updatedProfile?.address_line2 || "",
        postal_code: updatedProfile?.postal_code || "",
        city: updatedProfile?.city || ""
      });
      setSuccessMessage("Profilen uppdaterades framgångsrikt!");
      setIsEditing(false);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center">
        <p className="text-white text-lg">Laddar profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark text-slate-900 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-sky-300 mb-10 drop-shadow-lg">Min Profil</h1>

        <Card className="p-8 space-y-6 shadow-2xl border-none bg-white/90 backdrop-blur-sm rounded-3xl">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
              <XCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <Input
              id="fullName"
              label="Namn"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              id="email"
              label="E-post"
              type="email"
              value={user?.email || ""}
              disabled
              className="opacity-70"
            />
            <Input
              id="phone"
              label="Telefonnummer"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              id="address"
              label="Adress"
              value={profile.address_line1}
              onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              id="addressLine2"
              label="Adressrad 2"
              value={profile.address_line2 || ""}
              onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
              disabled={!isEditing}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="postalCode"
                label="Postnummer"
                value={profile.postal_code}
                onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                id="city"
                label="Ort"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                      setSuccessMessage("");
                      // Optionally refetch original profile data if changes were made locally but not saved
                      // This would require storing the original profile state or re-fetching.
                    }}
                    className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-primary text-white hover:bg-sky-500">
                    {loading ? "Sparar..." : <><Save className="h-4 w-4" /> Spara</>}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-white hover:bg-sky-500 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" /> Redigera
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
