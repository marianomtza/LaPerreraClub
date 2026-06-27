import fs from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { RESERVED_SLUGS } from "@/lib/constants";
import type {
  BookingSettings,
  HomeSettings,
  Product,
  ProductVariant,
  ProductWithVariants,
  Publication,
  SeoSettings,
  SpecialPage,
  SpecialPageBlock,
  StoreSettings,
  XosaSettings
} from "@/lib/content-types";
import { getPublicSupabase, getServiceSupabase } from "@/lib/supabase/server";

type SettingRow = {
  key: string;
  value: unknown;
};

const DEFAULT_HOME_SETTINGS: HomeSettings = {
  hero: {
    title: "LA PERRERA CLUB",
    eyebrow: "XOSA / LA PERRERA / CANDELA",
    primaryLabel: "Entrar al club",
    primaryHref: "/#club",
    secondaryLabel: "Ver XOSA",
    secondaryHref: "/xosa",
    videoUrl: "/LAPERRERAANIM0001-0160.mp4",
    posterUrl: "/VISUALSHOW1-poster.webp",
    statusItems: ["LA PERRERA PRESENTA: VOL. I", "XOSA EN STREAMING", "BOOKING ABIERTO"]
  },
  activeRelease: {
    title: "La Perrera presenta: Vol. I",
    description: "El punto de entrada al universo de XOSA, Candela y La Perrera.",
    coverUrl: "/assets/la-perrera-cover-2026.webp",
    spotifyUrl: "https://open.spotify.com/artist/4qSk9MT1h4mKVB1cVLvGpK",
    appleMusicUrl: "https://music.apple.com/es/artist/xosa/1638131386",
    youtubeUrl: "https://www.youtube.com/channel/UCtVKTqzaHXflUoB7sAzxcKA"
  },
  modules: {
    release: true,
    xosa: true,
    dates: true,
    store: true,
    publications: true,
    club: true,
    booking: true
  }
};

const DEFAULT_XOSA_SETTINGS: XosaSettings = {
  title: "XOSA",
  bio: "Proyecto musical y figura principal actual de La Perrera Club: show, club, reggaetón mexicano y cultura digital desde la noche.",
  heroImageUrl: "/assets/booking-xosa.webp",
  showDescription: "Presentación enfocada en club, perreo y energía directa con la audiencia.",
  showDuration: "A confirmar por evento",
  showFormat: "Show / DJ set / experiencia club",
  pressKitUrl: "/assets/booking-xosa.webp",
  release: {
    title: "La Perrera presenta: Vol. I",
    description: "Lanzamiento visual y musical del universo La Perrera.",
    coverUrl: "/assets/la-perrera-cover-2026.webp",
    spotifyUrl: "https://open.spotify.com/artist/4qSk9MT1h4mKVB1cVLvGpK",
    appleMusicUrl: "https://music.apple.com/es/artist/xosa/1638131386",
    youtubeUrl: "https://www.youtube.com/channel/UCtVKTqzaHXflUoB7sAzxcKA"
  },
  links: [
    { label: "Spotify", platform: "spotify", url: "https://open.spotify.com/artist/4qSk9MT1h4mKVB1cVLvGpK" },
    { label: "Apple Music", platform: "apple_music", url: "https://music.apple.com/es/artist/xosa/1638131386" },
    { label: "YouTube", platform: "youtube", url: "https://www.youtube.com/channel/UCtVKTqzaHXflUoB7sAzxcKA" },
    { label: "Instagram", platform: "instagram", url: "https://www.instagram.com/xosababyy/" },
    { label: "TikTok", platform: "tiktok", url: "https://www.tiktok.com/@xosababyy/" }
  ],
  videos: [],
  photos: [
    { label: "Booking XOSA", url: "/assets/booking-xosa.webp" },
    { label: "La Perrera Vol. I", url: "/assets/la-perrera-cover-2026.webp" },
    { label: "La Perrera presenta", url: "/assets/la-perrera-presenta.webp" }
  ],
  metrics: []
};

const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  intro:
    "Portal profesional para contratar a XOSA y activar experiencias de La Perrera. La solicitud no confirma disponibilidad ni cotización automática.",
  pressKitUrl: "/assets/booking-xosa.webp",
  assetsUrl: "/assets/booking-xosa.webp"
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  emptyMessage:
    "El drop todavía no está publicado. Cuando haya productos reales desde el panel, aparecerán aquí sin cambiar código."
};

