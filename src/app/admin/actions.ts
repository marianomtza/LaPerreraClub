"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requestAdminMagicLink, requireAdminUser } from "@/lib/auth";
import { RESERVED_SLUGS } from "@/lib/constants";
import { toCentsFromPesos } from "@/lib/money";
import { normalizeSlug } from "@/lib/url";
import { getServiceSupabase } from "@/lib/supabase/server";
import { bookingStatusSchema, productSchema, publicationSchema, specialPageSchema } from "@/lib/validation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function nullableDate(valueToParse: string) {
  return valueToParse ? new Date(valueToParse).toISOString() : null;
}

function redirectAdmin(message: string, type: "message" | "error" = "message"): never {
  redirect(`/admin?${type}=${encodeURIComponent(message)}`);
}

async function serviceClientOrRedirect() {
  await requireAdminUser();
  const supabase = getServiceSupabase();
  if (!supabase) redirectAdmin("Supabase Service Role no está configurado.", "error");
  return supabase;
}

export async function loginAction(formData: FormData) {
  const email = value(formData, "email");
  const result = await requestAdminMagicLink(email);
  redirectAdmin(result.message, result.ok ? "message" : "error");
}

export async function signOutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function upsertSettingAction(formData: FormData) {
  const supabase = await serviceClientOrRedirect();
  const key = value(formData, "key");
  const raw = value(formData, "value");

  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    redirectAdmin("El JSON no es válido.", "error");
  }

  const { error } = await supabase.from("site_settings").upsert({ key, value: parsed }, { onConflict: "key" });
  if (error) redirectAdmin(error.message, "error");

  revalidatePath("/");
  revalidatePath("/xosa");
  revalidatePath("/booking");
  redirectAdmin("Ajuste guardado.");
}

export async function createPublicationAction(formData: FormData) {
  const supabase = await serviceClientOrRedirect();
  const parsed = publicationSchema.safeParse({
    title: value(formData, "title"),
    type: value(formData, "type"),
    excerpt: value(formData, "excerpt"),
    content: value(formData, "content"),
    coverUrl: value(formData, "coverUrl"),
    videoUrl: value(formData, "videoUrl"),
    actionLabel: value(formData, "actionLabel"),
    actionUrl: value(formData, "actionUrl"),
    locations: formData.getAll("locations").map(String),
    state: value(formData, "state"),
    publishedAt: value(formData, "publishedAt"),
    expiresAt: value(formData, "expiresAt"),
    sortOrder: Number(value(formData, "sortOrder") || 0),
    isFeatured: checkbox(formData, "isFeatured")
  });

  if (!parsed.success) redirectAdmin(parsed.error.issues[0]?.message || "Publicación inválida.", "error");

  const publication = parsed.data;
  const { error } = await supabase.from("publications").insert({
    title: publication.title,
    type: publication.type,
    excerpt: publication.excerpt,
    content: publication.content,
    cover_url: publication.coverUrl || null,
    video_url: publication.videoUrl || null,
    action_label: publication.actionLabel || null,
    action_url: publication.actionUrl || null,
    locations: publication.locations.length ? publication.locations : ["inicio"],
    state: publication.state,
    published_at: nullableDate(publication.publishedAt),
    expires_at: nullableDate(publication.expiresAt),
    sort_order: publication.sortOrder,
    is_featured: publication.isFeatured
  });

  if (error) redirectAdmin(error.message, "error");
  revalidatePath("/");
  revalidatePath("/xosa");
  redirectAdmin("Publicación creada.");
}

