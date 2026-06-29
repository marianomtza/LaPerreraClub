import type { MetadataRoute } from "next";
import { getProducts, getPublishedSpecialPages } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [products, specialPages] = await Promise.all([getProducts(), getPublishedSpecialPages()]);
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/xosa`, lastModified: now },
    { url: `${base}/tienda`, lastModified: now },
    { url: `${base}/booking`, lastModified: now },
    { url: `${base}/privacidad`, lastModified: now },
    { url: `${base}/terminos`, lastModified: now },
    { url: `${base}/envios-y-devoluciones`, lastModified: now },
    ...products.map((product) => ({
      url: `${base}/tienda/${product.slug}`,
      lastModified: new Date(product.created_at)
    })),
    ...specialPages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(page.updated_at || page.created_at || now)
    }))
  ];
}
