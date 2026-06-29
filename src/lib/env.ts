const PRODUCTION_FALLBACK_URL = "https://la-perrera-club.invalid";

function normalizePublicUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.origin.replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function getSiteUrl() {
  const explicitUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicitUrl) return explicitUrl;

  if (isProduction()) {
    const vercelUrl =
      normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
      normalizePublicUrl(process.env.VERCEL_URL);
    if (vercelUrl) return vercelUrl;

    console.warn("NEXT_PUBLIC_SITE_URL is missing in production; using non-local fallback.");
    return PRODUCTION_FALLBACK_URL;
  }

  return "http://localhost:3000";
}

export function getPublicEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getServerEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getAdminEmails() {
  return getServerEnv("ADMIN_EMAILS")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
}

export function isAdminEmailAllowed(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return getAdminEmails().includes(normalized);
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
