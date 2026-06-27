import Link from "next/link";
import { CalendarDays, Disc3, Radio, ShoppingBag, Users } from "lucide-react";
import { CartCount } from "@/components/store/cart-count";

const dockItems = [
  { label: "XOSA", href: "/xosa", icon: Disc3 },
  { label: "Club", href: "/#club", icon: Users },
  { label: "Tienda", href: "/tienda", icon: ShoppingBag },
  { label: "Fechas", href: "/#fechas", icon: CalendarDays },
  { label: "Booking", href: "/booking", icon: Radio }
];

export function PerreraDock() {
  return (
    <nav
      aria-label="Acciones rápidas"
      className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[min(720px,calc(100vw-24px))] rounded-[8px] border border-white/18 bg-[#080302]/88 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      <div className="grid grid-cols-5 gap-1">
        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className="focus-ring group relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-[7px] text-[10px] font-black uppercase text-white/68 transition hover:bg-[var(--accent)] hover:text-white"
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
              <span className="leading-none">{item.label}</span>
              {item.label === "Tienda" ? <span className="absolute -right-0.5 -top-1"><CartCount /></span> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
