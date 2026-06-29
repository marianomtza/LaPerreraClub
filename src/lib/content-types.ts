export type LinkItem = {
  label: string;
  url: string;
  platform?: string;
};

export type HomeSettings = {
  hero?: {
    title?: string;
    eyebrow?: string;
    primaryLabel?: string;
    primaryHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
    videoUrl?: string;
    posterUrl?: string;
    statusItems?: string[];
  };
  activeRelease?: ReleaseContent | null;
  modules?: {
    release?: boolean;
    xosa?: boolean;
    dates?: boolean;
    store?: boolean;
    publications?: boolean;
    club?: boolean;
    booking?: boolean;
  };
};

export type ReleaseContent = {
  title: string;
  description?: string;
  coverUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  smartLinkUrl?: string;
  videoUrl?: string;
};

export type XosaSettings = {
  title?: string;
  bio?: string;
  heroImageUrl?: string;
  pressKitUrl?: string;
  riderUrl?: string;
  showDescription?: string;
  showDuration?: string;
  showFormat?: string;
  release?: ReleaseContent | null;
  links?: LinkItem[];
  videos?: LinkItem[];
  photos?: LinkItem[];
  metrics?: CounterContent[];
};

export type BookingSettings = {
  intro?: string;
  contactEmail?: string;
  pressKitUrl?: string;
  riderUrl?: string;
  assetsUrl?: string;
  responseTime?: string;
};

export type StoreSettings = {
  emptyMessage?: string;
  featuredProductIds?: string[];
  pickupEnabled?: boolean;
};

export type SeoSettings = {
  title?: string;
  description?: string;
  imageUrl?: string;
};

export type CounterContent = {
  label: string;
  value: number;
  source: string;
  updatedAt: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  kind?: "dato_real" | "meta" | "manual" | "sincronizado";
};

export type Publication = {
  id: string;
  title: string;
  type: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  video_url: string | null;
  action_label: string | null;
  action_url: string | null;
  locations: string[];
  published_at: string | null;
  expires_at: string | null;
  is_featured: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "borrador" | "publicado" | "agotado" | "proximamente" | "retirado";
  image_url: string | null;
  gallery: string[];
  is_featured: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_cents: number;
  currency: string;
  stock_quantity: number;
  track_inventory: boolean;
  is_active: boolean;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export type SpecialPage = {
  id: string;
  title: string;
  slug: string;
  description: string;
  seo_title: string | null;
  seo_description: string | null;
  blocks: SpecialPageBlock[];
};

export type SpecialPageBlock = {
  id: string;
  type: string;
  sort_order: number;
  is_active: boolean;
  data: Record<string, unknown>;
};
