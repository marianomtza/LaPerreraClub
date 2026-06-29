import type { Metadata } from "next";
import Link from "next/link";
import { siteCopy } from "@/content/site-copy";
import { LaPerreraMark } from "@/components/brand/la-perrera-mark";
import { CheckoutClient } from "@/components/store/checkout-client";
import { getStoreSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: siteCopy.checkout.metadata.title,
  robots: { index: false, follow: false }
};

export default async function CheckoutPage() {
  const store = await getStoreSettings();

  return (
    <main className="shell min-h-[72vh] py-16">
      <section className="mb-10 grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <LaPerreraMark className="text-[32px]" />
        </div>
        <div>
          <p className="w-fit rotate-[-1deg] bg-[var(--paper)] px-3 py-1 font-mono text-xs font-black uppercase text-black">
            {siteCopy.checkout.eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">{siteCopy.checkout.title}</h1>
          <p className="area-italic mt-4 max-w-2xl text-xl text-[var(--muted)]">
            {siteCopy.checkout.copy}
          </p>
        </div>
      </section>
      <CheckoutClient pickupEnabled={store.pickupEnabled === true} />
      <nav className="mt-10 flex flex-wrap gap-4 text-sm font-black uppercase text-white/72" aria-label="Información de compra">
        <Link className="focus-ring hover:text-white" href="/envios-y-devoluciones">
          {siteCopy.global.footer.links.shipping}
        </Link>
        <Link className="focus-ring hover:text-white" href="/privacidad">
          {siteCopy.global.footer.links.privacy}
        </Link>
        <Link className="focus-ring hover:text-white" href="/terminos">
          {siteCopy.global.footer.links.terms}
        </Link>
      </nav>
    </main>
  );
}
