import { createServerClient } from "@supabase/ssr";
import {
  createAdminClient,
  createContextClient,
  verifyCredentials
} from "@supabase/server/core";
import type { AuthModeWithKey, SupabaseContext, SupabaseEnv } from "@supabase/server";
import { cookies } from "next/headers";

function resolveSupabaseServerEnv(): Partial<SupabaseEnv> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const jwksUrl = process.env.SUPABASE_JWKS_URL;

  return {
    url: url || undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
    jwks: jwksUrl ? new URL(jwksUrl) : null
  };
}

export async function createSupabaseServerContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" }
): Promise<{ data: SupabaseContext; error: null } | { data: null; error: Error }> {
  const env = resolveSupabaseServerEnv();
  const publishableKey = env.publishableKeys?.default;

  if (!env.url || !publishableKey) {
    return {
      data: null,
      error: new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY")
    };
  }

  const cookieStore = await cookies();
  const ssrClient = createServerClient(env.url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            cookieStore.set(name, value, cookieOptions)
          );
        } catch {
          // Server Components cannot set cookies; middleware refreshes sessions.
        }
      }
    }
  });

  const {
    data: { session }
  } = await ssrClient.auth.getSession();

  const { data: auth, error } = await verifyCredentials(
    { token: session?.access_token ?? null, apikey: null },
    { auth: options.auth ?? "user", env }
  );

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      supabase: createContextClient({ auth: { token: auth.token }, env }),
      supabaseAdmin: createAdminClient({ env }),
      userClaims: auth.userClaims,
      jwtClaims: auth.jwtClaims,
      authMode: auth.authMode,
      authKeyName: auth.keyName ?? undefined
    },
    error: null
  };
}
