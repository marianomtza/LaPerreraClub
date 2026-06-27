"use client";

import { CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/store/cart-provider";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/money";

type CheckoutState = {
  status: "idle" | "loading" | "error";
  message: string;
};

export function CheckoutClient() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [state, setState] = useState<CheckoutState>({ status: "idle", message: "" });
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0), [items]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Validando pedido..." });
    trackEvent("checkout_start", { itemCount: items.length, subtotal });

    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

    const result = (await response.json()) as { message?: string; initPoint?: string };

    if (!response.ok || !result.initPoint) {
      setState({ status: "error", message: result.message || "No se pudo iniciar el checkout." });
      return;
    }

    clearCart();
    window.location.assign(result.initPoint);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="grid gap-3">
        {items.length === 0 ? (
          <div className="panel p-6">
            <p className="font-black uppercase text-white">Tu carrito está vacío.</p>
            <p className="mt-2 text-[var(--muted)]">Cuando haya productos publicados, agrégalos desde Tienda.</p>
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
          <span>Subtotal</span>
          <span className="font-mono">{formatMoney(subtotal)}</span>
        </div>
      </section>

      <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
        <p className="font-mono text-xs font-black uppercase text-[var(--accent)]">Datos de entrega</p>
        <div className="grid gap-2 md:grid-cols-2">
          <CheckoutField label="Nombre" name="name" required />
          <CheckoutField label="Correo" name="email" required type="email" />
          <CheckoutField label="Teléfono" name="phone" required />
          <CheckoutField label="Código postal" name="postalCode" required />
          <CheckoutField label="Ciudad" name="city" required />
          <CheckoutField label="Estado" name="state" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-bold uppercase" htmlFor="checkout-address">
            Dirección
          </label>
          <textarea
            className="focus-ring min-h-24 rounded-[8px] border border-white/15 bg-black/30 px-3 py-3"
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
        <label className="flex items-start gap-3 text-sm text-white/78">
          <input className="mt-1" name="pickup" type="checkbox" />
          Solicitar recolección si está habilitada.
        </label>
        <button
          className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={items.length === 0 || state.status === "loading"}
          type="submit"
        >
          <CreditCard aria-hidden="true" size={18} />
          Pagar con Mercado Pago
        </button>
        {state.message ? <p className="text-sm text-red-100" role="status">{state.message}</p> : null}
      </form>
    </div>
  );
}

function CheckoutField({
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
  const id = `checkout-${name}`;
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold uppercase" htmlFor={id}>
        {label}
      </label>
      <input
        className="focus-ring min-h-11 rounded-[8px] border border-white/15 bg-black/30 px-3"
        id={id}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}
