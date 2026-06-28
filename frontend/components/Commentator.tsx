"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { MatchEvent, OddsPoint } from "@/lib/types";

interface Props {
  event: MatchEvent | null;
  latest: OddsPoint | null;
  home: string;
  away: string;
  idle: string;
  serverText?: string | null; // Claude narration for the current event, if arrived
  aiBadge?: boolean; // show the "AI" tag when the line came from Claude
}

/**
 * AI co-commentator. Shows the Claude-generated line (`serverText`) once it
 * arrives; until then it renders an instant local line composed from the
 * event's Momentum Impact Score — cause then effect, never a bet.
 */
export default function Commentator({
  event,
  latest,
  home,
  away,
  idle,
  serverText,
  aiBadge,
}: Props) {
  const reduce = useReducedMotion();
  const line = event ? (serverText ?? narrate(event, latest, home, away)) : idle;
  const key = event ? `${event.ts}-${serverText ? "ai" : "local"}` : "idle";

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-panel/70 px-4 py-3">
      <div className="eyebrow mb-1.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-live" />
        Co-commentator
        {aiBadge ? (
          <span className="rounded-xs border border-live/40 px-1.5 py-px text-[9px] tracking-wider text-live">
            AI
          </span>
        ) : null}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={key}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          className="font-display text-xl leading-snug text-chalk sm:text-2xl"
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function narrate(
  e: MatchEvent,
  latest: OddsPoint | null,
  home: string,
  away: string,
): string {
  const beneficiary = e.side === "home" ? home : e.side === "away" ? away : null;
  const mag = Math.abs(e.impact);
  const chance =
    latest != null
      ? `${Math.round(e.side === "away" ? latest.pAway : latest.pHome)}%`
      : null;

  switch (e.action) {
    case "goal":
      return beneficiary
        ? `Goal — ${beneficiary} now ${home} ${e.scoreHome}–${e.scoreAway} ${away}. The market reads it as ${beneficiary}'s moment${chance ? `, win chance ${chance}` : ""}.`
        : `Goal — ${home} ${e.scoreHome}–${e.scoreAway} ${away}.`;
    case "red_card":
    case "second_yellow":
      return beneficiary
        ? `Red card. Momentum swings to ${beneficiary} — a ${mag.toFixed(0)}-point shift in seconds.`
        : `Red card — a team is down to ten.`;
    case "penalty":
      return `Penalty awarded${beneficiary ? ` to ${beneficiary}` : ""}. The market is bracing for a swing.`;
    case "penalty_outcome":
      return beneficiary
        ? `Penalty settled — the market moves toward ${beneficiary}.`
        : `Penalty settled.`;
    case "var":
      return `VAR check under way — the market is holding its breath.`;
    case "var_end":
      return `VAR done. Play resumes.`;
    case "game_finalised":
      return `Full time. ${home} ${e.scoreHome}–${e.scoreAway} ${away}.`;
    case "halftime_finalised":
      return `Half time. ${home} ${e.scoreHome}–${e.scoreAway} ${away}.`;
    default:
      return beneficiary && mag >= 1
        ? `${e.label} — momentum edges toward ${beneficiary}.`
        : e.label;
  }
}
