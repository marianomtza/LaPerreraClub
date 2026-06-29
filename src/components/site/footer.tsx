import Link from "next/link";
import { siteCopy } from "@/content/site-copy";
import { LaPerreraMark } from "@/components/brand/la-perrera-mark";

export function Footer() {
  return (
    <footer className="border-t border-white/10 pb-28 pt-10">
      <div className="shell grid gap-6 text-sm text-white/62 md:grid-cols-[1fr_auto]">
        <div>
          <LaPerreraMark className="text-[22px]" />
          <p className="mt-3 max-w-xl">{siteCopy.global.footer.description}</p>
        </div>
        <div className="flex flex-wrap gap-4 font-bold uppercase">
          <Link className="focus-ring hover:text-white" href="/xosa">
            {siteCopy.global.navigation.xosa}
          </Link>
          <Link className="focus-ring hover:text-white" href="/tienda">
            {siteCopy.global.navigation.store}
          </Link>
          <Link className="focus-ring hover:text-white" href="/booking">
            {siteCopy.global.navigation.booking}
          </Link>
          <Link className="focus-ring hover:text-white" href="/privacidad">
            {siteCopy.global.footer.links.privacy}
          </Link>
          <Link className="focus-ring hover:text-white" href="/terminos">
            {siteCopy.global.footer.links.terms}
          </Link>
          <Link className="focus-ring hover:text-white" href="/envios-y-devoluciones">
            {siteCopy.global.footer.links.shipping}
          </Link>
        </div>
      </div>
    </footer>
  );
}
