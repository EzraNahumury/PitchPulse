"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import type { MatchEvent, OddsPoint } from "@/lib/types";
import { actionMeta, impactText, sideColorVar } from "@/lib/format";

interface Props {
  points: OddsPoint[];
  latest: OddsPoint | null;
  events: MatchEvent[];
  pending: MatchEvent | null;
  home: string;
  away: string;
}

/**
 * The Momentum Ribbon — PitchPulse's signature.
 *  - A pressure bar (top) shows the CURRENT market split as a tug-of-war
 *    between the two teams; it springs/snaps whenever the probability moves.
 *  - A timeline band (below) draws the whole match as territory: home colour
 *    from the top, away from the bottom, the seam riding pHome over time.
 *  - Events are pinned to the moment they happened, tagged with their
 *    Momentum Impact Score.
 */
export default function MomentumRibbon({
  points,
  latest,
  events,
  pending,
  home,
  away,
}: Props) {
  const reduce = useReducedMotion();

  const cur = latest ?? points[points.length - 1] ?? null;
  const pHome = cur?.pHome ?? 33.3;
  const pDraw = cur?.pDraw ?? 33.4;
  const pAway = cur?.pAway ?? 33.3;
  const m = cur?.m ?? 0;

  const spring = reduce
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 90, damping: 16, mass: 0.6 } as const);

  // ts range for placing both the seam path and the event pins on one axis
  const range = useMemo(() => {
    if (points.length === 0) return null;
    let min = points[0].ts;
    let max = points[0].ts;
    for (const p of points) {
      if (p.ts < min) min = p.ts;
      if (p.ts > max) max = p.ts;
    }
    for (const e of events) if (e.ts > max) max = e.ts;
    return { min, max: Math.max(max, min + 1) };
  }, [points, events]);

  const xOf = (ts: number) =>
    range ? ((ts - range.min) / (range.max - range.min)) * 100 : 0;

  // Stacked-area paths: home (top) -> draw -> away (bottom).
  const bands = useMemo(() => {
    if (!range || points.length < 2) return null;
    const xs = points.map((p) => xOf(p.ts));
    const seam1 = points.map((p) => p.pHome); // home / draw boundary
    const seam2 = points.map((p) => p.pHome + p.pDraw); // draw / away boundary

    const lineTo = (ys: number[], reverse = false) => {
      const idx = reverse ? [...xs.keys()].reverse() : [...xs.keys()];
      return idx.map((i) => `${xs[i].toFixed(2)},${ys[i].toFixed(2)}`).join(" L ");
    };

    const homePath = `M ${lineTo(points.map(() => 0))} L ${lineTo(seam1, true)} Z`;
    const drawPath = `M ${lineTo(seam1)} L ${lineTo(seam2, true)} Z`;
    const awayPath = `M ${lineTo(seam2)} L ${lineTo(points.map(() => 100), true)} Z`;
    const seamLine = `M ${lineTo(seam1)}`;
    return { homePath, drawPath, awayPath, seamLine };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, range]);

  const pins = useMemo(
    () =>
      events
        .filter((e) => Math.abs(e.impact) >= 0.5 || e.key)
        .map((e) => ({ e, x: xOf(e.ts) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, range],
  );

  return (
    <section aria-label="Momentum ribbon" className="select-none">
      {/* current split — the live tug-of-war */}
      <div className="mb-2 flex items-end justify-between">
        <TeamTag name={home} pct={pHome} color="var(--color-home)" align="left" />
        <div className="text-center">
          <div className="eyebrow mb-0.5">Momentum</div>
          <div
            className="tnum font-display text-3xl leading-none"
            style={{ color: sideColorVar(cur ? (m > 1.5 ? "home" : m < -1.5 ? "away" : "neutral") : "neutral") }}
          >
            {m > 0 ? "+" : ""}
            {Math.round(m)}
          </div>
        </div>
        <TeamTag name={away} pct={pAway} color="var(--color-away)" align="right" />
      </div>

      <div className="flex h-7 w-full overflow-hidden rounded-sm border border-line bg-void">
        <motion.div
          className="h-full"
          style={{ background: "var(--color-home)" }}
          animate={{ width: `${pHome}%` }}
          transition={spring}
        />
        <motion.div
          className="h-full"
          style={{ background: "var(--color-draw)", opacity: 0.85 }}
          animate={{ width: `${pDraw}%` }}
          transition={spring}
        />
        <motion.div
          className="h-full"
          style={{ background: "var(--color-away)" }}
          animate={{ width: `${pAway}%` }}
          transition={spring}
        />
      </div>

      {/* the match as territory over time */}
      <div className="relative mt-3">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-44 w-full rounded-sm border border-line bg-void/60"
          aria-hidden
        >
          {bands ? (
            <>
              <path d={bands.homePath} fill="var(--color-home)" fillOpacity={0.32} />
              <path d={bands.drawPath} fill="var(--color-draw)" fillOpacity={0.18} />
              <path d={bands.awayPath} fill="var(--color-away)" fillOpacity={0.32} />
              <path
                d={bands.seamLine}
                fill="none"
                stroke="var(--color-chalk)"
                strokeWidth={0.6}
                strokeOpacity={0.7}
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
        </svg>

        {/* event pins, positioned over the band */}
        <div className="pointer-events-none absolute inset-0">
          {pins.map(({ e, x }, i) => (
            <Pin key={`${e.ts}-${i}`} e={e} x={x} reduce={!!reduce} />
          ))}
          {pending ? <PendingPin x={xOf(pending.ts)} /> : null}
        </div>

        {/* now marker */}
        {cur && range ? (
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-live/70"
            style={{ left: `${xOf(cur.ts)}%` }}
          >
            <span className="live-dot absolute -top-1 -left-[3px] h-[7px] w-[7px] rounded-full bg-live" />
          </div>
        ) : null}
      </div>

      <div className="eyebrow mt-1.5 flex justify-between">
        <span>Kick-off</span>
        <span>Now</span>
      </div>
    </section>
  );
}

function TeamTag({
  name,
  pct,
  color,
  align,
}: {
  name: string;
  pct: number;
  color: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className="font-display text-lg leading-tight" style={{ color }}>
        {name}
      </div>
      <div className="tnum text-xs text-chalk-dim">{pct.toFixed(1)}%</div>
    </div>
  );
}

function Pin({ e, x, reduce }: { e: MatchEvent; x: number; reduce: boolean }) {
  const color = sideColorVar(e.side);
  const { glyph } = actionMeta(e.action);
  return (
    <motion.div
      className="absolute top-0 bottom-0 flex flex-col items-center"
      style={{ left: `${x}%`, transform: "translateX(-50%)" }}
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }}
      title={`${e.label}  (${impactText(e.impact)})`}
    >
      <div
        className="tnum mt-0.5 rounded-xs px-1 py-px text-[9px] font-semibold leading-none"
        style={{ background: color, color: "var(--color-void)" }}
      >
        {glyph}
      </div>
      <div className="w-px flex-1" style={{ background: color, opacity: 0.5 }} />
      {Math.abs(e.impact) >= 1 ? (
        <div className="tnum mb-1 text-[9px] leading-none" style={{ color }}>
          {impactText(e.impact)}
        </div>
      ) : null}
    </motion.div>
  );
}

function PendingPin({ x }: { x: number }) {
  return (
    <div
      className="absolute top-0 bottom-0 flex flex-col items-center"
      style={{ left: `${x}%`, transform: "translateX(-50%)" }}
    >
      <div className="live-dot mt-1 h-2 w-2 rounded-full bg-chalk" />
      <div className="w-px flex-1 bg-chalk/30" />
    </div>
  );
}
