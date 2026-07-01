/** Match metadata + state assembly on top of the TxLINE client + engine. */
import { Fixture, getFixtures, getOdds, getScores } from "./txline/client";
import { buildTimeline } from "./engine/momentum";
import { synthesizeOdds } from "./replay/synthOdds";
import { MatchMeta, MatchState } from "./engine/types";

export type MatchStatus = "upcoming" | "live" | "finished";

// Real status per fixture, cached briefly so a fixtures-list refresh doesn't
// re-fetch every match's scores. Derived from the score feed's Action markers:
// game_finalised = definitively over; kickoff without it = in play; neither =
// not started. (StatusId enum is unreliable on devnet, so we don't rely on it.)
const STATUS_TTL_MS = 30_000;
const statusCache = new Map<number, { status: MatchStatus; ts: number }>();

export async function fixtureStatus(fixtureId: number): Promise<MatchStatus> {
  const cached = statusCache.get(fixtureId);
  if (cached && Date.now() - cached.ts < STATUS_TTL_MS) return cached.status;

  let status: MatchStatus = "upcoming";
  try {
    const scores = await getScores(fixtureId);
    let started = false;
    let finished = false;
    for (const r of scores) {
      const a = (r as any)?.Action;
      if (a === "game_finalised") finished = true;
      else if (a === "kickoff") started = true;
    }
    status = finished ? "finished" : started ? "live" : "upcoming";
  } catch {
    // leave as upcoming if scores are unavailable
  }
  statusCache.set(fixtureId, { status, ts: Date.now() });
  return status;
}

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
