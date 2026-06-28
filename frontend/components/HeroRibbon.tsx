"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// A purely decorative tug-of-war that breathes between two teams, so the
// thesis of the product is visible before you open a match. Not real data.
const FRAMES = [52, 61, 58, 73, 47, 64, 80, 55, 38, 60];

export default function HeroRibbon() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 1500);
    return () => clearInterval(t);
  }, [reduce]);

  const home = FRAMES[i];
  const away = 100 - home;
  const spring = reduce
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 70, damping: 15 } as const);

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs">
        <span className="tnum text-home">{home}%</span>
        <span className="eyebrow self-center">momentum</span>
        <span className="tnum text-away">{away}%</span>
      </div>
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-line bg-void">
        <motion.div
          className="h-full"
          style={{ background: "var(--color-home)" }}
          animate={{ width: `${home}%` }}
          transition={spring}
        />
        <motion.div
          className="h-full"
          style={{ background: "var(--color-away)" }}
          animate={{ width: `${away}%` }}
          transition={spring}
        />
      </div>
    </div>
  );
}
