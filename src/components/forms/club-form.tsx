"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function ClubForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Enviando..." });

    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        city: data.get("city"),
        socialHandle: data.get("socialHandle"),
        discoverySource: data.get("discoverySource"),
        consent: data.get("consent") === "on",
        website: data.get("website")
      })
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({ status: "error", message: result.message || "No se pudo guardar tu registro." });
      return;
    }

    form.reset();
    trackEvent("club_submit");
    setState({ status: "success", message: result.message || "Ya estás en la lista." });
  }

  return (
    <form className="panel grid gap-4 p-5 shadow-[0_0_0_6px_rgba(255,8,45,0.05)]" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-bold uppercase" htmlFor="club-name">
          Nombre
        </label>
        <input
          className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
          id="club-name"
          name="name"
          required
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-bold uppercase" htmlFor="club-email">
            Correo
          </label>
          <input
            className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
            id="club-email"
            name="email"
            required
            type="email"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-bold uppercase" htmlFor="club-city">
            Ciudad
          </label>
          <input
            className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
            id="club-city"
            name="city"
            required
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-bold uppercase" htmlFor="club-social">
          Instagram o TikTok
        </label>
        <input
          className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
          id="club-social"
          name="socialHandle"
          placeholder="@"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-bold uppercase" htmlFor="club-source">
          Cómo conociste La Perrera
        </label>
        <textarea
          className="focus-ring min-h-28 rounded-[4px] border border-white/15 bg-black/45 px-3 py-3"
          id="club-source"
          name="discoverySource"
          required
        />
      </div>
      <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} />
      <label className="flex items-start gap-3 text-sm text-white/78">
        <input className="mt-1" name="consent" required type="checkbox" />
        Acepto recibir comunicaciones de La Perrera Club.
      </label>
      <button
        className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-white disabled:opacity-60"
        disabled={state.status === "loading"}
        type="submit"
      >
        <Send aria-hidden="true" size={18} />
        Entrar al club
      </button>
      {state.message ? (
        <p
          className={state.status === "error" ? "text-sm text-red-200" : "text-sm text-[var(--accent)]"}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
