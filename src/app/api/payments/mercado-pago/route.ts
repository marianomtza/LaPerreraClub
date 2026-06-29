import { NextResponse } from "next/server";
import { siteCopy } from "@/content/site-copy";
import { getServerEnv } from "@/lib/env";
import { sendEmail, wrapEmail } from "@/lib/email";
import { getMercadoPagoPayment, validateMercadoPagoSignature } from "@/lib/payments/mercado-pago";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    id?: string | number;
    type?: string;
    action?: string;
    data?: { id?: string | number };
  };

  const url = new URL(request.url);
  const dataId = String(payload.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id") || "");
  const signature = validateMercadoPagoSignature(request, dataId);
  if (!signature.ok) {
    console.error("Mercado Pago webhook rejected.", signature.reason);
    return NextResponse.json({ message: "Evento no autorizado." }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.error("Mercado Pago webhook blocked: Supabase service client is not configured.");
    return NextResponse.json({ message: siteCopy.global.system.unavailable }, { status: 503 });
  }

  const payment = await getMercadoPagoPayment(dataId);
  if (!payment?.external_reference) {
    return NextResponse.json({ message: "Pago no encontrado." }, { status: 404 });
  }

  const { data: existingOrder, error: orderLookupError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", payment.external_reference)
    .single();

  if (orderLookupError || !existingOrder) {
    console.error("Mercado Pago webhook has no matching order.", orderLookupError?.message);
    return NextResponse.json({ message: "Pedido no encontrado." }, { status: 404 });
  }

  const paidAmountCents = Math.round((payment.transaction_amount || 0) * 100);
  const currency = payment.currency_id || "";
  const amountMatches = paidAmountCents === existingOrder.total_cents;
  const currencyMatches = currency === "MXN";

  const eventId = String(payload.id || `${payload.type || payload.action || "payment"}:${dataId}:${payment.status}`);
  const { error: eventError } = await supabase.from("payment_events").insert({
    provider: "mercado_pago",
    provider_event_id: eventId,
    order_id: payment.external_reference,
    event_type: payload.type || payload.action || "payment",
    payment_status: payment.status,
    amount_cents: paidAmountCents,
    currency,
    payload: { webhook: payload, payment }
  });

  if (eventError) {
    if (eventError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    console.error("No se pudo registrar webhook.", eventError.message);
    return NextResponse.json({ message: "No se pudo registrar el evento." }, { status: 500 });
  }

  const statusMap: Record<string, { order: string; payment: string }> = {
    approved: { order: "pagado", payment: "aprobado" },
    pending: { order: "pendiente", payment: "pendiente" },
    in_process: { order: "en_revision", payment: "en_proceso" },
    rejected: { order: "pendiente", payment: "rechazado" },
    cancelled: { order: "cancelado", payment: "cancelado" },
    refunded: { order: "reembolsado", payment: "reembolsado" },
    charged_back: { order: "reembolsado", payment: "contracargo" }
  };
  const mapped = statusMap[payment.status] || { order: "pendiente", payment: "pendiente" };

  if (payment.status === "approved" && (!amountMatches || !currencyMatches)) {
    console.error("Mercado Pago payment mismatch.", {
      orderId: existingOrder.id,
      expectedAmount: existingOrder.total_cents,
      paidAmount: paidAmountCents,
      currency
    });
    await supabase
      .from("orders")
      .update({ order_status: "en_revision", payment_status: "en_proceso" })
      .eq("id", payment.external_reference);
    return NextResponse.json({ ok: true, review: true });
  }

  const { data: order } = await supabase
    .from("orders")
    .update({ order_status: mapped.order, payment_status: mapped.payment })
    .eq("id", payment.external_reference)
    .select("*")
    .single();

  if (payment.status === "approved") {
    await supabase.rpc("apply_paid_order_inventory", { p_order_id: payment.external_reference });

    if (order?.customer_email) {
      await sendEmail({
        to: order.customer_email,
        subject: siteCopy.emails.orderPaidCustomerSubject,
        html: wrapEmail("Pedido pagado", siteCopy.emails.orderPaidCustomerBody)
      });
    }

    if (getServerEnv("ORDERS_NOTIFICATION_EMAIL")) {
      await sendEmail({
        to: getServerEnv("ORDERS_NOTIFICATION_EMAIL"),
        subject: siteCopy.emails.orderPaidSubject,
        html: wrapEmail("Pedido pagado", `<p>Pedido ${payment.external_reference} aprobado por Mercado Pago.</p>`)
      });
    }
  }

  return NextResponse.json({ ok: true });
}
