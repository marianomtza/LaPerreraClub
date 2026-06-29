import { getSiteUrl } from "@/lib/env";

export function isValidHttpUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeHref(value: string | null | undefined) {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isValidHttpUrl(value);
}

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function toAbsoluteUrl(path: string) {
  if (isValidHttpUrl(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
