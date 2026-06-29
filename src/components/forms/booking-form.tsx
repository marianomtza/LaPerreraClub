"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { siteCopy } from "@/content/site-copy";
import { trackEvent } from "@/lib/analytics";

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function BookingForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "loading") return;

    setState({ status: "loading", message: siteCopy.booking.submitting });

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
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

      const result = await readJson(response);

      if (!response.ok) {
        setState({ status: "error", message: result.message || siteCopy.booking.error });
        return;
      }

      form.reset();
      trackEvent("booking_submit");
      setState({ status: "success", message: result.message || siteCopy.booking.success });
    } catch {
      setState({ status: "error", message: siteCopy.global.system.genericError });
    }
  }

  return (
    <form className="panel grid gap-4 p-5 shadow-[0_0_0_6px_rgba(255,8,45,0.05)]" onSubmit={handleSubmit}>
      <div className="grid gap-2 md:grid-cols-2">
        <Field autoComplete="name" label={siteCopy.booking.fields.name} maxLength={140} name="name" required />
        <Field autoComplete="organization" label={siteCopy.booking.fields.company} maxLength={160} name="company" />
        <Field autoComplete="email" label={siteCopy.booking.fields.email} maxLength={180} name="email" required type="email" />
        <Field autoComplete="tel" label={siteCopy.booking.fields.phone} maxLength={80} name="phone" required />
        <Field autoComplete="address-level2" label={siteCopy.booking.fields.city} maxLength={120} name="city" required />
        <Field label={siteCopy.booking.fields.venue} maxLength={160} name="venue" />
        <Field label={siteCopy.booking.fields.proposedDate} name="proposedDate" required type="date" />
        <SelectField label={siteCopy.booking.fields.eventType} name="eventType" options={siteCopy.booking.eventTypes} required />
        <Field label={siteCopy.booking.fields.capacity} max={500000} min={1} name="capacity" required type="number" />
        <SelectField label={siteCopy.booking.fields.budget} name="budget" options={siteCopy.booking.budgetRanges} required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-bold uppercase" htmlFor="booking-message">
          {siteCopy.booking.fields.message}
        </label>
        <textarea
          className="focus-ring min-h-32 rounded-[4px] border border-white/15 bg-black/45 px-3 py-3"
          id="booking-message"
          maxLength={1600}
          name="message"
        />
      </div>
      <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} />
      <label className="flex items-start gap-3 text-sm text-white/78">
        <input className="mt-1" name="consent" required type="checkbox" />
        {siteCopy.booking.fields.consent}
      </label>
      <button
        className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-white disabled:opacity-60"
        disabled={state.status === "loading"}
        type="submit"
      >
        <Send aria-hidden="true" size={18} />
        {siteCopy.booking.submit}
      </button>
      {state.message ? (
        <p
          className={state.status === "error" ? "text-sm text-red-200" : "text-sm text-[var(--accent)]"}
          aria-live="polite"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  autoComplete,
  label,
  max,
  maxLength,
  min,
  name,
  required,
  type = "text"
}: {
  autoComplete?: string;
  label: string;
  max?: number;
  maxLength?: number;
  min?: number;
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
        autoComplete={autoComplete}
        className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
        id={id}
        max={max}
        maxLength={maxLength}
        min={min}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
}) {
  const id = `booking-${name}`;
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold uppercase" htmlFor={id}>
        {label}
      </label>
      <select
        className="focus-ring min-h-11 rounded-[4px] border border-white/15 bg-black/45 px-3"
        id={id}
        name={name}
        required={required}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as { message?: string };
  } catch {
    return {};
  }
}
