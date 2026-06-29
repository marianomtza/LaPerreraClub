import type { Metadata } from "next";
import Link from "next/link";
import { siteCopy } from "@/content/site-copy";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getProducts, getStoreSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: siteCopy.store.metadata.title,
  description: siteCopy.store.metadata.description,
  alternates: {
    canonical: "/tienda"
  }
};

export default async function StorePage() {
  const [products, store] = await Promise.all([getProducts(), getStoreSettings()]);

  return (
    <main className="shell min-h-[72vh] py-16">
      <SectionHeading
        eyebrow={siteCopy.store.eyebrow}
        title={siteCopy.store.title}
        copy={siteCopy.store.copy}
      />
      {products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="panel p-6 text-[var(--muted)]">
          {store.emptyMessage || siteCopy.store.empty}
        </div>
      )}
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
