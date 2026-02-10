"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const supabase = createClientComponentClient();

    async function handleCallback() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setStatus("error");
        router.replace("/login");
        return;
      }

      if (session) {
        router.replace("/hem");
        router.refresh();
        return;
      }

      // OAuth redirect may not have been processed yet; retry once after a short delay
      await new Promise((r) => setTimeout(r, 400));
      const {
        data: { session: retrySession },
      } = await supabase.auth.getSession();

      if (retrySession) {
        router.replace("/hem");
        router.refresh();
      } else {
        router.replace("/login");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center py-12 px-4">
      <div className="text-center text-slate-700">
        {status === "loading" && <p className="text-lg">Loggar in...</p>}
        {status === "error" && <p className="text-lg">Omdirigerar till inloggning...</p>}
      </div>
    </div>
  );
}
