export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
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
    .filter(Boolean);
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
