import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export function getSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    return null;
  }

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
