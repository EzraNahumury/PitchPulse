import type { FixtureSummary, MatchState, StreamMode } from "./types";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8787";

class ApiError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, { signal, cache: "no-store" });
  } catch (e) {
    throw new ApiError(
      `Can't reach the match feed at ${BACKEND_URL}. Is the backend running?`,
      e,
    );
  }
  if (!res.ok) {
    throw new ApiError(`The feed returned ${res.status} for ${path}.`);
  }
  return (await res.json()) as T;
}

/** World Cup fixtures (CompetitionId 72) by default. */
export function fetchFixtures(
  worldCupOnly = true,
  signal?: AbortSignal,
): Promise<FixtureSummary[]> {
  return getJSON<FixtureSummary[]>(
    `/api/fixtures${worldCupOnly ? "?worldCup=1" : ""}`,
    signal,
  );
}

/** Full static match state (ribbon + events + impact scores + top moments). */
export function fetchMatch(
  fixtureId: number,
  signal?: AbortSignal,
): Promise<MatchState> {
  return getJSON<MatchState>(`/api/match/${fixtureId}`, signal);
}

export type MatchStatus = "upcoming" | "live" | "finished";

/** Real per-fixture status from the score feed, keyed by fixtureId. */
export async function fetchFixtureStatuses(
  ids: number[],
  signal?: AbortSignal,
): Promise<Record<number, MatchStatus>> {
  if (ids.length === 0) return {};
  const raw = await getJSON<Record<string, MatchStatus>>(
    `/api/fixtures/status?ids=${ids.join(",")}`,
    signal,
  );
  const out: Record<number, MatchStatus> = {};
  for (const [k, v] of Object.entries(raw)) out[Number(k)] = v;
  return out;
}

export function streamUrl(
  fixtureId: number,
  mode: StreamMode,
  stepMs: number,
): string {
  const qs = new URLSearchParams({ mode });
  if (mode !== "live") qs.set("stepMs", String(stepMs));
  return `${BACKEND_URL}/api/match/${fixtureId}/stream?${qs.toString()}`;
}
