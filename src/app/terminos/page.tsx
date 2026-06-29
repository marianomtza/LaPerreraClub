import type { Metadata } from "next";
import { siteCopy } from "@/content/site-copy";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: siteCopy.legal.terms.title,
  description: siteCopy.legal.terms.description,
  alternates: {
    canonical: "/terminos"
  }
};

export default function TermsPage() {
  return (
    <main className="shell min-h-[72vh] py-16">
      <SectionHeading eyebrow="Legal" title={siteCopy.legal.terms.title} copy={siteCopy.legal.terms.description} />
      <p className="panel mb-8 p-4 text-sm text-white/72">{siteCopy.legal.reviewNote}</p>
      <div className="grid gap-6 text-lg text-[var(--muted)]">
        <p>
          Al usar este sitio aceptas hacerlo de forma licita y respetuosa. La Perrera Club puede retirar contenido,
          productos o experiencias cuando ya no esten disponibles.
        </p>
        <p>
          Los precios, inventario, envios y estados de compra se validan en servidor antes de iniciar el pago. Un pedido
          queda sujeto a confirmacion del proveedor de pago y disponibilidad real.
        </p>
        <p>
          Enviar formularios de Club o booking no crea una obligacion de contratacion, disponibilidad, tarifa o beneficio
          especifico.
        </p>
        <p>
          Los derechos de marca, imagen, musica, fotografias, videos y contenido pertenecen a sus titulares
          correspondientes.
        </p>
      </div>
    </main>
  );
}
