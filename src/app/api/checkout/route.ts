import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { sendEmail, wrapEmail } from "@/lib/email";
import { getCartVariants } from "@/lib/data";
import { createMercadoPagoPreference } from "@/lib/payments/mercado-pago";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!checkRateLimit(`checkout:${getRequestIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ message: "Intenta de nuevo en un minuto." }, { status: 429 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Revisa el checkout." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase no está configurado para crear pedidos." }, { status: 503 });
  }

  const checkout = parsed.data;
  const variantIds = checkout.items.map((item) => item.variantId);
  const variants = await getCartVariants(variantIds);

  const normalizedItems = checkout.items.map((item) => {
    const variant = variants.find((entry) => entry.id === item.variantId);
    if (!variant) throw new Error("Producto no disponible.");
    if (variant.products.status !== "publicado") throw new Error("Producto no disponible para compra.");
    if (variant.track_inventory && item.quantity > variant.stock_quantity) {
      throw new Error(`Inventario insuficiente para ${variant.products.name}.`);
    }
    return { request: item, variant };
  });

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
    return NextResponse.json({ message: "Configura al menos una tarifa de envío antes de vender." }, { status: 503 });
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
      total_cents: totalCents
    })
    .select("*")
    .single();

  if (orderError || !order) {
    console.error("No se pudo crear pedido.", orderError?.message);
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
    return NextResponse.json({ message: preference.message }, { status: 503 });
  }

  await supabase
    .from("orders")
    .update({ payment_provider_reference: preference.preferenceId })
    .eq("id", order.id);

  if (getServerEnv("ORDERS_NOTIFICATION_EMAIL")) {
    await sendEmail({
      to: getServerEnv("ORDERS_NOTIFICATION_EMAIL"),
      subject: "Nuevo pedido pendiente",
      html: wrapEmail("Pedido pendiente", `<p>Pedido ${order.id} creado por ${checkout.customer.email}. Total: ${totalCents / 100} MXN.</p>`)
    });
  }

  return NextResponse.json({ initPoint: preference.initPoint });
}
