import Link from "next/link";
import { XosaMark } from "@/components/brand/xosa-mark";

export function Footer() {
  return (
    <footer className="border-t border-white/10 pb-28 pt-10">
      <div className="shell grid gap-6 text-sm text-white/62 md:grid-cols-[1fr_auto]">
        <div>
          <div className="w-36">
            <XosaMark />
          </div>
          <p className="mt-3 font-black uppercase tracking-[0.18em] text-white">La Perrera Club</p>
          <p className="mt-2 max-w-xl">
            Plataforma de música, comunidad, productos, experiencias y booking. Sin contenido de relleno: lo que ves
            depende de lo que esté publicado.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 font-bold uppercase">
          <Link className="focus-ring hover:text-white" href="/xosa">
            XOSA
          </Link>
          <Link className="focus-ring hover:text-white" href="/tienda">
            Tienda
          </Link>
          <Link className="focus-ring hover:text-white" href="/booking">
            Booking
          </Link>
          <Link className="focus-ring hover:text-white" href="/admin">
            Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
