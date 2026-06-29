import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { siteCopy } from "@/content/site-copy";
import { LaPerreraMark } from "@/components/brand/la-perrera-mark";
import { CartCount } from "@/components/store/cart-count";
import { MobileNav } from "@/components/site/mobile-nav";

const navItems = [
  { label: siteCopy.global.navigation.xosa, href: "/xosa" },
  { label: siteCopy.global.navigation.club, href: "/#club" },
  { label: siteCopy.global.navigation.store, href: "/tienda" },
  { label: siteCopy.global.navigation.booking, href: "/booking" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080807]/86 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link className="focus-ring flex items-center gap-3 uppercase" href="/">
          <LaPerreraMark className="text-[13px]" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 text-sm font-bold uppercase md:flex">
          {navItems.map((item) => (
            <Link className="focus-ring text-white/70 transition hover:text-[var(--accent-strong)]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="focus-ring hidden min-h-10 items-center gap-2 rounded-[8px] border border-white/15 px-3 text-sm font-bold uppercase text-white/82 md:inline-flex"
            href="/checkout"
          >
            <ShoppingBag aria-hidden="true" size={18} />
            <span>{siteCopy.global.navigation.cart}</span>
            <CartCount />
          </Link>
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
