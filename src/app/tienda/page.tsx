import type { Metadata } from "next";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getProducts, getStoreSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Productos y drops publicados por La Perrera Club."
};

export default async function StorePage() {
  const [products, store] = await Promise.all([getProducts(), getStoreSettings()]);

  return (
    <main className="shell min-h-[72vh] py-16">
      <SectionHeading
        eyebrow="Tienda"
        title="Productos publicados"
        copy="Ropa, objetos, piezas funcionales y drops activos aparecen aquí cuando se publican desde el panel."
      />
      {products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="panel p-6 text-[var(--muted)]">
          {store.emptyMessage || "La tienda se activa cuando haya productos publicados desde el panel."}
        </div>
      )}
    </main>
  );
}
