"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/store/cart-provider";
import { trackEvent } from "@/lib/analytics";

type AddToCartButtonProps = {
  variantId: string;
  name: string;
  variantName: string;
  priceCents: number;
  imageUrl?: string | null;
  disabled?: boolean;
};

export function AddToCartButton(props: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={props.disabled}
      onClick={() => {
        addItem({ ...props, quantity: 1 });
        trackEvent("add_to_cart", { variantId: props.variantId, name: props.name });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      type="button"
    >
      <ShoppingBag aria-hidden="true" size={18} />
      {added ? "Agregado" : "Agregar"}
    </button>
  );
}
