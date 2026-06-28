"use client";

import { clock, minute, statusLabel } from "@/lib/format";

interface Props {
  home: string;
  away: string;
  competition: string;
  scoreHome: number;
  scoreAway: number;
  clockSec: number | null;
  statusId: number | null;
  live: boolean;
}

/** Broadcast-style score bug: home (warm) — score — away (cool). */
export default function Scoreboard({
  home,
  away,
  competition,
  scoreHome,
  scoreAway,
  clockSec,
  statusId,
  live,
}: Props) {
  return (
    <div className="rounded-md border border-line bg-panel/70 px-4 py-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow">{competition}</span>
        <span className="flex items-center gap-1.5 eyebrow">
          {live ? <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" /> : null}
          {statusLabel(statusId)}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="font-display text-2xl leading-none text-home sm:text-3xl">
          {home}
        </span>
        <span className="tnum text-center text-3xl font-semibold leading-none sm:text-4xl">
          {scoreHome}
          <span className="px-2 text-chalk-faint">:</span>
          {scoreAway}
        </span>
        <span className="text-right font-display text-2xl leading-none text-away sm:text-3xl">
          {away}
        </span>
      </div>
      <div className="mt-2 text-center">
        <span className="tnum text-sm text-chalk-dim">
          {clockSec != null ? `${minute(clockSec)} · ${clock(clockSec)}` : "Replay"}
        </span>
      </div>
    </div>
  );
}
