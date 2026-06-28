/**
 * Replays snapshot odds + scores through a live MomentumEngine at a fixed step,
 * so the ribbon animates and events fire even when no match is live. This is the
 * demo / judging path (matches end before review).
 */
import { MomentumEngine, isMatchResult } from "../engine/momentum";

export interface ReplayHandle { stop: () => void; }

export function replay(
  engine: MomentumEngine,
  odds: any[],
  scores: any[],
  opts: { stepMs?: number; onDone?: () => void } = {}
): ReplayHandle {
  const stepMs = opts.stepMs ?? 200;
  type Item = { ts: number; kind: "odds" | "score"; row: any };
  const items: Item[] = [];
  for (const o of odds) if (isMatchResult(o)) items.push({ ts: Number(o.Ts) || 0, kind: "odds", row: o });
  for (const s of scores) items.push({ ts: Number(s.Ts) || 0, kind: "score", row: s });
  items.sort((a, b) => a.ts - b.ts);

  let i = 0;
  let stopped = false;
  const timer = setInterval(() => {
    if (stopped) return;
    if (i >= items.length) {
      clearInterval(timer);
      engine.flush();
      opts.onDone?.();
      return;
    }
    const it = items[i++];
    if (it.kind === "odds") engine.ingestOdds(it.row);
    else engine.ingestScore(it.row);
  }, stepMs);

  return {
    stop: () => { stopped = true; clearInterval(timer); },
  };
}
