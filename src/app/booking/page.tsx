import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { BandsintownDates } from "@/components/integrations/bandsintown-dates";
import { BookingForm } from "@/components/forms/booking-form";
import { CounterGrid } from "@/components/content/counter-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { SmartImage } from "@/components/media/smart-image";
import { XosaMark } from "@/components/brand/xosa-mark";
import { getBookingSettings, getXosaSettings } from "@/lib/data";
import { isSafeHref } from "@/lib/url";

export const metadata: Metadata = {
  title: "Booking",
  description: "Portal profesional para solicitar presentaciones de XOSA y La Perrera Club."
};

export default async function BookingPage() {
  const [booking, xosa] = await Promise.all([getBookingSettings(), getXosaSettings()]);

  return (
    <main className="shell py-16">
      <section className="grid gap-8 border-b border-white/10 pb-16 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="w-fit rotate-[-1deg] bg-[var(--paper)] px-3 py-1 font-mono text-xs font-black uppercase text-black">
            Booking profesional
          </p>
          <div className="mt-5 max-w-xl">
            <XosaMark priority />
          </div>
          <h1 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            La Perrera <span className="block text-[var(--accent)]">en vivo</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
            {booking.intro ||
              xosa.showDescription ||
              "Solicitudes para shows, DJ sets, experiencias, colaboraciones y presentaciones profesionales."}
          </p>
          <div className="poster-frame mt-8 overflow-hidden rounded-[8px] bg-black">
            <SmartImage
              alt="Booking XOSA"
              className="aspect-[3/4] w-full object-cover object-top"
              height={1200}
              priority
              src="/assets/booking-xosa.webp"
              width={900}
            />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {booking.pressKitUrl && isSafeHref(booking.pressKitUrl) ? (
              <Link className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase" href={booking.pressKitUrl}>
                <Download aria-hidden="true" size={16} />
                Press kit
              </Link>
            ) : null}
            {booking.riderUrl && isSafeHref(booking.riderUrl) ? (
              <Link className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase" href={booking.riderUrl}>
                <Download aria-hidden="true" size={16} />
                Rider técnico
              </Link>
            ) : null}
          </div>
        </div>
        <BookingForm />
      </section>

      <section className="grid gap-6 border-b border-white/10 py-16 md:grid-cols-3">
        <div className="panel p-5">
          <p className="font-mono text-xs uppercase text-[var(--accent)]">Formato</p>
          <p className="mt-3 text-2xl font-black uppercase">{xosa.showFormat || "Por definir según solicitud"}</p>
        </div>
        <div className="panel p-5">
          <p className="font-mono text-xs uppercase text-[var(--accent)]">Duración</p>
          <p className="mt-3 text-2xl font-black uppercase">{xosa.showDuration || "A confirmar"}</p>
        </div>
        <div className="panel p-5">
          <p className="font-mono text-xs uppercase text-[var(--accent)]">Disponibilidad</p>
          <p className="mt-3 text-2xl font-black uppercase">Solo por solicitud</p>
        </div>
      </section>

      <section className="border-b border-white/10 py-16">
        <SectionHeading eyebrow="Métricas" title="Datos para promotores" />
        <CounterGrid counters={xosa.metrics} />
      </section>

      <section className="py-16">
        <SectionHeading eyebrow="Presentaciones" title="Fechas publicadas" />
        <BandsintownDates
          appId={process.env.NEXT_PUBLIC_BANDSINTOWN_APP_ID}
          artistName={process.env.NEXT_PUBLIC_BANDSINTOWN_ARTIST_NAME}
        />
      </section>
    </main>
  );
}
