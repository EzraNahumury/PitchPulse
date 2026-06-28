"use client";

import Link from "next/link";
import type { FixtureSummary } from "@/lib/types";

function kickoff(startTime: number): string {
  const ms = startTime < 1e12 ? startTime * 1000 : startTime;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FixtureList({ fixtures }: { fixtures: FixtureSummary[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {fixtures.map((f) => (
        <li key={f.fixtureId}>
          <Link
            href={`/match/${f.fixtureId}`}
            className="group flex items-center justify-between rounded-md border border-line bg-panel/50 px-4 py-3.5 transition-colors hover:border-chalk-faint hover:bg-panel"
          >
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-display text-lg leading-none text-home">
                  {f.home}
                </span>
                <span className="text-chalk-faint">v</span>
                <span className="font-display text-lg leading-none text-away">
                  {f.away}
                </span>
              </div>
              <div className="eyebrow">
                {f.competition}
                {kickoff(f.startTime) ? ` · ${kickoff(f.startTime)}` : ""}
              </div>
            </div>
            <span className="ml-3 shrink-0 rounded-sm border border-line px-2 py-1 text-xs text-chalk-dim transition-colors group-hover:border-live group-hover:text-live">
              Replay →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
