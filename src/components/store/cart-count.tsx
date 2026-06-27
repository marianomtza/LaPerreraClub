"use client";

import { useCart } from "@/components/store/cart-provider";

export function CartCount() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-black text-[var(--ink)]">
      {count}
    </span>
  );
}
