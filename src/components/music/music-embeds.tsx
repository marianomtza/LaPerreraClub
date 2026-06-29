import Link from "next/link";
import { Headphones } from "lucide-react";
import type { LinkItem, ReleaseContent } from "@/lib/content-types";
import { isValidHttpUrl } from "@/lib/url";

export function isSpotifyReleaseUrl(url: string | undefined) {
  if (!url || !isValidHttpUrl(url)) return false;
  return /open\.spotify\.com\/(album|track|playlist|episode|show)\//.test(url);
}

export function isAppleMusicReleaseUrl(url: string | undefined) {
  if (!url || !isValidHttpUrl(url)) return false;
  return !/music\.apple\.com\/[^/]+\/artist\//.test(url);
}

export function StreamingLinks({ links }: { links: LinkItem[] }) {
  const validLinks = links.filter((link) => isValidHttpUrl(link.url));
  if (validLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {validLinks.map((link) => (
        <Link
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-white/15 bg-black/30 px-4 text-sm font-black uppercase text-white/88 transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
          href={link.url}
          key={`${link.label}-${link.url}`}
          rel="noreferrer"
          target="_blank"
        >
          <Headphones aria-hidden="true" size={16} />
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function SpotifyEmbed({ url, title }: { url?: string; title: string }) {
  if (!isSpotifyReleaseUrl(url)) return null;
  const safeUrl = url || "";
  const embedUrl = safeUrl.includes("/embed/") ? safeUrl : safeUrl.replace("open.spotify.com/", "open.spotify.com/embed/");

  return (
    <iframe
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="min-h-[152px] w-full rounded-[8px] border-0"
      loading="lazy"
      src={embedUrl}
      title={`Spotify: ${title}`}
    />
  );
}

export function AppleMusicEmbed({ url, title }: { url?: string; title: string }) {
  if (!isAppleMusicReleaseUrl(url)) return null;
  const safeUrl = url || "";
  const embedUrl = safeUrl.includes("embed.music.apple.com") ? safeUrl : safeUrl.replace("music.apple.com", "embed.music.apple.com");

  return (
    <iframe
      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
      className="min-h-[175px] w-full rounded-[8px] border-0 bg-white"
      loading="lazy"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
      src={embedUrl}
      title={`Apple Music: ${title}`}
    />
  );
}

export function releaseLinks(release: ReleaseContent) {
  return [
    { label: "Spotify", url: release.spotifyUrl || "", platform: "spotify" },
    { label: "Apple Music", url: release.appleMusicUrl || "", platform: "apple_music" },
    { label: "YouTube", url: release.youtubeUrl || "", platform: "youtube" },
    { label: "Smart link", url: release.smartLinkUrl || "", platform: "smart_link" }
  ].filter((link) => isValidHttpUrl(link.url));
}
