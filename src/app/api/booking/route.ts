import { NextResponse } from "next/server";
import { siteCopy } from "@/content/site-copy";
import { getServerEnv } from "@/lib/env";
import { sendEmail, wrapEmail } from "@/lib/email";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import { bookingRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await checkRateLimit(`booking:${getRequestIp(request)}`, 5, 60_000))) {
    return NextResponse.json({ message: siteCopy.global.system.rateLimited }, { status: 429 });
  }

  const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Revisa el formulario." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.error("Booking request blocked: Supabase service client is not configured.");
    return NextResponse.json({ message: siteCopy.global.system.unavailable }, { status: 503 });
  }

  const booking = parsed.data;
  const { error } = await supabase.from("booking_requests").insert({
    name: booking.name,
    company: booking.company || "",
    email: booking.email,
    phone: booking.phone,
    city: booking.city,
    venue: booking.venue || "",
    proposed_date: booking.proposedDate,
    event_type: booking.eventType,
    capacity: String(booking.capacity),
    budget: booking.budget,
    message: booking.message || "",
    consent: booking.consent
  });

  if (error) {
    console.error("No se pudo guardar solicitud de booking.", error.message);
    return NextResponse.json({ message: siteCopy.booking.error }, { status: 500 });
  }

  await Promise.all([
    sendEmail({
      to: booking.email,
      subject: siteCopy.booking.emailSubject,
      html: wrapEmail(siteCopy.booking.emailTitle, siteCopy.booking.emailBody)
    }),
    getServerEnv("BOOKING_NOTIFICATION_EMAIL")
      ? sendEmail({
          to: getServerEnv("BOOKING_NOTIFICATION_EMAIL"),
          subject: "Nueva solicitud de booking",
          html: wrapEmail("Nueva solicitud", `<p>${booking.name} / ${booking.company || "Sin empresa"}<br>${booking.city}<br>${booking.proposedDate}</p>`)
        })
      : Promise.resolve({ sent: false })
  ]);

  return NextResponse.json({ message: siteCopy.booking.success });
}
