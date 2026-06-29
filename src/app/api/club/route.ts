import { NextResponse } from "next/server";
import { siteCopy } from "@/content/site-copy";
import { getServerEnv } from "@/lib/env";
import { sendEmail, wrapEmail } from "@/lib/email";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import { clubSubmissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await checkRateLimit(`club:${getRequestIp(request)}`, 8, 60_000))) {
    return NextResponse.json({ message: siteCopy.global.system.rateLimited }, { status: 429 });
  }

  const parsed = clubSubmissionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Revisa el formulario." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.error("Club submission blocked: Supabase service client is not configured.");
    return NextResponse.json({ message: siteCopy.global.system.unavailable }, { status: 503 });
  }

  const submission = parsed.data;
  const { error } = await supabase.from("club_submissions").insert({
    name: submission.name || null,
    email: submission.email,
    city: submission.city,
    social_handle: submission.socialHandle,
    discovery_source: submission.discoverySource || "",
    consent: submission.consent
  });

  if (error) {
    console.error("No se pudo guardar registro del Club.", error.message);
    return NextResponse.json({ message: siteCopy.club.error }, { status: 500 });
  }

  await Promise.all([
    sendEmail({
      to: submission.email,
      subject: siteCopy.club.emailSubject,
      html: wrapEmail(siteCopy.club.emailTitle, siteCopy.club.emailBody)
    }),
    getServerEnv("CLUB_NOTIFICATION_EMAIL")
      ? sendEmail({
          to: getServerEnv("CLUB_NOTIFICATION_EMAIL"),
          subject: "Nuevo registro del Club",
          html: wrapEmail("Nuevo registro", `<p>${submission.name || "Sin nombre"} (${submission.email}) se registró desde ${submission.city}.</p>`)
        })
      : Promise.resolve({ sent: false })
  ]);

  return NextResponse.json({ message: siteCopy.club.success });
}
