/**
 * MomentumEngine — the core of PitchPulse.
 *
 * Consumes TxLINE odds + scores payloads and produces:
 *   - the Momentum Ribbon (home/draw/away demargined probability over time),
 *   - per-event Momentum Impact Scores (how much the market's belief moved),
 *   - a normalized, fan-readable match state.
 *
 * It works incrementally (live/replay, emits events) and can also build a full
 * static timeline from snapshot arrays (powers REST + the Story of the Match).
 */
import { EventEmitter } from "events";
import { MatchEvent, MatchMeta, MatchState, OddsPoint, TeamScore } from "./types";

// Actions that can move belief / matter to a fan.
const SIGNIFICANT = new Set([
  "goal", "penalty", "penalty_outcome", "red_card", "second_yellow", "var", "var_end",
  "yellow_card", "substitution", "shot", "additional_time", "kickoff",
  "halftime_finalised", "game_finalised",
]);
// Headline moments for narration / Story.
const KEY = new Set([
  "goal", "penalty", "penalty_outcome", "red_card", "second_yellow", "var", "game_finalised",
]);

function pct(v: any): number | null {
  if (v === "NA" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function emptyScore(): TeamScore { return { goals: 0, yellow: 0, red: 0, corners: 0 }; }
function totals(scoreObj: any, key: string): TeamScore {
  const t = (scoreObj && scoreObj[key] && scoreObj[key].Total) || {};
  return { goals: t.Goals || 0, yellow: t.YellowCards || 0, red: t.RedCards || 0, corners: t.Corners || 0 };
}

/** Is this odds payload the full-time 1X2 (match result) line? */
export function isMatchResult(p: any): boolean {
  return p && p.SuperOddsType === "1X2_PARTICIPANT_RESULT" &&
    (p.MarketPeriod == null || p.MarketPeriod === "");
}

export class MomentumEngine extends EventEmitter {
  meta: MatchMeta;
  ribbon: OddsPoint[] = [];
  events: MatchEvent[] = [];
  score = { home: emptyScore(), away: emptyScore() };
  statusId: number | null = null;
  clock: number | null = null;
  private lastM = 0;
  private lastTs = 0;
  // events awaiting an odds tick after them to finalize their impact
  private pending: { ev: MatchEvent; mBefore: number }[] = [];

  constructor(meta: MatchMeta) {
    super();
    this.meta = meta;
  }

  /** Feed one odds payload (any market). Only the match-result line drives the ribbon. */
  ingestOdds(p: any) {
    if (!isMatchResult(p)) return;
    const names: string[] = p.PriceNames || [];
    const pctArr: any[] = p.Pct || [];
    const idx = (n: string) => names.indexOf(n);
    const p1 = pct(pctArr[idx("part1")]);
    const pd = pct(pctArr[idx("draw")]);
    const p2 = pct(pctArr[idx("part2")]);
    if (p1 == null || p2 == null) return;

    const pHome = this.meta.participant1IsHome ? p1 : p2;
    const pAway = this.meta.participant1IsHome ? p2 : p1;
    const ts = Number(p.Ts) || Date.now();
    const point: OddsPoint = {
      ts,
      pHome: round2(pHome),
      pDraw: round2(pd ?? 0),
      pAway: round2(pAway),
      m: round2(pHome - pAway),
    };

    this.ribbon.push(point);
    this.lastM = point.m;
    this.lastTs = ts;

    // finalize any pending events now that we have a post-event belief reading
    if (this.pending.length) {
      const stillPending: typeof this.pending = [];
      for (const item of this.pending) {
        if (ts >= item.ev.ts) {
          item.ev.impact = round1(point.m - item.mBefore);
          item.ev.side = item.ev.impact > 0.5 ? "home" : item.ev.impact < -0.5 ? "away" : "neutral";
          item.ev.label = this.labelFor(item.ev);
          this.emit("event", item.ev);
        } else {
          stillPending.push(item);
        }
      }
      this.pending = stillPending;
    }
    this.emit("momentum", point);
  }

  /** Feed one score/event payload. Updates state and may create a match event. */
  ingestScore(row: any) {
    if (row.StatusId != null) this.statusId = row.StatusId;
    if (row.Clock && typeof row.Clock.Seconds === "number") this.clock = row.Clock.Seconds;
    if (row.Score) {
      const p1 = totals(row.Score, "Participant1");
      const p2 = totals(row.Score, "Participant2");
      this.score.home = this.meta.participant1IsHome ? p1 : p2;
      this.score.away = this.meta.participant1IsHome ? p2 : p1;
    }

    const action: string = row.Action;
    if (!action || !SIGNIFICANT.has(action)) return;

    const ev: MatchEvent = {
      ts: Number(row.Ts) || Date.now(),
      clock: this.clock,
      action,
      side: "neutral",
      impact: 0,
      scoreHome: this.score.home.goals,
      scoreAway: this.score.away.goals,
      label: "",
      key: KEY.has(action),
    };
    ev.label = this.labelFor(ev);
    this.events.push(ev);
    // defer impact until the next odds tick after this event
    this.pending.push({ ev, mBefore: this.lastM });
    this.emit("event:pending", ev);
  }

  /** Resolve any still-pending impacts using the last known momentum. */
  flush() {
    for (const item of this.pending) {
      item.ev.impact = round1(this.lastM - item.mBefore);
      item.ev.side = item.ev.impact > 0.5 ? "home" : item.ev.impact < -0.5 ? "away" : "neutral";
      item.ev.label = this.labelFor(item.ev);
      this.emit("event", item.ev);
    }
    this.pending = [];
  }

  private labelFor(ev: MatchEvent): string {
    const benef = ev.side === "home" ? this.meta.home : ev.side === "away" ? this.meta.away : null;
    const other = benef === this.meta.home ? this.meta.away : this.meta.home;
    const line = `${this.meta.home} ${ev.scoreHome}-${ev.scoreAway} ${this.meta.away}`;
    switch (ev.action) {
      case "goal": return `GOAL${benef ? " — " + benef : ""}  (${line})`;
      case "penalty": return `Penalty${benef ? " to " + benef : ""}`;
      case "penalty_outcome": return `Penalty outcome  (${line})`;
      case "red_card":
      case "second_yellow": return `Red card${other ? " — " + other + " down to 10" : ""}`;
      case "yellow_card": return "Yellow card";
      case "var": return "VAR check under way";
      case "var_end": return "VAR check complete";
      case "substitution": return "Substitution";
      case "shot": return "Shot";
      case "additional_time": return "Added time";
      case "kickoff": return "Kick-off";
      case "halftime_finalised": return `Half time  (${line})`;
      case "game_finalised": return `Full time  (${line})`;
      default: return ev.action;
    }
  }

  /** Current normalized snapshot. */
  snapshot(): MatchState {
    const sorted = [...this.events].sort((a, b) => a.ts - b.ts);
    const top = [...this.events]
      .filter((e) => e.key || Math.abs(e.impact) >= 3)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 6);
    return {
      meta: this.meta,
      statusId: this.statusId,
      clock: this.clock,
      score: this.score,
      momentum: this.ribbon.length ? this.ribbon[this.ribbon.length - 1] : null,
      ribbon: this.ribbon,
      events: sorted,
      topMoments: top,
    };
  }
}

function round1(n: number) { return Math.round(n * 10) / 10; }
function round2(n: number) { return Math.round(n * 100) / 100; }

/**
 * Build a full static timeline from snapshot arrays by feeding them in
 * timestamp order through a fresh engine. Used by REST and the Story card.
 */
export function buildTimeline(odds: any[], scores: any[], meta: MatchMeta): MatchState {
  const engine = new MomentumEngine(meta);
  type Item = { ts: number; kind: "odds" | "score"; row: any };
  const items: Item[] = [];
  for (const o of odds) if (isMatchResult(o)) items.push({ ts: Number(o.Ts) || 0, kind: "odds", row: o });
  for (const s of scores) items.push({ ts: Number(s.Ts) || 0, kind: "score", row: s });
  items.sort((a, b) => a.ts - b.ts);
  for (const it of items) {
    if (it.kind === "odds") engine.ingestOdds(it.row);
    else engine.ingestScore(it.row);
  }
  engine.flush();
  return engine.snapshot();
}
