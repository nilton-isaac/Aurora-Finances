import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export function getSupabaseServerAuthClient() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    return null;
  }

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function getSupabaseServerClient() {
  const url = getSupabaseUrl();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return null;
  }

  return createClient<Database>(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
