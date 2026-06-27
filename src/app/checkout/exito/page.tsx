import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout exitoso",
  robots: { index: false, follow: false }
};

export default function CheckoutSuccessPage() {
  return <CheckoutState title="Pago recibido" copy="Si Mercado Pago aprobó la operación, el pedido quedará confirmado por webhook y recibirás un correo cuando Resend esté configurado." />;
}

function CheckoutState({ title, copy }: { title: string; copy: string }) {
  return (
    <main className="shell flex min-h-[72vh] flex-col items-start justify-center gap-5 py-16">
      <p className="font-mono text-xs uppercase text-[var(--accent)]">Checkout</p>
      <h1 className="text-5xl font-black uppercase leading-none md:text-7xl">{title}</h1>
      <p className="max-w-2xl text-lg text-[var(--muted)]">{copy}</p>
      <Link className="focus-ring inline-flex min-h-11 items-center rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]" href="/tienda">
        Volver a la tienda
      </Link>
    </main>
  );
}
