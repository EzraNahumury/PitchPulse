"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FixtureSummary } from "@/lib/types";
import { fetchFixtureStatuses, type MatchStatus } from "@/lib/api";
import { flagCard } from "@/lib/flags";

function startMs(startTime: number): number {
  return startTime < 1e12 ? startTime * 1000 : startTime;
}

function kickoff(startTime: number): string {
  const d = new Date(startMs(startTime));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// A full match (play + half-time + stoppage) is treated as ~140 minutes.
const MATCH_WINDOW_MS = 140 * 60 * 1000;
type Status = MatchStatus;

// Schedule-based status derived from kick-off time (the fixtures feed carries no
// status field). Authoritative in-play status comes from the match view itself.
function statusOf(startTime: number, now: number): Status {
  const start = startMs(startTime);
  if (Number.isNaN(start)) return "upcoming";
  if (now < start) return "upcoming";
  if (now < start + MATCH_WINDOW_MS) return "live";
  return "finished";
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-live/40 bg-live/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-live">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" />
        Live
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-chalk-faint">
        Finished
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-away/35 bg-away/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-away">
      Upcoming
    </span>
  );
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
  // Captured once at mount — the list's status labels don't tick in place.
  const [now] = useState(() => Date.now());
  // Real status from the score feed, fetched after paint; overrides the
  // schedule-based guess as soon as it arrives.
  const [realStatus, setRealStatus] = useState<Record<number, MatchStatus>>({});

  useEffect(() => {
    const ids = fixtures.map((f) => f.fixtureId);
    if (ids.length === 0) return;
    const ac = new AbortController();
    fetchFixtureStatuses(ids, ac.signal)
      .then((m) => {
        if (!ac.signal.aborted) setRealStatus(m);
      })
      .catch(() => {
        /* keep the schedule-based badges on failure */
      });
    return () => ac.abort();
  }, [fixtures]);

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {fixtures.map((f) => {
        const status = realStatus[f.fixtureId] ?? statusOf(f.startTime, now);
        const cta = status === "upcoming" ? "Preview →" : "Replay →";
        return (
          <li key={f.fixtureId}>
            <Link
              href={`/match/${f.fixtureId}`}
              className="group block rounded-xl border border-line bg-panel/60 p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_18px_44px_-30px_rgba(15,23,20,0.4)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-xs font-semibold text-chalk-dim transition-colors group-hover:text-live">
                  {cta}
                </span>
              </div>
              <div className="min-w-0">
                <Team name={f.home} side="home" />
                <div className="flex items-center py-1.5">
                  <span className="flex w-9 shrink-0 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-chalk-faint">
                    vs
                  </span>
                </div>
                <Team name={f.away} side="away" />
              </div>
              <div className="eyebrow mt-3 border-t border-line pt-3">
                {f.competition}
                {kickoff(f.startTime) ? ` · ${kickoff(f.startTime)}` : ""}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
