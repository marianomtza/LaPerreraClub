import type { CounterContent } from "@/lib/content-types";

export function CounterGrid({ counters }: { counters?: CounterContent[] }) {
  const valid = (counters || []).filter((counter) => counter.label && counter.source && counter.updatedAt);
  if (valid.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {valid.map((counter) => {
        const value = counter.compact
          ? new Intl.NumberFormat("es-MX", { notation: "compact" }).format(counter.value)
          : new Intl.NumberFormat("es-MX").format(counter.value);

        return (
          <div className="panel p-4" key={`${counter.label}-${counter.updatedAt}`}>
            <p className="font-mono text-xs uppercase text-[var(--muted)]">{counter.kind || "dato manual"}</p>
            <p className="mt-2 text-3xl font-black">
              {counter.prefix}
              {value}
              {counter.suffix}
            </p>
            <p className="mt-1 font-bold uppercase">{counter.label}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Fuente: {counter.source}. Actualizado: {new Date(counter.updatedAt).toLocaleDateString("es-MX")}.
            </p>
          </div>
        );
      })}
    </div>
  );
}
