/** Wire upstream TxLINE SSE (odds + scores) into a live MomentumEngine. */
import { openStream } from "./txline/client";
import { MomentumEngine } from "./engine/momentum";
import { getFixtureById, metaFromFixture } from "./match";
import { MatchMeta } from "./engine/types";

export async function startLiveEngine(fixtureId: number) {
  const fx = await getFixtureById(fixtureId);
  const meta: MatchMeta = fx
    ? metaFromFixture(fx)
    : { fixtureId, competition: "Unknown", participant1: "Home", participant2: "Away", participant1IsHome: true, home: "Home", away: "Away" };
  const engine = new MomentumEngine(meta);
  const stopOdds = await openStream("odds", fixtureId, (p) => engine.ingestOdds(p), (e) => engine.emit("upstream-error", e));
  const stopScores = await openStream("scores", fixtureId, (r) => engine.ingestScore(r), (e) => engine.emit("upstream-error", e));
  return { engine, stop: () => { stopOdds(); stopScores(); } };
}
