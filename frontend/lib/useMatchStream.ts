"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { streamUrl } from "./api";
import type { MatchEvent, MatchMeta, MatchState, OddsPoint, StreamMode } from "./types";

export type StreamStatus = "idle" | "connecting" | "streaming" | "done" | "error";

export interface StreamControls {
  mode: StreamMode;
  stepMs: number;
  setMode: (m: StreamMode) => void;
  setStepMs: (n: number) => void;
  restart: () => void;
}

export interface StreamData {
  status: StreamStatus;
  error: string | null;
  meta: MatchMeta | null;
  points: OddsPoint[];
  latest: OddsPoint | null;
  events: MatchEvent[];
  pending: MatchEvent | null;
  scoreHome: number;
  scoreAway: number;
  clockSec: number | null;
  finalState: MatchState | null;
  progress: number; // 0..1, replay completion estimate
}

const FULL_MATCH_SEC = 95 * 60;

/**
 * Subscribes to the backend's per-fixture SSE stream and reduces the event
 * sequence (meta / momentum / event / state / done) into render-ready state.
 * Defaults to replay mode, which is the demo path (matches finish before review).
 */
export function useMatchStream(
  fixtureId: number,
  initial: { mode?: StreamMode; stepMs?: number } = {},
): StreamData & StreamControls {
  const [mode, setMode] = useState<StreamMode>(initial.mode ?? "replay");
  const [stepMs, setStepMs] = useState<number>(initial.stepMs ?? 200);
  const [nonce, setNonce] = useState(0);

  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<MatchMeta | null>(null);
  const [points, setPoints] = useState<OddsPoint[]>([]);
  const [latest, setLatest] = useState<OddsPoint | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [pending, setPending] = useState<MatchEvent | null>(null);
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [clockSec, setClockSec] = useState<number | null>(null);
  const [finalState, setFinalState] = useState<MatchState | null>(null);

  const esRef = useRef<EventSource | null>(null);

  const restart = useCallback(() => setNonce((n) => n + 1), []);

  // Reset accumulators during render when the stream identity changes
  // (fixture / mode / speed / restart) — the React-recommended way to reset
  // state on a dependency change, instead of doing it inside the effect.
  const runKey = `${fixtureId}|${mode}|${stepMs}|${nonce}`;
  const [prevKey, setPrevKey] = useState(runKey);
  if (runKey !== prevKey) {
    setPrevKey(runKey);
    setStatus("connecting");
    setError(null);
    setPoints([]);
    setLatest(null);
    setEvents([]);
    setPending(null);
    setScoreHome(0);
    setScoreAway(0);
    setClockSec(null);
    setFinalState(null);
  }

  useEffect(() => {
    const es = new EventSource(streamUrl(fixtureId, mode, stepMs));
    esRef.current = es;

    const parse = <T,>(e: MessageEvent): T | null => {
      try {
        return JSON.parse(e.data) as T;
      } catch {
        return null;
      }
    };

    es.addEventListener("open", () => setStatus("streaming"));

    es.addEventListener("meta", (e) => {
      const d = parse<{ mode: StreamMode; meta: MatchMeta }>(e as MessageEvent);
      if (d?.meta) setMeta(d.meta);
      setStatus("streaming");
    });

    es.addEventListener("momentum", (e) => {
      const p = parse<OddsPoint>(e as MessageEvent);
      if (!p) return;
      setPoints((prev) => (prev.length > 4000 ? prev : [...prev, p]));
      setLatest(p);
    });

    es.addEventListener("event:pending", (e) => {
      const ev = parse<MatchEvent>(e as MessageEvent);
      if (ev) setPending(ev);
    });

    es.addEventListener("event", (e) => {
      const ev = parse<MatchEvent>(e as MessageEvent);
      if (!ev) return;
      setEvents((prev) => [...prev, ev]);
      setPending(null);
      setScoreHome(ev.scoreHome);
      setScoreAway(ev.scoreAway);
      if (ev.clock != null) setClockSec(ev.clock);
    });

    es.addEventListener("state", (e) => {
      const st = parse<MatchState>(e as MessageEvent);
      if (!st) return;
      setFinalState(st);
      setScoreHome(st.score.home.goals);
      setScoreAway(st.score.away.goals);
      if (st.clock != null) setClockSec(st.clock);
    });

    es.addEventListener("done", () => {
      setStatus("done");
      es.close();
    });

    es.addEventListener("error", (e) => {
      const msg = parse<{ message: string }>(e as MessageEvent);
      if (msg?.message) {
        setError(msg.message);
        setStatus("error");
      } else if (es.readyState === EventSource.CLOSED) {
        // native connection failure (not a server "error" event)
        setError(
          "Lost the match feed. Check the backend is running, then replay.",
        );
        setStatus("error");
      }
    });

    return () => es.close();
  }, [fixtureId, mode, stepMs, nonce]);

  // crude progress: most replays end around full time
  const progress = clockSec != null ? Math.min(1, clockSec / FULL_MATCH_SEC) : 0;

  return {
    status,
    error,
    meta,
    points,
    latest,
    events,
    pending,
    scoreHome,
    scoreAway,
    clockSec,
    finalState,
    progress,
    mode,
    stepMs,
    setMode,
    setStepMs,
    restart,
  };
}
