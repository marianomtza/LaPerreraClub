import type { Metadata } from "next";
import { siteCopy } from "@/content/site-copy";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: siteCopy.legal.shipping.title,
  description: siteCopy.legal.shipping.description,
  alternates: {
    canonical: "/envios-y-devoluciones"
  }
};

export default function ShippingReturnsPage() {
  return (
    <main className="shell min-h-[72vh] py-16">
      <SectionHeading
        eyebrow="Tienda"
        title={siteCopy.legal.shipping.title}
        copy={siteCopy.legal.shipping.description}
      />
      <p className="panel mb-8 p-4 text-sm text-white/72">{siteCopy.legal.reviewNote}</p>
      <div className="grid gap-6 text-lg text-[var(--muted)]">
        <p>
          Las opciones de envio se muestran cuando existe una tarifa activa. Si la recoleccion no esta habilitada, no debe
          aparecer como opcion de compra.
        </p>
        <p>
          Revisa tus datos antes de pagar. Si un pedido no puede completarse por inventario, direccion o pago, se
          conservara como pendiente de revision o se cancelara segun corresponda.
        </p>
        <p>
          Las devoluciones y cambios dependen del estado de la pieza, el motivo de la solicitud y las reglas publicadas al
          momento de la compra.
        </p>
        <p>
          Conserva tu comprobante de pago y el correo usado en checkout para cualquier aclaracion.
        </p>
      </div>
    </main>
  );
}
