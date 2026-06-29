import { siteCopy } from "@/content/site-copy";

export function LaPerreraMark({ className = "" }: { className?: string }) {
  return (
    <span className={`leading-none ${className}`} aria-label={siteCopy.global.brandName}>
      <span className="block text-[1.45em] font-black uppercase tracking-normal">La Perrera</span>
      <span className="block -mt-1 text-[0.92em] font-black uppercase text-[var(--accent)] tracking-normal">
        Club
      </span>
    </span>
  );
}
