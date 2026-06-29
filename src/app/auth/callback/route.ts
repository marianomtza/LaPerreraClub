import { NextResponse } from "next/server";
import { getSiteUrl, isAdminEmailAllowed } from "@/lib/env";
import { setAdminSessionCookies } from "@/lib/auth";
import { getPublicSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = getPublicSupabase();

  if (!code || !supabase) {
    return NextResponse.redirect(`${getSiteUrl()}/admin?error=auth`);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return NextResponse.redirect(`${getSiteUrl()}/admin?error=auth`);
  }

  if (!isAdminEmailAllowed(data.user?.email)) {
    return NextResponse.redirect(`${getSiteUrl()}/admin?error=auth`);
  }

  await setAdminSessionCookies(data.session.access_token, data.session.refresh_token);
  return NextResponse.redirect(`${getSiteUrl()}/admin`);
}