export async function createSpecialPageAction(formData: FormData) {
  const supabase = await serviceClientOrRedirect();
  const slug = normalizeSlug(value(formData, "slug"));

  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
    redirectAdmin("Ese slug está reservado por el sistema.", "error");
  }

  const parsed = specialPageSchema.safeParse({
    title: value(formData, "title"),
    slug,
    description: value(formData, "description"),
    state: value(formData, "state"),
    publishedAt: value(formData, "publishedAt"),
    expiresAt: value(formData, "expiresAt"),
    seoTitle: value(formData, "seoTitle"),
    seoDescription: value(formData, "seoDescription"),
    blocksJson: value(formData, "blocksJson") || "[]"
  });

  if (!parsed.success) redirectAdmin(parsed.error.issues[0]?.message || "Página inválida.", "error");

  let blocks: Array<{ type: string; data: Record<string, unknown>; isActive?: boolean }>;
  try {
    const parsedBlocks = JSON.parse(parsed.data.blocksJson) as unknown;
    blocks = Array.isArray(parsedBlocks) ? (parsedBlocks as typeof blocks) : [];
  } catch {
    redirectAdmin("Los bloques deben ser JSON válido.", "error");
  }

  const { data: page, error } = await supabase
    .from("special_pages")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      state: parsed.data.state,
      published_at: nullableDate(parsed.data.publishedAt),
      expires_at: nullableDate(parsed.data.expiresAt),
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null
    })
    .select("*")
    .single();

  if (error || !page) redirectAdmin(error?.message || "No se pudo crear la página.", "error");

  if (blocks.length > 0) {
    const { error: blockError } = await supabase.from("special_page_blocks").insert(
      blocks.map((block, index) => ({
        page_id: page.id,
        type: block.type,
        data: block.data || {},
        sort_order: index,
        is_active: block.isActive !== false
      }))
    );
    if (blockError) redirectAdmin(blockError.message, "error");
  }

  revalidatePath(`/${parsed.data.slug}`);
  redirectAdmin("Página especial creada.");
}

export async function createProductAction(formData: FormData) {
  const supabase = await serviceClientOrRedirect();
  const priceCents = toCentsFromPesos(value(formData, "priceMx"));
  const parsed = productSchema.safeParse({
    name: value(formData, "name"),
    slug: normalizeSlug(value(formData, "slug")),
    description: value(formData, "description"),
    status: value(formData, "status"),
    priceMx: Number(value(formData, "priceMx")),
    sku: value(formData, "sku"),
    stock: Number(value(formData, "stock") || 0),
    imageUrl: value(formData, "imageUrl"),
    isFeatured: checkbox(formData, "isFeatured")
  });

  if (!parsed.success || priceCents === null) {
    redirectAdmin(parsed.error?.issues[0]?.message || "Producto inválido.", "error");
  }

  const product = parsed.data;
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      slug: product.slug,
      description: product.description,
      status: product.status,
      image_url: product.imageUrl || null,
      is_featured: product.isFeatured
    })
    .select("*")
    .single();

  if (error || !data) redirectAdmin(error?.message || "No se pudo crear el producto.", "error");

  const { error: variantError } = await supabase.from("product_variants").insert({
    product_id: data.id,
    name: "Única",
    sku: product.sku || null,
    price_cents: priceCents,
    stock_quantity: product.stock
  });

  if (variantError) redirectAdmin(variantError.message, "error");
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath(`/tienda/${product.slug}`);
  redirectAdmin("Producto creado.");
}

export async function updateBookingStatusAction(formData: FormData) {
  const supabase = await serviceClientOrRedirect();
  const parsed = bookingStatusSchema.safeParse({
    bookingId: value(formData, "bookingId"),
    status: value(formData, "status"),
    note: value(formData, "note")
  });

  if (!parsed.success) redirectAdmin(parsed.error.issues[0]?.message || "Estado inválido.", "error");

  const { error } = await supabase
    .from("booking_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.bookingId);

  if (error) redirectAdmin(error.message, "error");

  if (parsed.data.note) {
    await supabase.from("admin_notes").insert({
      subject_type: "booking_request",
      subject_id: parsed.data.bookingId,
      body: parsed.data.note
    });
  }

  revalidatePath("/admin");
  redirectAdmin("Booking actualizado.");
}

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = await serviceClientOrRedirect();
  const orderId = value(formData, "orderId");
  const status = value(formData, "status");

  const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", orderId);
  if (error) redirectAdmin(error.message, "error");

  revalidatePath("/admin");
  redirectAdmin("Pedido actualizado.");
}
