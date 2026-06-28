/** Match metadata + state assembly on top of the TxLINE client + engine. */
import { Fixture, getFixtures, getOdds, getScores } from "./txline/client";
import { buildTimeline } from "./engine/momentum";
import { synthesizeOdds } from "./replay/synthOdds";
import { MatchMeta, MatchState } from "./engine/types";

function fallbackMeta(fixtureId: number): MatchMeta {
  return {
    fixtureId,
    competition: "Unknown",
    participant1: "Home",
    participant2: "Away",
    participant1IsHome: true,
    home: "Home",
    away: "Away",
  };
}

export function metaFromFixture(fx: Fixture): MatchMeta {
  const home = fx.Participant1IsHome ? fx.Participant1 : fx.Participant2;
  const away = fx.Participant1IsHome ? fx.Participant2 : fx.Participant1;
  return {
    fixtureId: fx.FixtureId,
    competition: fx.Competition,
    participant1: fx.Participant1,
    participant2: fx.Participant2,
    participant1IsHome: fx.Participant1IsHome,
    home, away,
  };
}

export async function getFixtureById(fixtureId: number): Promise<Fixture | undefined> {
  const all = await getFixtures();
  return all.find((f) => f.FixtureId === fixtureId);
}

/** Fetch odds + scores snapshots and build the full static MatchState. */
export async function loadStaticState(
  fixtureId: number,
  source: "real" | "demo" = "real",
): Promise<MatchState> {
  const { meta, odds, scores } = await loadSnapshots(fixtureId, source);
  return buildTimeline(odds, scores, meta);
}

/**
 * Raw snapshot arrays (used by the replay streamer).
 * source="demo" swaps the flat real odds for synthesized moving odds so the
 * ribbon actually swings on goals; the score events stay real.
 */
export async function loadSnapshots(
  fixtureId: number,
  source: "real" | "demo" = "real",
) {
  const [fx, realOdds, scores] = await Promise.all([
    getFixtureById(fixtureId),
    source === "demo" ? Promise.resolve([] as any[]) : getOdds(fixtureId),
    getScores(fixtureId),
  ]);
  const meta: MatchMeta = fx ? metaFromFixture(fx) : fallbackMeta(fixtureId);
  const odds = source === "demo" ? synthesizeOdds(scores, meta) : realOdds;
  return { meta, odds, scores };
}
