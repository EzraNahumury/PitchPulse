/**
 * Smoke test: auth -> pick a World Cup fixture -> build the static MatchState ->
 * print the momentum range, event count, and the top impact moments.
 * Verifies the whole engine on real TxLINE data without starting the server.
 */
import { config } from "./config";
import { getFixtures } from "./txline/client";
import { loadStaticState } from "./match";

async function main() {
  console.log("Smoke: TxLINE base", config.txlineBase);
  const fixtures = await getFixtures();
  console.log("fixtures:", fixtures.length, "competitions:", [...new Set(fixtures.map((f) => f.Competition))]);

  const wc = fixtures.find((f) => f.CompetitionId === config.worldCupCompetitionId) || fixtures[0];
  if (!wc) { console.log("no fixtures available"); return; }
  console.log(`picked ${wc.FixtureId}: ${wc.Participant1} vs ${wc.Participant2} (${wc.Competition})`);

  const state = await loadStaticState(wc.FixtureId);
  const ms = state.ribbon.map((r) => r.m);
  console.log("\n--- MatchState ---");
  console.log("ribbon points:", state.ribbon.length);
  if (ms.length) {
    console.log("momentum m range:", Math.min(...ms).toFixed(1), "..", Math.max(...ms).toFixed(1));
    console.log("latest:", JSON.stringify(state.momentum));
  }
  console.log("score:", JSON.stringify(state.score));
  console.log("events:", state.events.length);
  console.log("\nTop moments by Momentum Impact Score:");
  for (const e of state.topMoments) {
    const sign = e.impact >= 0 ? "+" : "";
    console.log(`  [${sign}${e.impact}]  ${e.action.padEnd(16)}  ${e.label}`);
  }
}

main().catch((e) => { console.error("SMOKE FAILED:", e.message || e); process.exit(1); });
