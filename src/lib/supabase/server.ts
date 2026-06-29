import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

function getPublicSupabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function hasPublicSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getPublicSupabaseKey());
}

export function hasServiceSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      getPublicSupabaseKey() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getPublicSupabase() {
  if (!hasPublicSupabaseConfig()) return null;

  if (!publicClient) {
    publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getPublicSupabaseKey()!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return publicClient;
}

export function getServiceSupabase() {
  if (!hasServiceSupabaseConfig()) return null;

  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return serviceClient;
}
