"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// A static, illustrative momentum bar for the landing — the product's signature
// unit shown on a light surface. Not live data; it breathes to hint at motion.
const FRAMES = [
  { home: 41, away: 47, label: "Even contest" },
  { home: 63, away: 27, label: "Argentina surge" },
  { home: 34, away: 55, label: "Jordan press" },
  { home: 52, away: 38, label: "Momentum shifts" },
];

export default function MomentumTeaser() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 2600);
    return () => clearInterval(t);
  }, [reduce]);

  const f = FRAMES[i];
  const draw = Math.max(0, 100 - f.home - f.away);
  const spring = reduce
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 70, damping: 16 } as const);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,20,0.35)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-left">
          <div className="head text-lg leading-none text-home">Argentina</div>
          <div className="tnum text-xs text-neutral-400">{f.home}%</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            Momentum
          </div>
          <div className="tnum head text-2xl leading-none text-neutral-900">
            {f.home > f.away ? "+" : ""}
            {f.home - f.away}
          </div>
        </div>
        <div className="text-right">
          <div className="head text-lg leading-none text-away">Jordan</div>
          <div className="tnum text-xs text-neutral-400">{f.away}%</div>
        </div>
      </div>

      <div className="flex h-8 w-full overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
        <motion.div
          className="h-full"
          style={{ background: "var(--color-home)" }}
          animate={{ width: `${f.home}%` }}
          transition={spring}
        />
        <motion.div
          className="h-full"
          style={{ background: "var(--color-draw)", opacity: 0.85 }}
          animate={{ width: `${draw}%` }}
          transition={spring}
        />
        <motion.div
          className="h-full"
          style={{ background: "var(--color-away)" }}
          animate={{ width: `${f.away}%` }}
          transition={spring}
        />
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        <span className="font-medium text-neutral-800">{f.label}.</span> The band
        leans toward whichever side the market favours — and snaps the instant a
        goal lands.
      </p>
    </div>
  );
}
