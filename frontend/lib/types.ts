// Mirrors the backend engine types (backend/src/engine/types.ts).
// Kept in sync by hand — the backend is the source of truth.

export interface TeamScore {
  goals: number;
  yellow: number;
  red: number;
  corners: number;
}

export interface OddsPoint {
  ts: number;
  pHome: number; // demargined fair win probability %, home
  pDraw: number;
  pAway: number;
  m: number; // momentum scalar = pHome - pAway, range [-100, 100]
}

export type Side = "home" | "away" | "neutral";

export interface MatchEvent {
  ts: number;
  clock: number | null; // match seconds, if known
  action: string; // raw TxLINE Action (goal, red_card, ...)
  side: Side;
  impact: number; // Momentum Impact Score = signed delta in m across the event
  scoreHome: number;
  scoreAway: number;
  label: string;
  key: boolean; // narratable headline moment
}

export interface MatchMeta {
  fixtureId: number;
  competition: string;
  participant1: string;
  participant2: string;
  participant1IsHome: boolean;
  home: string;
  away: string;
}

export interface MatchState {
  meta: MatchMeta;
  statusId: number | null;
  clock: number | null;
  score: { home: TeamScore; away: TeamScore };
  momentum: OddsPoint | null;
  ribbon: OddsPoint[];
  events: MatchEvent[];
  topMoments: MatchEvent[];
}

// Shape returned by GET /api/fixtures
export interface FixtureSummary {
  fixtureId: number;
  competition: string;
  competitionId: number;
  startTime: number;
  home: string;
  away: string;
}

// demo = synthesized moving odds (snappy), replay = real flat snapshot, live = upstream
export type StreamMode = "demo" | "replay" | "live";
