/**
 * AI co-commentator. Turns one match event + the market-implied momentum into a
 * single plain-language sentence via Ollama Cloud (gpt-oss), with strict
 * anti-gambling guardrails. Falls back to a deterministic line when Ollama is
 * not configured or unavailable, so the endpoint always returns something.
 */
import { config } from "../config";

export interface NarrationInput {
  action: string;
  side: "home" | "away" | "neutral";
  home: string;
  away: string;
  scoreHome: number;
  scoreAway: number;
  impact: number; // signed momentum points moved by this event
  pHome?: number; // current market momentum %, home
  pAway?: number; // current market momentum %, away
  clock?: number | null; // match seconds
}

export interface Narration {
  text: string;
  source: "ollama" | "fallback";
}

const SYSTEM = `You are the live co-commentator for PitchPulse, a non-gambling World Cup companion app.
Given one match event and the market-implied momentum, write ONE short, vivid sentence (max ~22 words) that explains what just happened and how the momentum shifted.

Hard rules:
- Treat the percentages as "momentum" or "market sentiment", never as betting odds, prices, or a tip.
- Never suggest, encourage, or reference placing a bet, wagering, stakes, gambling, or any financial action.
- No financial or betting advice of any kind.
- Plain language a casual fan understands. Vivid but accurate.
- Output ONLY the sentence — no preamble, no quotes, no emoji, no reasoning.`;

const enabled = Boolean(config.ollamaHost && config.ollamaKey);
const cache = new Map<string, Narration>();

function minute(sec?: number | null): string {
  if (sec == null || !Number.isFinite(sec)) return "";
  return `${Math.floor(sec / 60)}'`;
}

/** Deterministic line used when Ollama is unavailable. */
export function fallbackLine(i: NarrationInput): string {
  const benef = i.side === "home" ? i.home : i.side === "away" ? i.away : null;
  const mag = Math.abs(Math.round(i.impact));
  const line = `${i.home} ${i.scoreHome}-${i.scoreAway} ${i.away}`;
  switch (i.action) {
    case "goal":
      return benef
        ? `Goal — ${line}. The market swings to ${benef}, momentum ${mag} points.`
        : `Goal — ${line}.`;
    case "red_card":
    case "second_yellow":
      return benef
        ? `Red card — momentum lurches to ${benef}, a ${mag}-point swing in seconds.`
        : `Red card — a team is down to ten.`;
    case "penalty":
      return `Penalty${benef ? ` to ${benef}` : ""} — the market braces for a swing.`;
    case "penalty_outcome":
      return benef ? `Penalty settled — the market tilts toward ${benef}.` : `Penalty settled.`;
    case "var":
      return `VAR check under way — the market holds its breath.`;
    case "game_finalised":
      return `Full time — ${line}.`;
    case "halftime_finalised":
      return `Half time — ${line}.`;
    default:
      return benef && mag >= 1 ? `${i.action} — momentum edges toward ${benef}.` : `${i.action} at ${minute(i.clock)}`.trim();
  }
}

function keyOf(i: NarrationInput): string {
  return `${i.action}|${i.side}|${i.scoreHome}-${i.scoreAway}|${Math.round(i.impact)}`;
}

function buildUser(i: NarrationInput): string {
  const benef = i.side === "home" ? i.home : i.side === "away" ? i.away : "neither side";
  return [
    `Match: ${i.home} (home) vs ${i.away} (away).`,
    `Event: ${i.action} at ${minute(i.clock) || "unknown minute"}.`,
    `Score now: ${i.home} ${i.scoreHome} - ${i.scoreAway} ${i.away}.`,
    `Momentum moved ${i.impact >= 0 ? "+" : ""}${Math.round(i.impact)} points toward ${benef}.`,
    i.pHome != null && i.pAway != null
      ? `Current momentum: ${i.home} ${Math.round(i.pHome)}%, ${i.away} ${Math.round(i.pAway)}%.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function narrateEvent(i: NarrationInput): Promise<Narration> {
  const key = keyOf(i);
  const cached = cache.get(key);
  if (cached) return cached;

  if (!enabled) {
    const out: Narration = { text: fallbackLine(i), source: "fallback" };
    cache.set(key, out);
    return out;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(`${config.ollamaHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.ollamaKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.ollamaModel,
        stream: false,
        think: "low",
        options: { temperature: 0.7, num_predict: 200 },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildUser(i) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const data = (await res.json()) as { message?: { content?: string } };
    const text = (data?.message?.content || "").trim();
    const out: Narration = text
      ? { text, source: "ollama" }
      : { text: fallbackLine(i), source: "fallback" };
    cache.set(key, out);
    return out;
  } catch {
    // not configured, rate limited, timeout, network — never break narration
    return { text: fallbackLine(i), source: "fallback" };
  } finally {
    clearTimeout(timer);
  }
}
