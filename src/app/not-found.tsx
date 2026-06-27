import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell flex min-h-[72vh] flex-col items-start justify-center gap-6 py-24">
      <p className="font-mono text-sm uppercase text-[var(--accent)]">404</p>
      <h1 className="max-w-2xl text-5xl font-black uppercase leading-none md:text-7xl">
        Esta ruta no está publicada.
      </h1>
      <p className="max-w-xl text-lg text-[var(--muted)]">
        Puede ser un slug reservado, una página retirada o contenido que todavía no está activo.
      </p>
      <Link
        className="focus-ring inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[var(--accent)] px-5 text-sm font-black uppercase text-[var(--ink)]"
        href="/"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
