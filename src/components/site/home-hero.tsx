import Link from "next/link";
import type { HomeSettings } from "@/lib/content-types";
import { isSafeHref } from "@/lib/url";
import { SmartImage } from "@/components/media/smart-image";
import { XosaMark } from "@/components/brand/xosa-mark";

export function HomeHero({
  settings,
  videoUrl,
  posterUrl
}: {
  settings: HomeSettings;
  videoUrl: string;
  posterUrl: string;
}) {
  const hero = settings.hero || {};
  const primaryHref = hero.primaryHref || "/#club";
  const secondaryHref = hero.secondaryHref || "/#contenido";
  const statusItems = (hero.statusItems || []).filter(Boolean);

  return (
    <section className="grain relative min-h-[calc(100svh-64px)] overflow-hidden">
      {videoUrl ? (
        <video
          aria-hidden="true"
          autoPlay
          className="motion-video absolute inset-0 h-full w-full object-cover opacity-70"
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl || undefined}
          src={videoUrl}
        />
      ) : (
        <div aria-hidden="true" className="hero-fallback absolute inset-0" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050403] via-[#050403]/48 to-[#050403]/18" />
      <div className="red-spray absolute inset-x-0 bottom-0 h-44 opacity-70" />
      <div className="shell relative z-10 flex min-h-[calc(100svh-64px)] flex-col justify-end pb-10 pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_330px] lg:items-end">
          <div className="max-w-6xl">
            {hero.eyebrow ? (
              <p className="mb-4 w-fit rotate-[-1deg] bg-[var(--paper)] px-3 py-1 font-mono text-xs font-black uppercase text-black">
                {hero.eyebrow}
              </p>
            ) : null}
            <div className="max-w-[760px]">
              <XosaMark priority />
            </div>
            <h1 className="mt-5 text-balance text-5xl font-black uppercase leading-[0.86] md:text-7xl lg:text-[7.5rem]">
              <span className="block">La Perrera</span>
              <span className="block text-[var(--accent)]">Club</span>
            </h1>
            <p className="area-italic mt-5 max-w-2xl text-xl text-[var(--paper)] md:text-2xl">
              Música, club, comunidad, drops y booking. Una operación de noche, show y cultura digital.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {isSafeHref(primaryHref) ? (
                <Link
                className="focus-ring inline-flex min-h-12 items-center rounded-[4px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-white shadow-[0_0_34px_rgba(244,20,34,0.36)]"
                  href={primaryHref}
                >
                  {hero.primaryLabel || "Entrar al club"}
                </Link>
              ) : null}
              {isSafeHref(secondaryHref) ? (
                <Link
                className="focus-ring inline-flex min-h-12 items-center rounded-[4px] border border-white/24 bg-black/24 px-5 text-sm font-black uppercase text-white backdrop-blur"
                  href={secondaryHref}
                >
                  {hero.secondaryLabel || "Explorar"}
                </Link>
              ) : null}
            </div>
          </div>

          {posterUrl ? (
            <div className="poster-frame hidden overflow-hidden rounded-[8px] bg-black lg:block">
              <SmartImage
                alt="Visual de La Perrera Club"
                className="aspect-[3/4] h-full w-full object-cover"
                height={920}
                priority
                src="/assets/booking-xosa.webp"
                width={690}
              />
            </div>
          ) : null}
          </div>

        {statusItems.length > 0 ? (
          <div className="marquee mt-10 border-y border-white/18 bg-black/30 py-3 font-mono text-sm font-black uppercase text-[var(--accent-strong)]">
            <span>
              {[...statusItems, ...statusItems].map((item, index) => (
                <b className="mx-6" key={`${item}-${index}`}>
                  {item}
                </b>
              ))}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
