import Link from "next/link";
import type { CounterContent, LinkItem, SpecialPageBlock } from "@/lib/content-types";
import { getProductBySlug, getProducts } from "@/lib/data";
import { isSafeHref, isValidHttpUrl } from "@/lib/url";
import { BandsintownDates } from "@/components/integrations/bandsintown-dates";
import { CounterGrid } from "@/components/content/counter-grid";
import { Countdown } from "@/components/content/countdown";
import { ClubForm } from "@/components/forms/club-form";
import { SmartImage } from "@/components/media/smart-image";
import { AppleMusicEmbed, SpotifyEmbed, StreamingLinks } from "@/components/music/music-embeds";
import { ProductCard } from "@/components/store/product-card";

function text(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

function bool(data: Record<string, unknown>, key: string) {
  return data[key] === true;
}

function links(data: Record<string, unknown>) {
  const value = data.links;
  return Array.isArray(value) ? (value as LinkItem[]) : [];
}

function images(data: Record<string, unknown>) {
  const value = data.images;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function SpecialPageBlocks({ blocks }: { blocks: SpecialPageBlock[] }) {
  const rendered: React.ReactNode[] = [];

  for (const block of blocks) {
    const data = block.data || {};
    const key = block.id;

    if (block.type === "hero") {
      rendered.push(
        <section className="grid min-h-[68svh] items-end border-b border-white/10 py-16" key={key}>
          <div className="max-w-4xl">
            {text(data, "eyebrow") ? <p className="font-mono text-xs uppercase text-[var(--accent)]">{text(data, "eyebrow")}</p> : null}
            <h1 className="mt-4 text-6xl font-black uppercase leading-none md:text-8xl">{text(data, "title")}</h1>
            {text(data, "copy") ? <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">{text(data, "copy")}</p> : null}
          </div>
        </section>
      );
    }

    if (block.type === "text") {
      rendered.push(
        <section className="max-w-3xl border-b border-white/10 py-12 text-xl leading-relaxed text-white/82" key={key}>
          {text(data, "body")}
        </section>
      );
    }

    if (block.type === "image" && isSafeHref(text(data, "src"))) {
      rendered.push(
        <section className="border-b border-white/10 py-12" key={key}>
          <SmartImage
            alt={text(data, "alt") || ""}
            className="max-h-[80vh] w-full rounded-[8px] object-cover"
            height={1200}
            src={text(data, "src")}
            width={1600}
          />
        </section>
      );
    }

    if (block.type === "gallery") {
      const gallery = images(data);
      if (gallery.length > 0) {
        rendered.push(
          <section className="grid gap-4 border-b border-white/10 py-12 md:grid-cols-3" key={key}>
            {gallery.map((src) => (
              <SmartImage
                alt={text(data, "alt") || ""}
                className="aspect-[4/5] rounded-[8px] object-cover"
                height={1000}
                key={src}
                src={src}
                width={800}
              />
            ))}
          </section>
        );
      }
    }

    if (block.type === "video" && isValidHttpUrl(text(data, "url"))) {
      rendered.push(
        <section className="border-b border-white/10 py-12" key={key}>
          <Link className="focus-ring inline-flex min-h-11 rounded-[8px] border border-white/15 px-4 py-3 font-black uppercase" href={text(data, "url")} rel="noreferrer" target="_blank">
            Ver video
          </Link>
        </section>
      );
    }

    if (block.type === "spotify") {
      rendered.push(<section className="border-b border-white/10 py-12" key={key}><SpotifyEmbed title={text(data, "title") || "Spotify"} url={text(data, "url")} /></section>);
    }

    if (block.type === "apple_music") {
      rendered.push(<section className="border-b border-white/10 py-12" key={key}><AppleMusicEmbed title={text(data, "title") || "Apple Music"} url={text(data, "url")} /></section>);
    }

    if (block.type === "streaming_links") {
      rendered.push(<section className="border-b border-white/10 py-12" key={key}><StreamingLinks links={links(data)} /></section>);
    }

    if (block.type === "buttons") {
      const buttonLinks = links(data).filter((link) => isSafeHref(link.url));
      rendered.push(
        <section className="flex flex-wrap gap-3 border-b border-white/10 py-12" key={key}>
          {buttonLinks.map((link) => (
            <Link className="focus-ring inline-flex min-h-11 items-center rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]" href={link.url} key={link.url}>
              {link.label}
            </Link>
          ))}
        </section>
      );
    }

    if (block.type === "countdown" && text(data, "targetDate")) {
      rendered.push(
        <section className="border-b border-white/10 py-12" key={key}>
          <Countdown endText={text(data, "endText")} hideWhenFinished={bool(data, "hideWhenFinished")} targetDate={text(data, "targetDate")} />
        </section>
      );
    }

    if (block.type === "counter") {
      rendered.push(<section className="border-b border-white/10 py-12" key={key}><CounterGrid counters={[data as CounterContent]} /></section>);
    }

    if (block.type === "product" && text(data, "slug")) {
      const product = await getProductBySlug(text(data, "slug"));
      if (product) rendered.push(<section className="max-w-md border-b border-white/10 py-12" key={key}><ProductCard product={product} /></section>);
    }

    if (block.type === "featured_products") {
      const products = await getProducts({ featuredOnly: true, limit: 3 });
      if (products.length > 0) {
        rendered.push(
          <section className="grid gap-4 border-b border-white/10 py-12 md:grid-cols-3" key={key}>
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </section>
        );
      }
    }

    if (block.type === "bandsintown") {
      const artistName = process.env.NEXT_PUBLIC_BANDSINTOWN_ARTIST_NAME;
      const appId = process.env.NEXT_PUBLIC_BANDSINTOWN_APP_ID;
      if (artistName && appId) {
        rendered.push(
          <section className="border-b border-white/10 py-12" key={key}>
            <BandsintownDates appId={appId} artistName={artistName} />
          </section>
        );
      }
    }

    if (block.type === "club_form") {
      rendered.push(<section className="max-w-2xl border-b border-white/10 py-12" key={key}><ClubForm /></section>);
    }

    if (block.type === "booking_cta") {
      rendered.push(
        <section className="grid gap-4 border-b border-white/10 py-12 md:grid-cols-[1fr_auto] md:items-center" key={key}>
          <h2 className="text-4xl font-black uppercase leading-none">{text(data, "title") || "Booking"}</h2>
          <Link className="focus-ring inline-flex min-h-11 items-center rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]" href="/booking">
            Solicitar booking
          </Link>
        </section>
      );
    }

    if (block.type === "separator") {
      rendered.push(<hr className="border-white/10" key={key} />);
    }
  }

  return <>{rendered}</>;
}
