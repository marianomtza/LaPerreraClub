import { NextResponse } from "next/server";
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
    return NextResponse.json({ message: "Firma inválida." }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ message: "Supabase no está configurado." }, { status: 503 });

  const payment = await getMercadoPagoPayment(dataId);
  if (!payment?.external_reference) {
    return NextResponse.json({ message: "Pago no encontrado." }, { status: 404 });
  }

  const eventId = String(payload.id || `${payload.type || payload.action || "payment"}:${dataId}:${payment.status}`);
  const { error: eventError } = await supabase.from("payment_events").insert({
    provider: "mercado_pago",
    provider_event_id: eventId,
    order_id: payment.external_reference,
    event_type: payload.type || payload.action || "payment",
    payload: { webhook: payload, payment }
  });

  if (eventError) {
    if (eventError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    console.error("No se pudo registrar webhook.", eventError.message);
    return NextResponse.json({ message: "No se pudo registrar el evento." }, { status: 500 });
  }

  const statusMap: Record<string, { order: string; payment: string }> = {
    approved: { order: "pagado", payment: "aprobado" },
    rejected: { order: "pendiente", payment: "rechazado" },
    cancelled: { order: "cancelado", payment: "cancelado" },
    refunded: { order: "reembolsado", payment: "reembolsado" }
  };
  const mapped = statusMap[payment.status] || { order: "pendiente", payment: "pendiente" };

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
        subject: "Pedido pagado",
        html: wrapEmail("Pedido pagado", "<p>Mercado Pago confirmó tu pago. Prepararemos el pedido según la información registrada.</p>")
      });
    }

    if (getServerEnv("ORDERS_NOTIFICATION_EMAIL")) {
      await sendEmail({
        to: getServerEnv("ORDERS_NOTIFICATION_EMAIL"),
        subject: "Pedido pagado en La Perrera Club",
        html: wrapEmail("Pedido pagado", `<p>Pedido ${payment.external_reference} aprobado por Mercado Pago.</p>`)
      });
    }
  }

  return NextResponse.json({ ok: true });
}
