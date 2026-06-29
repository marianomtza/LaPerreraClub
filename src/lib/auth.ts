import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { siteCopy } from "@/content/site-copy";
import { getSiteUrl, isAdminEmailAllowed, isProduction } from "@/lib/env";
import { getPublicSupabase } from "@/lib/supabase/server";

const ACCESS_COOKIE = "lpc-admin-access";
const REFRESH_COOKIE = "lpc-admin-refresh";

export type AdminUser = {
  id: string;
  email: string;
};

export async function requestAdminMagicLink(email: string) {
  const genericResponse = {
    ok: true,
    message: siteCopy.admin.genericMagicLink
  };

  if (!isAdminEmailAllowed(email)) {
    return genericResponse;
  }

  const supabase = getPublicSupabase();
  if (!supabase) {
    console.error("Admin magic link requested but Supabase public auth is not configured.");
    return { ok: false, message: siteCopy.admin.unavailable };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`
    }
  });

  if (error) {
    console.error("Admin magic link request failed.", error.message);
    return { ok: false, message: siteCopy.admin.unavailable };
  }

  return genericResponse;
}

export async function setAdminSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };

  cookieStore.set(ACCESS_COOKIE, accessToken, options);
  cookieStore.set(REFRESH_COOKIE, refreshToken, options);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user.email) return null;

  const email = data.user.email.toLowerCase();
  if (!isAdminEmailAllowed(email)) return null;

  return {
    id: data.user.id,
    email
  };
}

export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  return user;
}
