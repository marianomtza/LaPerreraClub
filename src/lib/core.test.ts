import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RESERVED_SLUGS } from "./constants";
import { getSiteUrl, isAdminEmailAllowed } from "./env";
import { formatMoney, toCentsFromPesos } from "./money";
import { isSpotifyReleaseUrl } from "@/components/music/music-embeds";
import { normalizeSlug, isSafeHref } from "./url";
import { bookingRequestSchema, clubSubmissionSchema, checkoutSchema } from "./validation";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("reglas base de La Perrera Club", () => {
  it("normaliza slugs y mantiene reservados visibles", () => {
    expect(normalizeSlug("La Perrera Vol. I")).toBe("la-perrera-vol-i");
    expect(RESERVED_SLUGS).toContain("checkout");
  });

  it("solo permite enlaces públicos seguros", () => {
    expect(isSafeHref("/booking")).toBe(true);
    expect(isSafeHref("https://open.spotify.com/artist/demo")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
  });

  it("convierte dinero a centavos enteros", () => {
    expect(toCentsFromPesos("499")).toBe(49900);
    expect(formatMoney(49900)).toContain("$499");
  });

  it("rechaza el honeypot del formulario del Club", () => {
    const result = clubSubmissionSchema.safeParse({
      name: "Mariano",
      email: "m@example.com",
      city: "CDMX",
      socialHandle: "@x",
      discoverySource: "Instagram",
      consent: true,
      website: "bot"
    });

    expect(result.success).toBe(false);
  });

  it("permite Club con nombre y origen opcionales", () => {
    const result = clubSubmissionSchema.safeParse({
      email: "m@example.com",
      city: "CDMX",
      consent: true
    });

    expect(result.success).toBe(true);
  });

  it("valida booking con fecha, tipo y presupuesto controlados", () => {
    const result = bookingRequestSchema.safeParse({
      name: "Promotor",
      email: "booking@example.com",
      phone: "5512345678",
      city: "CDMX",
      proposedDate: "2026-08-20",
      eventType: "Festival",
      capacity: "1200",
      budget: "$60,000 - $120,000 MXN",
      consent: true
    });

    expect(result.success).toBe(true);
  });

  it("valida que checkout tenga productos y cliente", () => {
    const result = checkoutSchema.safeParse({
      items: [{ variantId: "7fbbf826-71e1-41c7-95c6-b4df18dc3c4d", quantity: 1 }],
      customer: {
        name: "Cliente",
        email: "cliente@example.com",
        phone: "5512345678",
        address: "Calle de prueba 123",
        city: "CDMX",
        state: "CDMX",
        postalCode: "01000"
      }
    });

    expect(result.success).toBe(true);
  });

  it("normaliza URL publica sin usar localhost en produccion", () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "la-perrera.club"
    };

    expect(getSiteUrl()).toBe("https://la-perrera.club");
  });

  it("usa localhost solo en desarrollo local", () => {
    process.env = {
      ...process.env,
      NODE_ENV: "development",
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_URL: ""
    };

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("admin falla cerrado con lista vacia o correo no autorizado", () => {
    process.env.ADMIN_EMAILS = "";
    expect(isAdminEmailAllowed("admin@example.com")).toBe(false);

    process.env.ADMIN_EMAILS = "owner@example.com";
    expect(isAdminEmailAllowed("owner@example.com")).toBe(true);
    expect(isAdminEmailAllowed("other@example.com")).toBe(false);
  });

  it("solo incrusta URLs de lanzamientos de Spotify", () => {
    expect(isSpotifyReleaseUrl("https://open.spotify.com/album/demo")).toBe(true);
    expect(isSpotifyReleaseUrl("https://open.spotify.com/artist/demo")).toBe(false);
  });
});
