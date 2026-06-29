import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Disc3 } from "lucide-react";
import { siteCopy } from "@/content/site-copy";
import { BandsintownDates } from "@/components/integrations/bandsintown-dates";
import { releaseLinks, SpotifyEmbed, StreamingLinks } from "@/components/music/music-embeds";
import { PublicationList } from "@/components/content/publication-list";
import { ClubForm } from "@/components/forms/club-form";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { HomeHero } from "@/components/site/home-hero";
import { SmartImage } from "@/components/media/smart-image";
import {
  getActivePublications,
  getHomeSettings,
  getLocalHeroPoster,
  getLocalHeroVideo,
  getProducts,
  getXosaSettings
} from "@/lib/data";

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

export default async function HomePage() {
  const [home, xosa, products, publications] = await Promise.all([
    getHomeSettings(),
    getXosaSettings(),
    getProducts({ featuredOnly: true, limit: 3 }),
    getActivePublications("inicio")
  ]);

  const release = home.activeRelease;
  const modules = home.modules || {};
  const heroVideo = home.hero?.videoUrl || getLocalHeroVideo();
  const heroPoster = home.hero?.posterUrl || getLocalHeroPoster();
  const bandsintownArtist = process.env.NEXT_PUBLIC_BANDSINTOWN_ARTIST_NAME;
  const bandsintownAppId = process.env.NEXT_PUBLIC_BANDSINTOWN_APP_ID;
  const hasBandsintownConfig = Boolean(bandsintownArtist && bandsintownAppId);

  return (
    <main>
      <HomeHero settings={home} videoUrl={heroVideo} posterUrl={heroPoster} />

      <div className="shell py-16" id="contenido">
        {release?.title && modules.release !== false ? (
          <section className="grid gap-8 border-b border-white/10 pb-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col justify-between">
              <SectionHeading eyebrow={siteCopy.home.now.eyebrow} title={release.title} copy={release.description} />
              <div className="grid gap-4">
                <StreamingLinks links={releaseLinks(release)} />
              </div>
            </div>
            <div className="relative grid gap-4">
              <div className="tear-rule absolute -left-4 top-8 hidden w-40 rotate-[-8deg] md:block" />
              {release.coverUrl ? (
                <SmartImage
                  alt={release.title}
                  className="poster-frame aspect-square w-full rounded-[8px] object-cover"
                  height={900}
                  priority
                  src={release.coverUrl}
                  width={900}
                />
              ) : null}
              <SpotifyEmbed title={release.title} url={release.spotifyUrl} />
            </div>
          </section>
        ) : null}

        {modules.xosa !== false ? (
          <section className="grid gap-8 border-b border-white/10 py-16 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionHeading
                eyebrow={siteCopy.home.xosa.eyebrow}
                title={xosa.title || "XOSA"}
                copy={xosa.bio || siteCopy.home.xosa.fallbackBio}
              />
              <div className="flex flex-wrap gap-3">
                <Link
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-black uppercase text-black"
                  href="/xosa"
                >
                  {siteCopy.home.hero.secondaryLabel}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
                <Link
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase"
                  href="/booking"
                >
                  {siteCopy.global.navigation.booking}
                  <Briefcase aria-hidden="true" size={16} />
                </Link>
              </div>
              <div className="mt-5">
                <StreamingLinks links={xosa.links || []} />
              </div>
            </div>
            <div className="poster-frame flex min-h-72 items-center justify-center overflow-hidden rounded-[8px] bg-black">
              {xosa.heroImageUrl ? (
                <SmartImage
                  alt={xosa.title || "XOSA"}
                  className="h-full w-full object-cover"
                  height={900}
                  src={xosa.heroImageUrl}
                  width={900}
                />
              ) : (
                <Disc3 aria-hidden="true" className="text-[var(--accent)]" size={86} />
              )}
            </div>
          </section>
        ) : null}

        {modules.dates !== false && hasBandsintownConfig ? (
          <section className="border-b border-white/10 py-16" id="fechas">
            <SectionHeading eyebrow={siteCopy.home.dates.eyebrow} title={siteCopy.home.dates.title} />
            <BandsintownDates
              appId={bandsintownAppId}
              artistName={bandsintownArtist}
            />
          </section>
        ) : null}

        {modules.store !== false && products.length > 0 ? (
          <section className="border-b border-white/10 py-16">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <SectionHeading eyebrow={siteCopy.home.store.eyebrow} title={siteCopy.home.store.title} />
              <Link className="focus-ring font-black uppercase text-[var(--accent)]" href="/tienda">
                {siteCopy.home.store.cta}
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {modules.publications !== false && publications.length > 0 ? (
          <section className="border-b border-white/10 py-16">
            <SectionHeading eyebrow="Actual" title="Publicaciones" />
            <PublicationList publications={publications} />
          </section>
        ) : null}

        {modules.club !== false ? (
          <section className="grid gap-8 border-b border-white/10 py-16 lg:grid-cols-[0.9fr_1.1fr]" id="club">
            <SectionHeading
              eyebrow={siteCopy.home.club.eyebrow}
              title={siteCopy.home.club.title}
              copy={siteCopy.home.club.copy}
            />
            <ClubForm />
          </section>
        ) : null}

        {modules.booking !== false ? (
          <section className="grid gap-5 py-16 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-xs uppercase text-[var(--accent)]">{siteCopy.home.booking.eyebrow}</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none">{siteCopy.home.booking.title}</h2>
            </div>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--accent-strong)] px-5 text-sm font-black uppercase text-white"
              href="/booking"
            >
              {siteCopy.home.booking.cta}
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
