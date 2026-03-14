import { createClient } from "@supabase/supabase-js";

// Este cliente usa la SERVICE_ROLE_KEY — solo para uso server-side
// Nunca exponerlo al browser
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
