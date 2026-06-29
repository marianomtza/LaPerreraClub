import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteCopy } from "@/content/site-copy";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { SmartImage } from "@/components/media/smart-image";
import { getProductBySlug } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description || `Producto publicado en La Perrera Club.`,
    openGraph: {
      images: product.image_url ? [{ url: product.image_url }] : []
    },
    alternates: {
      canonical: `/tienda/${product.slug}`
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const available = product.status === "publicado";

  return (
    <main className="shell grid gap-10 py-16 lg:grid-cols-[1fr_0.85fr]">
      <div className="panel overflow-hidden">
        {product.image_url ? (
          <SmartImage
            alt={product.name}
            className="aspect-square w-full object-cover"
            height={1100}
            priority
            src={product.image_url}
            width={1100}
          />
        ) : (
          <div className="hero-fallback aspect-square" />
        )}
      </div>
      <section>
        <p className="font-mono text-xs uppercase text-[var(--accent)]">Tienda</p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-none md:text-7xl">{product.name}</h1>
        {product.description ? <p className="mt-6 text-lg text-[var(--muted)]">{product.description}</p> : null}
        <div className="mt-8 grid gap-3">
          {product.variants.map((variant) => {
            const soldOut = product.status === "agotado" || (variant.track_inventory && variant.stock_quantity <= 0);
            const availability = soldOut
              ? siteCopy.store.status.soldOut
              : product.status === "proximamente"
                ? siteCopy.store.status.comingSoon
                : variant.track_inventory && variant.stock_quantity <= 5
                  ? siteCopy.store.status.lowStock
                  : siteCopy.store.status.available;
            return (
              <div className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between" key={variant.id}>
                <div>
                  <p className="font-black uppercase">{variant.name}</p>
                  <p className="font-mono text-lg">{formatMoney(variant.price_cents, variant.currency)}</p>
                  <p className="text-sm text-[var(--muted)]">{availability}</p>
                </div>
                <AddToCartButton
                  disabled={!available || soldOut}
                  imageUrl={product.image_url}
                  name={product.name}
                  priceCents={variant.price_cents}
                  variantId={variant.id}
                  variantName={variant.name}
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
