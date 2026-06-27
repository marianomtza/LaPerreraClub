import Link from "next/link";
import type { ProductWithVariants } from "@/lib/content-types";
import { formatMoney } from "@/lib/money";
import { SmartImage } from "@/components/media/smart-image";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const firstVariant = product.variants[0];
  const label =
    product.status === "agotado" ? "Agotado" : product.status === "proximamente" ? "Próximamente" : "Disponible";

  return (
    <article className="panel overflow-hidden transition hover:-translate-y-1 hover:border-[var(--accent)]">
      <Link className="focus-ring block" href={`/tienda/${product.slug}`}>
        {product.image_url ? (
          <SmartImage
            alt={product.name}
            className="aspect-square w-full object-cover"
            height={900}
            src={product.image_url}
            width={900}
          />
        ) : (
          <div className="hero-fallback aspect-square" />
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black uppercase leading-tight">{product.name}</h3>
          <span className="rounded-[4px] border border-white/15 px-2 py-1 font-mono text-[11px] uppercase text-white/70">
            {label}
          </span>
        </div>
        {firstVariant ? <p className="mt-4 font-mono text-lg">{formatMoney(firstVariant.price_cents)}</p> : null}
        <Link
          className="focus-ring mt-5 inline-flex min-h-10 items-center rounded-[4px] border border-white/15 px-3 text-sm font-black uppercase"
          href={`/tienda/${product.slug}`}
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}
