"use client";

import { useEffect, useState } from "react";
import { fetchFixtures } from "@/lib/api";
import type { FixtureSummary } from "@/lib/types";
import { Brand, ComplianceChip } from "@/components/Brand";
import HeroRibbon from "@/components/HeroRibbon";
import FixtureList from "@/components/FixtureList";
import WalletStatus from "@/components/WalletStatus";

export default function Home() {
  const [fixtures, setFixtures] = useState<FixtureSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    fetchFixtures(true, ac.signal)
      .then((list) => {
        if (!ac.signal.aborted) setFixtures(list);
      })
      .catch((e) => {
        if (!ac.signal.aborted) setError(e.message ?? "Couldn't load fixtures.");
      });
    return () => ac.abort();
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setFixtures(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-3 py-5">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex">
            <ComplianceChip />
          </span>
          <WalletStatus />
        </div>
      </header>

      <section className="grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow mb-4">World Cup · second screen</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
            See who&apos;s winning
            <br />
            <span className="text-home">the moment</span>.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-chalk-dim">
            The live momentum of every match, read from the market and explained
            as it happens. Scores tell you <em className="not-italic text-chalk">what</em>.
            PitchPulse shows you <em className="not-italic text-chalk">why</em>.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-panel/40 p-5">
          <HeroRibbon />
          <p className="mt-3 text-sm text-chalk-faint">
            The ribbon swings toward whichever side the market favours — and snaps
            the instant a goal lands.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Matches</h2>
          <span className="eyebrow">tap to replay</span>
        </div>

        {error ? (
          <div className="rounded-md border border-home/40 bg-home/5 px-4 py-5 text-sm">
            <p className="mb-3 text-chalk">{error}</p>
            <button
              onClick={retry}
              className="rounded-sm border border-line bg-panel px-3 py-1.5 text-chalk transition-colors hover:bg-panel-2"
            >
              Try again
            </button>
          </div>
        ) : fixtures === null ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[72px] rounded-md" />
            ))}
          </div>
        ) : fixtures.length === 0 ? (
          <p className="rounded-md border border-line bg-panel/50 px-4 py-6 text-sm text-chalk-dim">
            No World Cup fixtures on the feed right now. Check back at kickoff.
          </p>
        ) : (
          <FixtureList fixtures={fixtures} />
        )}
      </section>

      <footer className="mt-auto border-t border-line py-5 text-center text-xs text-chalk-faint">
        Built on TxLINE live data · sign-up via Solana · entertainment &amp;
        information, not betting
      </footer>
    </div>
  );
}
