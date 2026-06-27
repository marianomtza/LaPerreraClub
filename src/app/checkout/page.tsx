import type { Metadata } from "next";
import { CheckoutClient } from "@/components/store/checkout-client";
import { XosaMark } from "@/components/brand/xosa-mark";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false }
};

export default function CheckoutPage() {
  return (
    <main className="shell min-h-[72vh] py-16">
      <section className="mb-10 grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div className="max-w-sm">
          <XosaMark priority />
        </div>
        <div>
          <p className="w-fit rotate-[-1deg] bg-[var(--paper)] px-3 py-1 font-mono text-xs font-black uppercase text-black">
            Checkout
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">Confirmar pedido</h1>
          <p className="area-italic mt-4 max-w-2xl text-xl text-[var(--muted)]">
            El servidor valida precio, inventario y envío antes de abrir Mercado Pago.
          </p>
        </div>
      </section>
      <CheckoutClient />
    </main>
  );
}
