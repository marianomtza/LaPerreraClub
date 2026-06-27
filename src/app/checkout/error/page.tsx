import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pago no completado",
  robots: { index: false, follow: false }
};

export default function CheckoutErrorPage() {
  return (
    <main className="shell flex min-h-[72vh] flex-col items-start justify-center gap-5 py-16">
      <p className="font-mono text-xs uppercase text-[var(--accent)]">Checkout</p>
      <h1 className="text-5xl font-black uppercase leading-none md:text-7xl">Pago no completado</h1>
      <p className="max-w-2xl text-lg text-[var(--muted)]">
        No se marcó ningún pedido como pagado desde el navegador. Puedes intentarlo de nuevo desde el carrito.
      </p>
      <Link className="focus-ring inline-flex min-h-11 items-center rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]" href="/checkout">
        Volver al carrito
      </Link>
    </main>
  );
}
