export const RESERVED_SLUGS = [
  "xosa",
  "tienda",
  "booking",
  "checkout",
  "admin",
  "api",
  "contacto",
  "privacidad",
  "terminos"
] as const;

export const ORDER_STATUSES = [
  "pendiente",
  "pagado",
  "en_preparacion",
  "enviado",
  "entregado",
  "cancelado",
  "reembolsado"
] as const;

export const PAYMENT_STATUSES = [
  "pendiente",
  "aprobado",
  "rechazado",
  "cancelado",
  "reembolsado"
] as const;

export const PUBLICATION_STATES = [
  "borrador",
  "programado",
  "publicado",
  "retirado"
] as const;

export const BOOKING_STATES = [
  "nueva",
  "revisando",
  "contactada",
  "en_negociacion",
  "confirmada",
  "rechazada",
  "archivada"
] as const;

export const SYSTEM_SETTING_KEYS = [
  "home",
  "xosa",
  "booking",
  "store",
  "contacts",
  "seo",
  "empty_states",
  "shipping"
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PublicationState = (typeof PUBLICATION_STATES)[number];
export type BookingState = (typeof BOOKING_STATES)[number];
