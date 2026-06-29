import { NextResponse } from "next/server";
import { siteCopy } from "@/content/site-copy";
import { getServerEnv } from "@/lib/env";
import { sendEmail, wrapEmail } from "@/lib/email";
import { getCartVariants } from "@/lib/data";
import { createMercadoPagoPreference } from "@/lib/payments/mercado-pago";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await checkRateLimit(`checkout:${getRequestIp(request)}`, 10, 60_000))) {
    return NextResponse.json({ message: siteCopy.global.system.rateLimited }, { status: 429 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Revisa el checkout." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.error("Checkout blocked: Supabase service client is not configured.");
    return NextResponse.json({ message: siteCopy.global.system.unavailable }, { status: 503 });
  }

  const checkout = parsed.data;
  const variantIds = checkout.items.map((item) => item.variantId);
  const variants = await getCartVariants(variantIds);

  const normalizedItems: Array<{ request: (typeof checkout.items)[number]; variant: (typeof variants)[number] }> = [];
  for (const item of checkout.items) {
    const variant = variants.find((entry) => entry.id === item.variantId);
    if (!variant) {
      return NextResponse.json({ message: "Producto no disponible." }, { status: 400 });
    }
    if (variant.products.status !== "publicado") {
      return NextResponse.json({ message: "Producto no disponible para compra." }, { status: 400 });
    }
    if (variant.track_inventory && item.quantity > variant.stock_quantity) {
      return NextResponse.json({ message: `Inventario insuficiente para ${variant.products.name}.` }, { status: 400 });
    }
    normalizedItems.push({ request: item, variant });
  }

  const subtotalCents = normalizedItems.reduce(
    (sum, item) => sum + item.variant.price_cents * item.request.quantity,
    0
  );

  const { data: shippingRules } = await supabase
    .from("shipping_rules")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const pickupEnabled = Boolean(shippingRules?.some((rule) => rule.pickup_enabled));
  if (checkout.pickup && !pickupEnabled) {
    return NextResponse.json({ message: "La recolección todavía no está habilitada." }, { status: 400 });
  }

  const shippingRule = shippingRules?.[0] as { price_cents: number; free_from_cents: number | null } | undefined;
  if (!checkout.pickup && !shippingRule) {
    console.error("Checkout blocked: no active shipping rule is available.");
    return NextResponse.json({ message: "El envío no está disponible en este momento." }, { status: 503 });
  }

  const shippingCents = checkout.pickup
    ? 0
    : shippingRule?.free_from_cents && subtotalCents >= shippingRule.free_from_cents
      ? 0
      : shippingRule?.price_cents || 0;
  const totalCents = subtotalCents + shippingCents;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: checkout.customer.name,
      customer_email: checkout.customer.email,
      customer_phone: checkout.customer.phone,
      shipping_address: {
        address: checkout.customer.address,
        city: checkout.customer.city,
        state: checkout.customer.state,
        postalCode: checkout.customer.postalCode,
        pickup: checkout.pickup
      },
      notes: checkout.customer.notes,
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      idempotency_key: checkout.idempotencyKey || null
    })
    .select("*")
    .single();

  if (orderError || !order) {
    console.error("No se pudo crear pedido.", orderError?.message);
    if (orderError?.code === "23505") {
      return NextResponse.json({ message: "Este pedido ya está en proceso." }, { status: 409 });
    }
    return NextResponse.json({ message: "No se pudo crear el pedido." }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    normalizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.variant.product_id,
      variant_id: item.variant.id,
      name: item.variant.products.name,
      variant_name: item.variant.name,
      quantity: item.request.quantity,
      unit_price_cents: item.variant.price_cents,
      total_cents: item.variant.price_cents * item.request.quantity
    }))
  );

  if (itemsError) {
    console.error("No se pudieron crear partidas de pedido.", itemsError.message);
    await supabase.from("orders").update({ order_status: "cancelado", payment_status: "cancelado" }).eq("id", order.id);
    return NextResponse.json({ message: "No se pudieron guardar los productos del pedido." }, { status: 500 });
  }

  const preference = await createMercadoPagoPreference({
    orderId: order.id,
    customerEmail: checkout.customer.email,
    shippingCents,
    items: normalizedItems.map((item) => ({
      title: `${item.variant.products.name} / ${item.variant.name}`,
      quantity: item.request.quantity,
      unitPriceCents: item.variant.price_cents
    }))
  });

  if (!preference.ok || !preference.initPoint) {
    await supabase.from("orders").update({ order_status: "en_revision" }).eq("id", order.id);
    return NextResponse.json({ message: preference.message }, { status: 503 });
  }

  await supabase
    .from("orders")
    .update({ payment_provider_reference: preference.preferenceId })
    .eq("id", order.id);

  if (getServerEnv("ORDERS_NOTIFICATION_EMAIL")) {
    await sendEmail({
      to: getServerEnv("ORDERS_NOTIFICATION_EMAIL"),
      subject: siteCopy.emails.orderPendingSubject,
      html: wrapEmail("Pedido pendiente", `<p>Pedido ${order.id} creado por ${checkout.customer.email}. Total: ${totalCents / 100} MXN.</p>`)
    });
  }

  return NextResponse.json({ initPoint: preference.initPoint });
}
