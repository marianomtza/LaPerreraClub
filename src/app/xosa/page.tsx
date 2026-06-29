import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Download } from "lucide-react";
import { siteCopy } from "@/content/site-copy";
import { BandsintownDates } from "@/components/integrations/bandsintown-dates";
import { CounterGrid } from "@/components/content/counter-grid";
import { PublicationList } from "@/components/content/publication-list";
import { releaseLinks, SpotifyEmbed, AppleMusicEmbed, StreamingLinks } from "@/components/music/music-embeds";
import { SectionHeading } from "@/components/site/section-heading";
import { SmartImage } from "@/components/media/smart-image";
import { XosaMark } from "@/components/brand/xosa-mark";
import { getActivePublications, getXosaSettings } from "@/lib/data";
import { isSafeHref, isValidHttpUrl } from "@/lib/url";

export async function generateMetadata(): Promise<Metadata> {
  const xosa = await getXosaSettings();
  return {
    title: xosa.title || siteCopy.xosa.metadata.title,
    description: xosa.bio || siteCopy.xosa.metadata.description,
    openGraph: {
      title: xosa.title || siteCopy.xosa.metadata.title,
      description: xosa.bio || siteCopy.xosa.metadata.description,
      images: xosa.heroImageUrl ? [{ url: xosa.heroImageUrl }] : []
    },
    alternates: {
      canonical: "/xosa"
    }
  };
}

export default async function XosaPage() {
  const [xosa, publications] = await Promise.all([getXosaSettings(), getActivePublications("xosa")]);
  const release = xosa.release;
  const validMetrics = (xosa.metrics || []).filter((counter) => counter.label && counter.source && counter.updatedAt);
  const bandsintownArtist = process.env.NEXT_PUBLIC_BANDSINTOWN_ARTIST_NAME;
  const bandsintownAppId = process.env.NEXT_PUBLIC_BANDSINTOWN_APP_ID;
  const hasBandsintownConfig = Boolean(bandsintownArtist && bandsintownAppId);
  const pressKitIsDocument = xosa.pressKitUrl && isSafeHref(xosa.pressKitUrl) && /\.(pdf|zip)(\?|#|$)/i.test(xosa.pressKitUrl);
  const riderIsDocument = xosa.riderUrl && isSafeHref(xosa.riderUrl) && /\.pdf(\?|#|$)/i.test(xosa.riderUrl);

  return (
    <main className="shell py-16">
      <section className="grid min-h-[72svh] gap-8 border-b border-white/10 pb-16 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div>
          <p className="w-fit rotate-[-1deg] bg-[var(--paper)] px-3 py-1 font-mono text-xs font-black uppercase text-black">
            {siteCopy.xosa.heroEyebrow}
          </p>
          <div className="mt-5 max-w-3xl">
            <XosaMark priority />
          </div>
          <h1 className="sr-only">{xosa.title || "XOSA"}</h1>
          <p className="mt-6 max-w-2xl text-xl text-[var(--muted)]">
            {xosa.bio || siteCopy.xosa.fallbackBio}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-[var(--ink)]"
              href="/booking"
            >
              <Briefcase aria-hidden="true" size={18} />
              {siteCopy.xosa.bookingCta}
            </Link>
            <StreamingLinks links={xosa.links || []} />
          </div>
        </div>
        <div className="poster-frame min-h-80 overflow-hidden rounded-[8px] bg-black">
          {xosa.heroImageUrl ? (
            <SmartImage
              alt={xosa.title || "XOSA"}
              className="h-full w-full object-cover"
              height={1100}
              priority
              src={xosa.heroImageUrl}
              width={900}
            />
          ) : (
            <div className="hero-fallback h-full min-h-80" />
          )}
        </div>
      </section>

      {release?.title ? (
        <section className="grid gap-8 border-b border-white/10 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow={siteCopy.xosa.releaseEyebrow} title={release.title} copy={release.description} />
          <div className="grid gap-4">
            <StreamingLinks links={releaseLinks(release)} />
            <SpotifyEmbed title={release.title} url={release.spotifyUrl} />
            <AppleMusicEmbed title={release.title} url={release.appleMusicUrl} />
          </div>
        </section>
      ) : null}

      {hasBandsintownConfig ? (
        <section className="border-b border-white/10 py-16">
          <SectionHeading eyebrow={siteCopy.xosa.datesEyebrow} title={siteCopy.xosa.datesTitle} />
          <BandsintownDates appId={bandsintownAppId} artistName={bandsintownArtist} />
        </section>
      ) : null}

      {validMetrics.length > 0 ? (
        <section className="border-b border-white/10 py-16">
          <SectionHeading eyebrow={siteCopy.xosa.metricsEyebrow} title={siteCopy.xosa.metricsTitle} copy={siteCopy.xosa.metricsCopy} />
          <CounterGrid counters={validMetrics} />
        </section>
      ) : null}

      {xosa.videos?.some((video) => isValidHttpUrl(video.url)) ? (
        <section className="border-b border-white/10 py-16">
          <SectionHeading eyebrow={siteCopy.xosa.videoEyebrow} title={siteCopy.xosa.videoTitle} />
          <StreamingLinks links={xosa.videos} />
        </section>
      ) : null}

      {xosa.photos?.some((photo) => isSafeHref(photo.url)) ? (
        <section className="border-b border-white/10 py-16">
          <SectionHeading eyebrow={siteCopy.xosa.photosEyebrow} title={siteCopy.xosa.photosTitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {xosa.photos
              .filter((photo) => isSafeHref(photo.url))
              .map((photo) => (
                <SmartImage
                  alt={photo.label || "Fotografía de XOSA"}
                  className="aspect-[4/5] rounded-[8px] object-cover"
                  height={1000}
                  key={photo.url}
                  src={photo.url}
                  width={800}
                />
              ))}
          </div>
        </section>
      ) : null}

      {publications.length > 0 ? (
        <section className="border-b border-white/10 py-16">
          <SectionHeading eyebrow={siteCopy.xosa.postsEyebrow} title={siteCopy.xosa.postsTitle} />
          <PublicationList publications={publications} />
        </section>
      ) : null}

      <section className="grid gap-5 py-16 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-mono text-xs uppercase text-[var(--accent)]">Booking</p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-none">{siteCopy.xosa.professionalTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {pressKitIsDocument ? (
            <Link className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase" href={xosa.pressKitUrl || ""}>
              <Download aria-hidden="true" size={16} />
              {siteCopy.xosa.pressKit}
            </Link>
          ) : null}
          {riderIsDocument ? (
            <Link className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase" href={xosa.riderUrl || ""}>
              <Download aria-hidden="true" size={16} />
              {siteCopy.xosa.rider}
            </Link>
          ) : null}
          <Link
            className="focus-ring inline-flex min-h-11 items-center rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]"
            href="/booking"
          >
            Solicitar booking
          </Link>
        </div>
      </section>
    </main>
  );
}
