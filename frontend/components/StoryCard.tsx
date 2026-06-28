"use client";

import { useMemo, useState } from "react";
import type { MatchEvent, MatchMeta, OddsPoint } from "@/lib/types";
import { actionMeta, impactText, minute, sideColorVar } from "@/lib/format";

interface Props {
  meta: MatchMeta;
  points: OddsPoint[];
  events: MatchEvent[];
  scoreHome: number;
  scoreAway: number;
}

/** The shareable Story of the Match: the momentum arc + biggest swings + recap. */
export default function StoryCard({
  meta,
  points,
  events,
  scoreHome,
  scoreAway,
}: Props) {
  const [copied, setCopied] = useState(false);

  const top = useMemo(
    () =>
      [...events]
        .filter((e) => e.key || Math.abs(e.impact) >= 1)
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 5),
    [events],
  );

  const arc = useMemo(() => sparkline(points), [points]);
  const recap = useMemo(
    () => buildRecap(meta, scoreHome, scoreAway, top),
    [meta, scoreHome, scoreAway, top],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(recap);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-line bg-gradient-to-b from-panel to-void">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="eyebrow">Story of the match</span>
        <button
          onClick={copy}
          className="rounded-sm border border-line bg-panel px-2.5 py-1 text-xs text-chalk transition-colors hover:bg-panel-2"
        >
          {copied ? "Copied" : "Copy recap"}
        </button>
      </div>

      <div className="px-4 py-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-display text-xl text-home">{meta.home}</span>
          <span className="tnum text-2xl font-semibold">
            {scoreHome}
            <span className="px-2 text-chalk-faint">:</span>
            {scoreAway}
          </span>
          <span className="font-display text-xl text-away">{meta.away}</span>
        </div>

        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          className="my-3 h-16 w-full"
          aria-label="Momentum arc"
        >
          <line x1="0" y1="14" x2="100" y2="14" stroke="var(--color-line)" strokeWidth="0.3" />
          {arc ? (
            <path
              d={arc}
              fill="none"
              stroke="var(--color-chalk)"
              strokeWidth="0.8"
              strokeOpacity="0.85"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>

        <p className="mb-4 text-sm leading-relaxed text-chalk-dim">{recap}</p>

        <div className="eyebrow mb-2">Biggest swings</div>
        <ul className="space-y-1.5">
          {top.map((e, i) => {
            const color = sideColorVar(e.side);
            const { glyph } = actionMeta(e.action);
            return (
              <li key={`${e.ts}-${i}`} className="flex items-center gap-2.5 text-sm">
                <span className="tnum w-9 text-chalk-faint">{minute(e.clock)}</span>
                <span
                  className="tnum rounded-xs px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                  style={{ background: color, color: "var(--color-void)" }}
                >
                  {glyph}
                </span>
                <span className="flex-1 truncate text-chalk-dim">{e.label}</span>
                <span className="tnum font-semibold" style={{ color }}>
                  {impactText(e.impact)}
                </span>
              </li>
            );
          })}
          {top.length === 0 ? (
            <li className="text-sm text-chalk-faint">No standout swings in this feed.</li>
          ) : null}
        </ul>
      </div>

      <div className="border-t border-line px-4 py-2 text-center text-[11px] text-chalk-faint">
        PitchPulse · momentum read from market sentiment · not betting
      </div>
    </div>
  );
}

function sparkline(points: OddsPoint[]): string | null {
  if (points.length < 2) return null;
  const n = points.length;
  // pHome 0..100 -> y 28..0 (taller home = higher line)
  return points
    .map((p, i) => {
      const x = (i / (n - 1)) * 100;
      const y = 28 - (p.pHome / 100) * 28;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildRecap(
  meta: MatchMeta,
  scoreHome: number,
  scoreAway: number,
  top: MatchEvent[],
): string {
  const result =
    scoreHome === scoreAway
      ? `${meta.home} and ${meta.away} shared a ${scoreHome}–${scoreAway} draw`
      : scoreHome > scoreAway
        ? `${meta.home} beat ${meta.away} ${scoreHome}–${scoreAway}`
        : `${meta.away} beat ${meta.home} ${scoreAway}–${scoreHome}`;

  if (top.length === 0) {
    return `${result}. A steady match — the market never moved far from where it started.`;
  }
  const biggest = top[0];
  const who = biggest.side === "home" ? meta.home : biggest.side === "away" ? meta.away : "the match";
  const { short } = actionMeta(biggest.action);
  return `${result}. The defining moment: ${short.toLowerCase()} at ${minute(biggest.clock)}, swinging the market ${impactText(biggest.impact)} points toward ${who}. ${top.length} swings shaped the story.`;
}
