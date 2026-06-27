import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pago pendiente",
  robots: { index: false, follow: false }
};

export default function CheckoutPendingPage() {
  return (
    <main className="shell flex min-h-[72vh] flex-col items-start justify-center gap-5 py-16">
      <p className="font-mono text-xs uppercase text-[var(--accent)]">Checkout</p>
      <h1 className="text-5xl font-black uppercase leading-none md:text-7xl">Pago pendiente</h1>
      <p className="max-w-2xl text-lg text-[var(--muted)]">
        Mercado Pago todavía no confirma el resultado. El pedido seguirá como pendiente hasta recibir el webhook.
      </p>
      <Link className="focus-ring inline-flex min-h-11 items-center rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase" href="/tienda">
        Volver a la tienda
      </Link>
    </main>
  );
}
