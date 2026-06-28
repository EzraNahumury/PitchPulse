export interface TeamScore { goals: number; yellow: number; red: number; corners: number; }

export interface OddsPoint {
  ts: number;
  pHome: number;   // demargined fair win probability %, home
  pDraw: number;
  pAway: number;
  m: number;       // momentum scalar = pHome - pAway, range [-100, 100]
}

export interface MatchEvent {
  ts: number;
  clock: number | null;       // match seconds, if known
  action: string;             // raw TxLINE Action (goal, red_card, ...)
  side: "home" | "away" | "neutral";
  impact: number;             // Momentum Impact Score = signed delta in m across the event
  scoreHome: number;
  scoreAway: number;
  label: string;
  key: boolean;               // narratable headline moment
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
  momentum: OddsPoint | null;       // latest
  ribbon: OddsPoint[];              // full series
  events: MatchEvent[];             // chronological
  topMoments: MatchEvent[];         // by |impact|
}
