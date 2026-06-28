/**
 * Synthetic moving-odds generator for DEMO replay.
 *
 * The devnet sample odds are pre-match (InRunning:false) and effectively flat,
 * so a real-snapshot replay never makes the Momentum Ribbon swing. For the demo
 * we keep the REAL score events but synthesize a plausible, deterministic
 * win-probability track that reacts to them: a goal snaps the line toward the
 * scorer, a red card pushes it toward the other team. Fed through the SAME
 * MomentumEngine, so impact scores and the ribbon behave exactly as they will
 * on live in-play odds — just visibly.
 *
 * This is clearly labelled "Simulated odds" in the UI. It is a demo aid, not
 * real market data.
 */
import { MatchMeta } from "../engine/types";

interface SynthOdds {
  SuperOddsType: "1X2_PARTICIPANT_RESULT";
  MarketPeriod: null;
  PriceNames: ["part1", "draw", "part2"];
  Pct: [string, string, string];
  Ts: number;
  InRunning: true;
}

// Deterministic PRNG so the demo replays identically every time.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Home-dominance scalar s in [-0.95, 0.95] -> [pHome, pDraw, pAway] (sum 100). */
function probsFromS(s: number): [number, number, number] {
  const draw = clamp(30 - 20 * Math.abs(s), 6, 32);
  const rem = 100 - draw;
  const pHome = rem * (0.5 + 0.5 * s);
  const pAway = rem - pHome;
  return [pHome, draw, pAway];
}

function toRow(meta: MatchMeta, ts: number, s: number): SynthOdds {
  const [pHome, pDraw, pAway] = probsFromS(s);
  // engine maps part1 -> participant1; convert home/away back to participant order
  const p1 = meta.participant1IsHome ? pHome : pAway;
  const p2 = meta.participant1IsHome ? pAway : pHome;
  const f = (n: number) => n.toFixed(3);
  return {
    SuperOddsType: "1X2_PARTICIPANT_RESULT",
    MarketPeriod: null,
    PriceNames: ["part1", "draw", "part2"],
    Pct: [f(p1), f(pDraw), f(p2)],
    Ts: ts,
    InRunning: true,
  };
}

interface Shock {
  ts: number;
  ds: number; // signed change to s (positive = toward home)
}

/** Read cumulative home/away goals + red cards from a raw score row, if present. */
function readTotals(meta: MatchMeta, row: any) {
  const g = (key: string) => row?.Score?.[key]?.Total ?? {};
  const p1 = g("Participant1");
  const p2 = g("Participant2");
  const home = meta.participant1IsHome ? p1 : p2;
  const away = meta.participant1IsHome ? p2 : p1;
  return {
    homeGoals: home.Goals ?? 0,
    awayGoals: away.Goals ?? 0,
    homeRed: home.RedCards ?? 0,
    awayRed: away.RedCards ?? 0,
  };
}

export function synthesizeOdds(scores: any[], meta: MatchMeta): SynthOdds[] {
  const rows = scores
    .filter((r) => Number.isFinite(Number(r?.Ts)))
    .sort((a, b) => Number(a.Ts) - Number(b.Ts));
  if (rows.length < 2) return [];

  const t0 = Number(rows[0].Ts);
  const t1 = Number(rows[rows.length - 1].Ts);
  if (t1 <= t0) return [];

  // Detect goal / red-card shocks from cumulative totals.
  const shocks: Shock[] = [];
  let prev = { homeGoals: 0, awayGoals: 0, homeRed: 0, awayRed: 0 };
  let seenScore = false;
  for (const r of rows) {
    if (!r?.Score) continue;
    const t = readTotals(meta, r);
    if (seenScore) {
      const dHomeG = t.homeGoals - prev.homeGoals;
      const dAwayG = t.awayGoals - prev.awayGoals;
      const dHomeR = t.homeRed - prev.homeRed;
      const dAwayR = t.awayRed - prev.awayRed;
      if (dHomeG > 0) shocks.push({ ts: Number(r.Ts) + 1, ds: 0.3 * dHomeG });
      if (dAwayG > 0) shocks.push({ ts: Number(r.Ts) + 1, ds: -0.3 * dAwayG });
      if (dAwayR > 0) shocks.push({ ts: Number(r.Ts) + 1, ds: 0.16 * dAwayR }); // away down a man -> home
      if (dHomeR > 0) shocks.push({ ts: Number(r.Ts) + 1, ds: -0.16 * dHomeR });
    }
    prev = t;
    seenScore = true;
  }

  const finalDiff = prev.homeGoals - prev.awayGoals;
  const rnd = mulberry32(meta.fixtureId || 1);

  // Sample the curve every ~22s of match time, plus a post-shock point per shock.
  const STEP = 22_000;
  const samples: number[] = [];
  for (let t = t0; t <= t1; t += STEP) samples.push(t);
  if (samples[samples.length - 1] !== t1) samples.push(t1);
  for (const sh of shocks) samples.push(sh.ts);
  samples.sort((a, b) => a - b);

  // Walk time, mean-reverting toward the unfolding scoreline, applying shocks.
  const out: SynthOdds[] = [];
  let s = clamp(0.08 + (rnd() - 0.5) * 0.1, -0.3, 0.3); // slight home edge to start
  let goalDiff = 0;
  let si = 0; // shock index (shocks sorted)
  const sortedShocks = [...shocks].sort((a, b) => a.ts - b.ts);

  for (const ts of samples) {
    // apply any shocks at or before this sample
    while (si < sortedShocks.length && sortedShocks[si].ts <= ts) {
      s = clamp(s + sortedShocks[si].ds, -0.95, 0.95);
      goalDiff += sortedShocks[si].ds > 0 ? Math.round(sortedShocks[si].ds / 0.3) : 0;
      si++;
    }
    // mean-revert toward the scoreline-implied target + light noise
    const target = Math.tanh(finalDiffWeighted(goalDiff, finalDiff) * 0.5);
    s += (target - s) * 0.06 + (rnd() - 0.5) * 0.03;
    s = clamp(s, -0.95, 0.95);
    out.push(toRow(meta, ts, s));
  }

  return out;
}

// Bias the drift target gently toward the eventual result so the curve reads as
// a coherent story, without fully revealing it early.
function finalDiffWeighted(running: number, final: number): number {
  return running * 0.7 + final * 0.15;
}
