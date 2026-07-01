"use client";

import Image from "next/image";
import Link from "next/link";
import type { FixtureSummary } from "@/lib/types";
import { flagCard } from "@/lib/flags";

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

/** Small flag chip cropped from the country card (frame zoomed out). */
function Flag({ team }: { team: string }) {
  const src = flagCard(team);
  if (!src) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-xs font-semibold text-chalk-faint ring-1 ring-line">
        {team.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-neutral-200">
      <Image
        src={src}
        alt={`${team} flag`}
        fill
        sizes="36px"
        className="scale-[1.7] object-cover"
        style={{ objectPosition: "center 40%" }}
      />
    </span>
  );
}

function Team({ name, side }: { name: string; side: "home" | "away" }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Flag team={name} />
      <span
        className={`head truncate text-[1.05rem] leading-none ${
          side === "home" ? "text-home" : "text-away"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

export default function FixtureList({ fixtures }: { fixtures: FixtureSummary[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {fixtures.map((f) => (
        <li key={f.fixtureId}>
          <Link
            href={`/match/${f.fixtureId}`}
            className="group block rounded-xl border border-line bg-panel/60 p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_18px_44px_-30px_rgba(15,23,20,0.4)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Team name={f.home} side="home" />
                <div className="flex items-center py-1.5">
                  <span className="flex w-9 shrink-0 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-chalk-faint">
                    vs
                  </span>
                </div>
                <Team name={f.away} side="away" />
              </div>
              <span className="ml-2 shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-chalk-dim transition-colors group-hover:border-live group-hover:text-live">
                Replay →
              </span>
            </div>
            <div className="eyebrow mt-3 border-t border-line pt-3">
              {f.competition}
              {kickoff(f.startTime) ? ` · ${kickoff(f.startTime)}` : ""}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
