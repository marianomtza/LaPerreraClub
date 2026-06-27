import { z } from "zod";
import { BOOKING_STATES, ORDER_STATUSES, PAYMENT_STATUSES, PUBLICATION_STATES } from "@/lib/constants";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine((value) => !value || value.startsWith("/") || /^https?:\/\//.test(value), {
    message: "Usa una URL válida."
  });

export const clubSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  email: z.email("Escribe un correo válido.").max(180),
  city: z.string().trim().min(2, "Escribe tu ciudad.").max(120),
  socialHandle: z.string().trim().max(120).optional().default(""),
  discoverySource: z.string().trim().min(2, "Cuéntanos cómo llegaste.").max(220),
  consent: z.literal(true, { error: "Necesitamos tu consentimiento para escribirte." }),
  website: z.string().trim().max(0).optional().default("")
});

export const bookingRequestSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(140),
  company: z.string().trim().min(2, "Escribe la empresa o proyecto.").max(160),
  email: z.email("Escribe un correo válido.").max(180),
  phone: z.string().trim().min(8, "Agrega un teléfono o WhatsApp.").max(80),
  city: z.string().trim().min(2, "Escribe la ciudad.").max(120),
  venue: z.string().trim().min(2, "Escribe el recinto o lugar.").max(160),
  proposedDate: z.string().trim().min(4, "Agrega una fecha tentativa.").max(80),
  eventType: z.string().trim().min(2, "Indica el tipo de evento.").max(120),
  capacity: z.string().trim().min(1, "Indica el aforo estimado.").max(80),
  budget: z.string().trim().min(1, "Indica un presupuesto aproximado.").max(80),
  message: z.string().trim().min(10, "Agrega un poco más de contexto.").max(1600),
  consent: z.literal(true, { error: "Necesitamos tu consentimiento para contactarte." }),
  website: z.string().trim().max(0).optional().default("")
});

export const checkoutItemSchema = z.object({
  variantId: z.uuid(),
  quantity: z.number().int().min(1).max(20)
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customer: z.object({
    name: z.string().trim().min(2).max(140),
    email: z.email().max(180),
    phone: z.string().trim().min(8).max(80),
    address: z.string().trim().min(8).max(500),
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(120),
    postalCode: z.string().trim().min(4).max(20),
    notes: z.string().trim().max(500).optional().default("")
  }),
  pickup: z.boolean().optional().default(false)
});

export const publicationSchema = z.object({
  title: z.string().trim().min(2).max(180),
  type: z.string().trim().min(2).max(80),
  excerpt: z.string().trim().max(280).optional().default(""),
  content: z.string().trim().max(4000).optional().default(""),
  coverUrl: optionalUrl,
  videoUrl: optionalUrl,
  actionLabel: z.string().trim().max(80).optional().default(""),
  actionUrl: optionalUrl,
  locations: z.array(z.string()).default(["inicio"]),
  state: z.enum(PUBLICATION_STATES).default("borrador"),
  publishedAt: z.string().optional().default(""),
  expiresAt: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false)
});

export const specialPageSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(80),
  description: z.string().trim().max(220).optional().default(""),
  state: z.enum(PUBLICATION_STATES).default("borrador"),
  publishedAt: z.string().optional().default(""),
  expiresAt: z.string().optional().default(""),
  seoTitle: z.string().trim().max(90).optional().default(""),
  seoDescription: z.string().trim().max(180).optional().default(""),
  blocksJson: z.string().trim().default("[]")
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(80),
  description: z.string().trim().max(2200).optional().default(""),
  status: z.enum(["borrador", "publicado", "agotado", "proximamente", "retirado"]).default("borrador"),
  priceMx: z.number().min(0),
  sku: z.string().trim().max(80).optional().default(""),
  stock: z.number().int().min(0).default(0),
  imageUrl: optionalUrl,
  isFeatured: z.boolean().default(false)
});

export const orderStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(ORDER_STATUSES)
});

export const paymentStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(PAYMENT_STATUSES)
});

export const bookingStatusSchema = z.object({
  bookingId: z.uuid(),
  status: z.enum(BOOKING_STATES),
  note: z.string().trim().max(1200).optional().default("")
});
