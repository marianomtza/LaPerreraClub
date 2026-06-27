import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartCount } from "@/components/store/cart-count";
import { MobileNav } from "@/components/site/mobile-nav";
import { XosaMark } from "@/components/brand/xosa-mark";

const navItems = [
  { label: "XOSA", href: "/xosa" },
  { label: "Club", href: "/#club" },
  { label: "Tienda", href: "/tienda" },
  { label: "Booking", href: "/booking" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080807]/86 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link className="focus-ring flex items-center gap-3 uppercase" href="/">
          <span className="block w-24">
            <XosaMark />
          </span>
          <span className="hidden border-l border-white/20 pl-3 text-xs font-black leading-none tracking-[0.16em] text-white/78 sm:block">
            La Perrera
            <br />
            Club
          </span>
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
            <span>Carrito</span>
            <CartCount />
          </Link>
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
