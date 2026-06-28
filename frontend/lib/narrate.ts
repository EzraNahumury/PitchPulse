import { BACKEND_URL } from "./api";
import type { MatchEvent, OddsPoint } from "./types";

export interface Narration {
  text: string;
  source: "ollama" | "fallback";
}

/**
 * Ask the backend co-commentator to narrate one event. Best-effort: returns
 * null on any failure so the UI can fall back to its local line.
 */
export async function fetchNarration(
  event: MatchEvent,
  latest: OddsPoint | null,
  home: string,
  away: string,
  signal?: AbortSignal,
): Promise<Narration | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/narrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        action: event.action,
        side: event.side,
        home,
        away,
        scoreHome: event.scoreHome,
        scoreAway: event.scoreAway,
        impact: event.impact,
        pHome: latest?.pHome,
        pAway: latest?.pAway,
        clock: event.clock,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as Narration;
  } catch {
    return null;
  }
}
