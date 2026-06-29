"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { siteCopy } from "@/content/site-copy";
import { CartCount } from "@/components/store/cart-count";

type NavItem = {
  label: string;
  href: string;
};

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="focus-ring inline-flex size-10 items-center justify-center rounded-[8px] border border-white/15"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 border-b border-white/10 bg-[#080807] p-4 shadow-2xl">
          <nav aria-label="Móvil" className="shell grid gap-2">
            {items.map((item) => (
              <Link
                className="focus-ring rounded-[8px] border border-white/10 px-4 py-4 text-lg font-black uppercase"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="focus-ring flex items-center justify-between rounded-[8px] border border-white/10 px-4 py-4 text-lg font-black uppercase"
              href="/checkout"
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag aria-hidden="true" size={20} />
                {siteCopy.global.navigation.cart}
              </span>
              <CartCount />
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
