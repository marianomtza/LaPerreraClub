import type { Metadata } from "next";
import { siteCopy } from "@/content/site-copy";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: siteCopy.legal.privacy.title,
  description: siteCopy.legal.privacy.description,
  alternates: {
    canonical: "/privacidad"
  }
};

export default function PrivacyPage() {
  return (
    <main className="shell min-h-[72vh] py-16">
      <SectionHeading
        eyebrow="Legal"
        title={siteCopy.legal.privacy.title}
        copy={siteCopy.legal.privacy.description}
      />
      <LegalNotice />
      <div className="grid gap-6 text-lg text-[var(--muted)]">
        <p>
          Usamos los datos que compartes para responder solicitudes, operar pedidos, enviar comunicaciones aceptadas y
          mejorar la experiencia de La Perrera Club.
        </p>
        <p>
          Los datos pueden incluir nombre, correo, telefono, ciudad, direccion de envio, redes sociales compartidas por
          ti y detalles de solicitudes de booking o compra.
        </p>
        <p>
          No publicamos tus datos personales ni los vendemos. Podemos usar proveedores operativos para pagos, correo,
          almacenamiento, analitica y hosting.
        </p>
        <p>
          Para ejercer derechos sobre tus datos, usa los canales de contacto publicados por La Perrera Club cuando esten
          disponibles.
        </p>
      </div>
    </main>
  );
}

function LegalNotice() {
  return <p className="panel mb-8 p-4 text-sm text-white/72">{siteCopy.legal.reviewNote}</p>;
}
