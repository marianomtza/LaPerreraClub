import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await getProducts();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/xosa`, lastModified: now },
    { url: `${base}/tienda`, lastModified: now },
    { url: `${base}/booking`, lastModified: now },
    ...products.map((product) => ({
      url: `${base}/tienda/${product.slug}`,
      lastModified: new Date(product.created_at)
    }))
  ];
}
