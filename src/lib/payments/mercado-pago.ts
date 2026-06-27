import crypto from "node:crypto";
import { getServerEnv, getSiteUrl } from "@/lib/env";
import { formatMoney } from "@/lib/money";

export type PreferenceItem = {
  title: string;
  quantity: number;
  unitPriceCents: number;
};

export type CreatePreferenceInput = {
  orderId: string;
  customerEmail: string;
  items: PreferenceItem[];
  shippingCents: number;
};

export async function createMercadoPagoPreference(input: CreatePreferenceInput) {
  const accessToken = getServerEnv("MERCADO_PAGO_ACCESS_TOKEN");
  if (!accessToken) {
    return { ok: false as const, message: "Mercado Pago no está configurado." };
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_reference: input.orderId,
      payer: { email: input.customerEmail },
      items: [
        ...input.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPriceCents / 100,
          currency_id: "MXN"
        })),
        ...(input.shippingCents > 0
          ? [
              {
                title: "Envío",
                quantity: 1,
                unit_price: input.shippingCents / 100,
                currency_id: "MXN"
              }
            ]
          : [])
      ],
      back_urls: {
        success: `${getSiteUrl()}/checkout/exito`,
        pending: `${getSiteUrl()}/checkout/pendiente`,
        failure: `${getSiteUrl()}/checkout/error`
      },
      notification_url: `${getSiteUrl()}/api/payments/mercado-pago`,
      statement_descriptor: "LA PERRERA CLUB",
      metadata: {
        order_id: input.orderId,
        total: formatMoney(
          input.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0) +
            input.shippingCents
        )
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    console.error("Mercado Pago rechazó la preferencia.", { status: response.status, message });
    return { ok: false as const, message: "No se pudo iniciar Mercado Pago." };
  }

  const data = (await response.json()) as { id: string; init_point?: string; sandbox_init_point?: string };
  return {
    ok: true as const,
    preferenceId: data.id,
    initPoint: data.init_point || data.sandbox_init_point || ""
  };
}

export function validateMercadoPagoSignature(request: Request, dataId: string | null) {
  const secret = getServerEnv("MERCADO_PAGO_WEBHOOK_SECRET");
  if (!secret) return { ok: false, reason: "WEBHOOK_SECRET_NOT_CONFIGURED" };

  const signature = request.headers.get("x-signature") || "";
  const requestId = request.headers.get("x-request-id") || "";
  const ts = signature
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith("ts="))
    ?.replace("ts=", "");
  const hash = signature
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith("v1="))
    ?.replace("v1=", "");

  if (!ts || !hash || !requestId || !dataId) {
    return { ok: false, reason: "INVALID_SIGNATURE_HEADERS" };
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
    return { ok: valid, reason: valid ? "OK" : "SIGNATURE_MISMATCH" };
  } catch {
    return { ok: false, reason: "SIGNATURE_MISMATCH" };
  }
}

export async function getMercadoPagoPayment(paymentId: string) {
  const accessToken = getServerEnv("MERCADO_PAGO_ACCESS_TOKEN");
  if (!accessToken) return null;

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) return null;

  return (await response.json()) as {
    id: number;
    status: string;
    external_reference?: string;
    transaction_amount?: number;
  };
}
