"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function BookingForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Enviando solicitud..." });

    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        company: data.get("company"),
        email: data.get("email"),
        phone: data.get("phone"),
        city: data.get("city"),
        venue: data.get("venue"),
        proposedDate: data.get("proposedDate"),
        eventType: data.get("eventType"),
        capacity: data.get("capacity"),
        budget: data.get("budget"),
        message: data.get("message"),
        consent: data.get("consent") === "on",
        website: data.get("website")
      })
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({ status: "error", message: result.message || "No se pudo enviar la solicitud." });
      return;
    }

    form.reset();
    trackEvent("booking_submit");
    setState({ status: "success", message: result.message || "Solicitud recibida." });
  }

  return (
    <form className="panel grid gap-4 p-5 shadow-[0_0_0_6px_rgba(255,8,45,0.05)]" onSubmit={handleSubmit}>
      <div className="grid gap-2 md:grid-cols-2">
        <Field label="Nombre" name="name" required />
        <Field label="Empresa o proyecto" name="company" required />
        <Field label="Correo" name="email" required type="email" />
        <Field label="Teléfono o WhatsApp" name="phone" required />
        <Field label="Ciudad" name="city" required />
        <Field label="Recinto" name="venue" required />
        <Field label="Fecha propuesta" name="proposedDate" required />
        <Field label="Tipo de evento" name="eventType" required />
        <Field label="Aforo estimado" name="capacity" required />
        <Field label="Presupuesto" name="budget" required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-bold uppercase" htmlFor="booking-message">
          Mensaje
        </label>
        <textarea
          className="focus-ring min-h-32 rounded-[4px] border border-white/15 bg-black/45 px-3 py-3"
          id="booking-message"
          name="message"
          required
        />
      </div>
      <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} />
      <label className="flex items-start gap-3 text-sm text-white/78">
        <input className="mt-1" name="consent" required type="checkbox" />
        Acepto que La Perrera Club me contacte sobre esta solicitud.
      </label>
      <button
        className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-white disabled:opacity-60"
        disabled={state.status === "loading"}
        type="submit"
      >
        <Send aria-hidden="true" size={18} />
        Enviar solicitud
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

function Field({
  label,
  name,
  required,
  type = "text"
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  const id = `booking-${name}`;
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold uppercase" htmlFor={id}>
        {label}
      </label>
      <input
        className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
        id={id}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}
