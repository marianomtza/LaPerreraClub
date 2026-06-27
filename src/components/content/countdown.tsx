"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  targetDate: string;
  endText?: string;
  hideWhenFinished?: boolean;
};

function getRemaining(targetDate: string) {
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - Date.now());

  return {
    done: diff <= 0,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

export function Countdown({ targetDate, endText = "Ya disponible", hideWhenFinished }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));
  const valid = useMemo(() => Number.isFinite(new Date(targetDate).getTime()), [targetDate]);

  useEffect(() => {
    if (!valid) return;
    const timer = window.setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => window.clearInterval(timer);
  }, [targetDate, valid]);

  if (!valid) return null;
  if (remaining.done && hideWhenFinished) return null;

  return (
    <div className="panel p-5">
      {remaining.done ? (
        <p className="text-3xl font-black uppercase">{endText}</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ["Días", remaining.days],
            ["Horas", remaining.hours],
            ["Min", remaining.minutes],
            ["Seg", remaining.seconds]
          ].map(([label, value]) => (
            <div className="rounded-[8px] border border-white/10 p-3" key={label}>
              <p className="font-mono text-3xl font-black">{String(value).padStart(2, "0")}</p>
              <p className="mt-1 text-xs font-bold uppercase text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
