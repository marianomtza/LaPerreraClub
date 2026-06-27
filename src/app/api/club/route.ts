import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { sendEmail, wrapEmail } from "@/lib/email";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import { clubSubmissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!checkRateLimit(`club:${getRequestIp(request)}`, 8, 60_000)) {
    return NextResponse.json({ message: "Intenta de nuevo en un minuto." }, { status: 429 });
  }

  const parsed = clubSubmissionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Revisa el formulario." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase no está configurado para guardar registros." }, { status: 503 });
  }

  const submission = parsed.data;
  const { error } = await supabase.from("club_submissions").insert({
    name: submission.name,
    email: submission.email,
    city: submission.city,
    social_handle: submission.socialHandle,
    discovery_source: submission.discoverySource,
    consent: submission.consent
  });

  if (error) {
    console.error("No se pudo guardar registro del Club.", error.message);
    return NextResponse.json({ message: "No se pudo guardar tu registro." }, { status: 500 });
  }

  await Promise.all([
    sendEmail({
      to: submission.email,
      subject: "Ya estás en La Perrera Club",
      html: wrapEmail("Registro recibido", "<p>Gracias por entrar al Club. Te escribiremos cuando haya lanzamientos, drops o preventas reales.</p>")
    }),
    getServerEnv("CLUB_NOTIFICATION_EMAIL")
      ? sendEmail({
          to: getServerEnv("CLUB_NOTIFICATION_EMAIL"),
          subject: "Nuevo registro del Club",
          html: wrapEmail("Nuevo registro", `<p>${submission.name} (${submission.email}) se registró desde ${submission.city}.</p>`)
        })
      : Promise.resolve({ sent: false })
  ]);

  return NextResponse.json({ message: "Registro guardado. Bienvenido al Club." });
}
