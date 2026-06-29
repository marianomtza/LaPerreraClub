"use client";

import { CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { siteCopy } from "@/content/site-copy";
import { useCart } from "@/components/store/cart-provider";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/money";

type CheckoutState = {
  status: "idle" | "loading" | "error";
  message: string;
};

export function CheckoutClient({ pickupEnabled = false }: { pickupEnabled?: boolean }) {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [state, setState] = useState<CheckoutState>({ status: "idle", message: "" });
  const idempotencyKey = useRef("");
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0), [items]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "loading") return;

    setState({ status: "loading", message: siteCopy.checkout.validating });
    trackEvent("checkout_start", { itemCount: items.length, subtotal });

    const form = event.currentTarget;
    const data = new FormData(form);
    idempotencyKey.current ||= globalThis.crypto?.randomUUID?.() || `${new Date().getTime()}-${items.length}`;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          pickup: data.get("pickup") === "on",
          customer: {
            name: data.get("name"),
            email: data.get("email"),
            phone: data.get("phone"),
            address: data.get("address"),
            city: data.get("city"),
            state: data.get("state"),
            postalCode: data.get("postalCode"),
            notes: data.get("notes")
          }
        })
      });

      const result = await readJson(response);

      if (!response.ok || !result.initPoint) {
        idempotencyKey.current = "";
        setState({ status: "error", message: result.message || siteCopy.checkout.startError });
        return;
      }

      window.location.assign(result.initPoint);
      window.setTimeout(() => clearCart(), 1000);
    } catch {
      idempotencyKey.current = "";
      setState({ status: "error", message: siteCopy.global.system.genericError });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="grid gap-3">
        {items.length === 0 ? (
          <div className="panel p-6">
            <p className="font-black uppercase text-white">{siteCopy.checkout.emptyCartTitle}</p>
            <p className="mt-2 text-[var(--muted)]">{siteCopy.checkout.emptyCartCopy}</p>
          </div>
        ) : (
          items.map((item) => (
            <div className="panel grid gap-4 p-4" key={item.variantId}>
              <div>
                <p className="font-black uppercase">{item.name}</p>
                <p className="text-sm text-[var(--muted)]">{item.variantName}</p>
                <p className="mt-2 font-mono">{formatMoney(item.priceCents)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Restar uno"
                    className="focus-ring inline-flex size-10 items-center justify-center rounded-[8px] border border-white/15"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    type="button"
                  >
                    <Minus aria-hidden="true" size={16} />
                  </button>
                  <span className="min-w-8 text-center font-mono">{item.quantity}</span>
                  <button
                    aria-label="Sumar uno"
                    className="focus-ring inline-flex size-10 items-center justify-center rounded-[8px] border border-white/15"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    type="button"
                  >
                    <Plus aria-hidden="true" size={16} />
                  </button>
                </div>
                <button
                  aria-label="Eliminar producto"
                  className="focus-ring inline-flex size-10 items-center justify-center rounded-[8px] border border-white/15 text-red-100"
                  onClick={() => removeItem(item.variantId)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
            </div>
          ))
        )}
        <div className="tear-rule" />
        <div className="flex items-center justify-between border-y border-white/15 py-4 font-black uppercase">
          <span>{siteCopy.checkout.subtotal}</span>
          <span className="font-mono">{formatMoney(subtotal)}</span>
        </div>
      </section>

      <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
        <p className="font-mono text-xs font-black uppercase text-[var(--accent)]">{siteCopy.checkout.deliveryData}</p>
        <div className="grid gap-2 md:grid-cols-2">
          <CheckoutField autoComplete="name" label="Nombre" name="name" required />
          <CheckoutField autoComplete="email" label="Correo" name="email" required type="email" />
          <CheckoutField autoComplete="tel" label="Teléfono" name="phone" required />
          <CheckoutField autoComplete="postal-code" label="Código postal" name="postalCode" required />
          <CheckoutField autoComplete="address-level2" label="Ciudad" name="city" required />
          <CheckoutField autoComplete="address-level1" label="Estado" name="state" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-bold uppercase" htmlFor="checkout-address">
            Dirección
          </label>
          <textarea
            className="focus-ring min-h-24 rounded-[8px] border border-white/15 bg-black/30 px-3 py-3"
            autoComplete="street-address"
            id="checkout-address"
            name="address"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-bold uppercase" htmlFor="checkout-notes">
            Notas
          </label>
          <textarea
            className="focus-ring min-h-20 rounded-[8px] border border-white/15 bg-black/30 px-3 py-3"
            id="checkout-notes"
            name="notes"
          />
        </div>
        {pickupEnabled ? (
          <label className="flex items-start gap-3 text-sm text-white/78">
            <input className="mt-1" name="pickup" type="checkbox" />
            {siteCopy.checkout.pickup}
          </label>
        ) : null}
        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={items.length === 0 || state.status === "loading"}
          type="submit"
        >
          <CreditCard aria-hidden="true" size={18} />
          {siteCopy.checkout.pay}
        </button>
        {state.message ? <p aria-live="polite" className="text-sm text-red-100" role="status">{state.message}</p> : null}
      </form>
    </div>
  );
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as { message?: string; initPoint?: string };
  } catch {
    return {};
  }
}

function CheckoutField({
  autoComplete,
  label,
  name,
  required,
  type = "text"
}: {
  autoComplete?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  const id = `checkout-${name}`;
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold uppercase" htmlFor={id}>
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className="focus-ring min-h-11 rounded-[8px] border border-white/15 bg-black/30 px-3"
        id={id}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}
