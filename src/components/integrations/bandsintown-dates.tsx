"use client";

import Link from "next/link";
import Script from "next/script";
import { CalendarDays, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

let scriptLoaded = false;

export function BandsintownDates({
  artistName,
  appId
}: {
  artistName?: string;
  appId?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(scriptLoaded ? "ready" : "idle");

  const profileUrl = useMemo(() => {
    if (!artistName) return "";
    return `https://www.bandsintown.com/a/${encodeURIComponent(artistName)}`;
  }, [artistName]);

  if (!artistName || !appId) {
    return (
    <div className="panel flex items-start gap-3 p-5 text-white/78">
      <CalendarDays aria-hidden="true" className="mt-1 shrink-0 text-[var(--accent)]" size={20} />
      <div>
        <p className="font-black uppercase text-white">Próximas fechas por anunciar.</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Configura Bandsintown en el panel o mediante variables de entorno.
        </p>
        <div className="tear-rule mt-4 w-48" />
      </div>
    </div>
    );
  }

  return (
    <div className="panel overflow-hidden p-5">
      <Script
        onError={() => setStatus("error")}
        onLoad={() => {
          scriptLoaded = true;
          setStatus("ready");
        }}
        onReady={() => setStatus("ready")}
        src="https://widget.bandsintown.com/main.min.js"
        strategy="lazyOnload"
      />
      {status !== "ready" ? (
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <CalendarDays aria-hidden="true" size={18} />
          {status === "error" ? "No se pudo cargar Bandsintown." : "Cargando fechas desde Bandsintown..."}
        </div>
      ) : null}
      <a
        className="bit-widget-initializer"
        data-artist-name={artistName}
        data-display-local-dates="false"
        data-display-past-dates="false"
        data-display-start-time="true"
        data-display-limit="6"
        data-auto-style="false"
        data-text-color="#f6f2e8"
        data-link-color="#d9ff3f"
        data-background-color="rgba(8,8,7,0)"
        data-display-lineup="false"
        data-app-id={appId}
        href={profileUrl}
      >
        Ver fechas de {artistName} en Bandsintown
      </a>
      <div className="mt-4">
        <Link
          className="focus-ring inline-flex items-center gap-2 text-sm font-black uppercase text-[var(--accent)]"
          href={profileUrl}
          rel="noreferrer"
          target="_blank"
        >
          Perfil en Bandsintown
          <ExternalLink aria-hidden="true" size={14} />
        </Link>
      </div>
    </div>
  );
}
