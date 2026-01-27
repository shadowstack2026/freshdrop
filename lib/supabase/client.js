import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Vi loggar inte i produktion, men detta hjälper lokalt om något saknas.
  // eslint-disable-next-line no-console
  console.warn("Supabase-klient saknar URL eller ANON KEY. Kontrollera miljövariablerna.");
}

export const supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey);

