"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMatchStream } from "@/lib/useMatchStream";
import { fetchNarration } from "@/lib/narrate";
import { isKeyEvent } from "@/lib/format";
import { Brand, ComplianceChip } from "@/components/Brand";
import Scoreboard from "@/components/Scoreboard";
import MomentumRibbon from "@/components/MomentumRibbon";
import Commentator from "@/components/Commentator";
import EventFeed from "@/components/EventFeed";
import ReplayControls from "@/components/ReplayControls";
import StoryCard from "@/components/StoryCard";
import WalletStatus from "@/components/WalletStatus";

export default function MatchView({ fixtureId }: { fixtureId: number }) {
  const s = useMatchStream(fixtureId, { mode: "demo", stepMs: 200 });
  const [showStory, setShowStory] = useState(false);

  const lastNarratable = useMemo(() => {
    for (let i = s.events.length - 1; i >= 0; i--) {
      if (isKeyEvent(s.events[i])) return s.events[i];
    }
    return s.events[s.events.length - 1] ?? null;
  }, [s.events]);

  // Claude narration for the current headline event. Fetched once per event;
  // live values are read through a ref so a new odds tick doesn't refetch.
  const [narration, setNarration] = useState<{
    ts: number;
    text: string;
    source: string;
  } | null>(null);
  const liveRef = useRef({ ev: lastNarratable, latest: s.latest, meta: s.meta });
  useEffect(() => {
    liveRef.current = { ev: lastNarratable, latest: s.latest, meta: s.meta };
  });
  const narrateTs = lastNarratable?.ts ?? null;

  useEffect(() => {
    const { ev, latest, meta } = liveRef.current;
    if (!ev || !meta) return;
    const ac = new AbortController();
    fetchNarration(ev, latest, meta.home, meta.away, ac.signal).then((n) => {
      if (n && !ac.signal.aborted) {
        setNarration({ ts: ev.ts, text: n.text, source: n.source });
      }
    });
    return () => ac.abort();
  }, [narrateTs]);

  const serverText =
    narration && lastNarratable && narration.ts === lastNarratable.ts
      ? narration.text
      : null;
  const aiBadge = !!serverText && narration?.source === "ollama";

  const timeline = useMemo(() => [...s.events].reverse(), [s.events]);
  const swings = useMemo(
    () =>
      [...s.events]
        .filter((e) => e.key || Math.abs(e.impact) >= 1)
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 5),
    [s.events],
  );

  const storyOpen = showStory || s.status === "done";

  return (
    <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Brand small />
          <Link
            href="/"
            className="text-sm text-chalk-dim transition-colors hover:text-chalk"
          >
            ← Matches
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex">
            <ComplianceChip />
          </span>
          <WalletStatus />
        </div>
      </header>

      {s.status === "error" && !s.meta ? (
        <ErrorCard message={s.error} onRetry={s.restart} />
      ) : !s.meta ? (
        <LoadingCard />
      ) : (
        <main className="space-y-4 pb-16">
          <Scoreboard
            home={s.meta.home}
            away={s.meta.away}
            competition={s.meta.competition}
            scoreHome={s.scoreHome}
            scoreAway={s.scoreAway}
            clockSec={s.clockSec}
            statusId={s.finalState?.statusId ?? null}
            live={s.mode === "live" && s.status === "streaming"}
          />

          <ReplayControls
            mode={s.mode}
            stepMs={s.stepMs}
            status={s.status}
            setMode={s.setMode}
            setStepMs={s.setStepMs}
            restart={s.restart}
          />

          <div className="rounded-md border border-line bg-panel/40 p-4 sm:p-5">
            <div className="mb-3 flex justify-end">
              <SourceBadge mode={s.mode} />
            </div>
            <MomentumRibbon
              points={s.points}
              latest={s.latest}
              events={s.events}
              pending={s.pending}
              home={s.meta.home}
              away={s.meta.away}
            />
          </div>

          <Commentator
            event={lastNarratable}
            latest={s.latest}
            home={s.meta.home}
            away={s.meta.away}
            serverText={serverText}
            aiBadge={aiBadge}
            idle="Reading the match — momentum moves the instant the market does."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <EventFeed
              title="Timeline"
              rows={timeline}
              empty="Events drop in as the match unfolds."
            />
            <EventFeed
              title="Biggest swings"
              rows={swings}
              rank
              empty="The biggest market swings will rank here."
            />
          </div>

          {storyOpen ? (
            <StoryCard
              meta={s.meta}
              points={s.points}
              events={s.events}
              scoreHome={s.scoreHome}
              scoreAway={s.scoreAway}
            />
          ) : (
            <button
              onClick={() => setShowStory(true)}
              className="w-full rounded-md border border-line bg-panel/50 py-3 text-sm font-medium text-chalk transition-colors hover:bg-panel"
            >
              Story of the match →
            </button>
          )}
        </main>
      )}
    </div>
  );
}

function SourceBadge({ mode }: { mode: "demo" | "replay" | "live" }) {
  const map = {
    demo: { text: "Simulated odds", color: "var(--color-draw)" },
    replay: { text: "Real odds · flat sample", color: "var(--color-chalk-faint)" },
    live: { text: "Live odds", color: "var(--color-live)" },
  } as const;
  const { text, color } = map[mode];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px]"
      style={{ color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="space-y-4 pb-16">
      <div className="skeleton h-24 rounded-md" />
      <div className="skeleton h-64 rounded-md" />
      <div className="skeleton h-20 rounded-md" />
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-md border border-home/40 bg-home/5 px-4 py-6 text-sm">
      <p className="mb-1 font-display text-lg text-chalk">Can&apos;t reach the match feed</p>
      <p className="mb-4 text-chalk-dim">
        {message ?? "The backend isn't responding."} Start the backend on port
        8787, then try again.
      </p>
      <button
        onClick={onRetry}
        className="rounded-sm border border-line bg-panel px-3 py-1.5 text-chalk transition-colors hover:bg-panel-2"
      >
        Try again
      </button>
    </div>
  );
}
