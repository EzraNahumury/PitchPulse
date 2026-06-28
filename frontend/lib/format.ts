import type { MatchEvent, Side } from "./types";

/** Match seconds -> "72:14". Null/unknown -> "--:--". */
export function clock(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "--:--";
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

/** Just the minute, broadcast style: 72'. */
export function minute(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "--'";
  return `${Math.floor(seconds / 60)}'`;
}

// Best-effort TxLINE StatusId -> phase label. 4 = 2nd-half in play (verified
// in the spike); the rest are reasonable fallbacks.
const STATUS: Record<number, string> = {
  1: "Pre-match",
  2: "1st half",
  3: "Half time",
  4: "2nd half",
  5: "Extra time",
  6: "Penalties",
  7: "Full time",
};

export function statusLabel(statusId: number | null | undefined): string {
  if (statusId == null) return "Replay";
  return STATUS[statusId] ?? "In play";
}

interface ActionMeta {
  glyph: string;
  short: string;
}

// Glyph + short label per TxLINE Action. Glyphs are text so they render
// crisply at any size without an icon dependency.
const ACTIONS: Record<string, ActionMeta> = {
  goal: { glyph: "GOAL", short: "Goal" },
  penalty: { glyph: "PK", short: "Penalty" },
  penalty_outcome: { glyph: "PK", short: "Penalty outcome" },
  red_card: { glyph: "RED", short: "Red card" },
  second_yellow: { glyph: "RED", short: "Second yellow" },
  yellow_card: { glyph: "YEL", short: "Yellow card" },
  var: { glyph: "VAR", short: "VAR check" },
  var_end: { glyph: "VAR", short: "VAR complete" },
  substitution: { glyph: "SUB", short: "Substitution" },
  shot: { glyph: "SHOT", short: "Shot" },
  corner: { glyph: "COR", short: "Corner" },
  additional_time: { glyph: "+T", short: "Added time" },
  kickoff: { glyph: "KO", short: "Kick-off" },
  halftime_finalised: { glyph: "HT", short: "Half time" },
  game_finalised: { glyph: "FT", short: "Full time" },
};

export function actionMeta(action: string): ActionMeta {
  return ACTIONS[action] ?? { glyph: action.slice(0, 4).toUpperCase(), short: action };
}

/** Signed impact, e.g. +38, -22, 0. */
export function impactText(impact: number): string {
  const r = Math.round(impact * 10) / 10;
  return r > 0 ? `+${r}` : `${r}`;
}

/** Which team a value/side leans to, for colouring. */
export function sideColorVar(side: Side): string {
  if (side === "home") return "var(--color-home)";
  if (side === "away") return "var(--color-away)";
  return "var(--color-draw)";
}

/** A momentum scalar m (-100..100) -> the favoured side. */
export function leanSide(m: number): Side {
  if (m > 1.5) return "home";
  if (m < -1.5) return "away";
  return "neutral";
}

export function isKeyEvent(e: MatchEvent): boolean {
  return e.key || Math.abs(e.impact) >= 3;
}
