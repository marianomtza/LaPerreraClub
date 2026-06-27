import Link from "next/link";
import type { Publication } from "@/lib/content-types";
import { SmartImage } from "@/components/media/smart-image";
import { isSafeHref } from "@/lib/url";

export function PublicationList({ publications }: { publications: Publication[] }) {
  if (publications.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {publications.map((publication) => (
        <article className="panel overflow-hidden" key={publication.id}>
          {publication.cover_url ? (
            <SmartImage
              alt={publication.title}
              className="aspect-[4/3] w-full object-cover"
              height={720}
              src={publication.cover_url}
              width={960}
            />
          ) : null}
          <div className="p-5">
            <p className="font-mono text-xs uppercase text-[var(--accent)]">{publication.type}</p>
            <h3 className="mt-2 text-2xl font-black uppercase leading-tight">{publication.title}</h3>
            {publication.excerpt ? <p className="mt-3 text-sm text-[var(--muted)]">{publication.excerpt}</p> : null}
            {publication.action_label && isSafeHref(publication.action_url) ? (
              <Link
                className="focus-ring mt-5 inline-flex min-h-10 items-center rounded-[8px] border border-white/15 px-3 text-sm font-black uppercase"
                href={publication.action_url!}
              >
                {publication.action_label}
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
