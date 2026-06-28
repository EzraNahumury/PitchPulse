/** Match metadata + state assembly on top of the TxLINE client + engine. */
import { Fixture, getFixtures, getOdds, getScores } from "./txline/client";
import { buildTimeline } from "./engine/momentum";
import { MatchMeta, MatchState } from "./engine/types";

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
export async function loadStaticState(fixtureId: number): Promise<MatchState> {
  const [fx, odds, scores] = await Promise.all([
    getFixtureById(fixtureId),
    getOdds(fixtureId),
    getScores(fixtureId),
  ]);
  const meta: MatchMeta = fx
    ? metaFromFixture(fx)
    : { fixtureId, competition: "Unknown", participant1: "Home", participant2: "Away", participant1IsHome: true, home: "Home", away: "Away" };
  return buildTimeline(odds, scores, meta);
}

/** Raw snapshot arrays (used by the replay streamer). */
export async function loadSnapshots(fixtureId: number) {
  const [fx, odds, scores] = await Promise.all([
    getFixtureById(fixtureId),
    getOdds(fixtureId),
    getScores(fixtureId),
  ]);
  const meta: MatchMeta = fx
    ? metaFromFixture(fx)
    : { fixtureId, competition: "Unknown", participant1: "Home", participant2: "Away", participant1IsHome: true, home: "Home", away: "Away" };
  return { meta, odds, scores };
}
