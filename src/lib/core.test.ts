import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS } from "./constants";
import { formatMoney, toCentsFromPesos } from "./money";
import { normalizeSlug, isSafeHref } from "./url";
import { clubSubmissionSchema, checkoutSchema } from "./validation";

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
});