const DEFAULT_SEO_SETTINGS: SeoSettings = {
  title: "La Perrera Club",
  description: "Música, comunidad, productos y booking desde el universo de XOSA y La Perrera.",
  imageUrl: "/assets/og-la-perrera.webp"
};

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  return fallback;
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  noStore();
  const supabase = getPublicSupabase();
  if (!supabase) return fallback;

  const { data, error } = await supabase.from("site_settings").select("key,value").eq("key", key).maybeSingle();
  if (error || !data) return fallback;
  return asObject<T>((data as SettingRow).value, fallback);
}

export async function getHomeSettings() {
  return getSetting<HomeSettings>("home", DEFAULT_HOME_SETTINGS);
}

export async function getXosaSettings() {
  return getSetting<XosaSettings>("xosa", DEFAULT_XOSA_SETTINGS);
}

export async function getBookingSettings() {
  return getSetting<BookingSettings>("booking", DEFAULT_BOOKING_SETTINGS);
}

export async function getStoreSettings() {
  return getSetting<StoreSettings>("store", DEFAULT_STORE_SETTINGS);
}

export async function getSeoSettings() {
  return getSetting<SeoSettings>("seo", DEFAULT_SEO_SETTINGS);
}

export function getLocalHeroVideo() {
  const candidate = path.join(process.cwd(), "public", "VISUALSHOW1.mp4");
  return fs.existsSync(candidate) ? "/VISUALSHOW1.mp4" : "";
}

export function getLocalHeroPoster() {
  const poster = path.join(process.cwd(), "public", "VISUALSHOW1-poster.webp");
  return fs.existsSync(poster) ? "/VISUALSHOW1-poster.webp" : "";
}

export async function getActivePublications(location: string) {
  noStore();
  const supabase = getPublicSupabase();
  if (!supabase) return [] as Publication[];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("state", "publicado")
    .contains("locations", [location])
    .or(`published_at.is.null,published_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data as Publication[];
}

export async function getProducts(options?: { featuredOnly?: boolean; limit?: number }) {
  noStore();
  const supabase = getPublicSupabase();
  if (!supabase) return [] as ProductWithVariants[];

  let query = supabase
    .from("products")
    .select("*, product_variants(*)")
    .in("status", ["publicado", "agotado", "proximamente"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const product = row as Product & { product_variants?: ProductVariant[] };
    return {
      ...product,
      variants: product.product_variants?.filter((variant) => variant.is_active) || []
    };
  });
}

export async function getProductBySlug(slug: string) {
  noStore();
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .in("status", ["publicado", "agotado", "proximamente"])
    .maybeSingle();

  if (error || !data) return null;

  const product = data as Product & { product_variants?: ProductVariant[] };
  return {
    ...product,
    variants: product.product_variants?.filter((variant) => variant.is_active) || []
  } satisfies ProductWithVariants;
}

export async function getCartVariants(variantIds: string[]) {
  const supabase = getServiceSupabase();
  if (!supabase || variantIds.length === 0) return [];

  const { data, error } = await supabase
    .from("product_variants")
    .select("*, products(*)")
    .in("id", variantIds)
    .eq("is_active", true);

  if (error || !data) return [];
  return data as Array<ProductVariant & { products: Product }>;
}

export async function getSpecialPage(slug: string) {
  noStore();
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) return null;

  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("special_pages")
    .select("*, special_page_blocks(*)")
    .eq("slug", slug)
    .eq("state", "publicado")
    .or(`published_at.is.null,published_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Omit<SpecialPage, "blocks"> & { special_page_blocks?: SpecialPageBlock[] };
  return {
    ...row,
    blocks: (row.special_page_blocks || [])
      .filter((block) => block.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  } satisfies SpecialPage;
}

export async function getAdminCollections() {
  noStore();
  const supabase = getServiceSupabase();
  if (!supabase) {
    return {
      publications: [],
      pages: [],
      products: [],
      orders: [],
      bookings: [],
      club: []
    };
  }

  const [publications, pages, products, orders, bookings, club] = await Promise.all([
    supabase.from("publications").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("special_pages").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("products").select("*, product_variants(*)").order("created_at", { ascending: false }).limit(20),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("booking_requests").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("club_submissions").select("*").order("created_at", { ascending: false }).limit(20)
  ]);

  return {
    publications: publications.data || [],
    pages: pages.data || [],
    products: products.data || [],
    orders: orders.data || [],
    bookings: bookings.data || [],
    club: club.data || []
  };
}
