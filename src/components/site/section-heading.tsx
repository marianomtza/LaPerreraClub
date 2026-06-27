export function SectionHeading({
  eyebrow,
  title,
  copy
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 w-fit rotate-[-1deg] bg-[var(--accent)] px-2 py-1 font-mono text-xs font-black uppercase text-white">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-4xl font-black uppercase leading-none tracking-normal md:text-6xl">{title}</h2>
      {copy ? <p className="mt-4 text-lg text-[var(--muted)]">{copy}</p> : null}
    </div>
  );
}
