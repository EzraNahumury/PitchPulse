/**
 * Thin TxLINE data client. All calls inject the cached creds and target the
 * configured host. Endpoint shapes verified in the Phase 0 spike.
 */
import axios from "axios";
import { config } from "../config";
import { ensureCreds, Creds } from "./auth";

async function authHeaders() {
  const c: Creds = await ensureCreds();
  return { Authorization: `Bearer ${c.jwt}`, "X-Api-Token": c.apiToken };
}

async function get<T = any>(urlPath: string, params?: any): Promise<T> {
  const headers = await authHeaders();
  const res = await axios.get(`${config.txlineBase}${urlPath}`, {
    params, headers, timeout: 30000, validateStatus: () => true,
  });
  if (res.status !== 200) {
    throw new Error(`GET ${urlPath} -> ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`);
  }
  return res.data as T;
}

export interface Fixture {
  FixtureId: number; StartTime: number; Competition: string; CompetitionId: number;
  FixtureGroupId: number; Participant1: string; Participant1Id: number;
  Participant2: string; Participant2Id: number; Participant1IsHome: boolean;
}

export async function getFixtures(params?: { startEpochDay?: number; competitionId?: number }): Promise<Fixture[]> {
  const data = await get<Fixture[]>("/api/fixtures/snapshot", params);
  return Array.isArray(data) ? data : [];
}

/** Latest live odds rows for a fixture (array of OddsPayload). */
export async function getOdds(fixtureId: number): Promise<any[]> {
  const data = await get<any[]>(`/api/odds/updates/${fixtureId}`);
  return Array.isArray(data) ? data : [];
}

/** Latest score/event snapshot rows for a fixture (array of Scores). */
export async function getScores(fixtureId: number): Promise<any[]> {
  const data = await get<any[]>(`/api/scores/snapshot/${fixtureId}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Connect to an SSE stream (odds or scores) and invoke onMessage for each JSON
 * data payload. Returns an abort function. Uses global fetch (Node 18+).
 */
export async function openStream(
  kind: "odds" | "scores",
  fixtureId: number | undefined,
  onMessage: (payload: any) => void,
  onError?: (e: any) => void
): Promise<() => void> {
  const c = await ensureCreds();
  const qs = fixtureId ? `?fixtureId=${fixtureId}` : "";
  const url = `${config.txlineBase}/api/${kind}/stream${qs}`;
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${c.jwt}`,
          "X-Api-Token": c.apiToken,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`stream ${kind} -> ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const json = t.slice(5).trim();
          if (!json || json === "{}") continue;
          try { onMessage(JSON.parse(json)); } catch { /* heartbeat / non-json */ }
        }
      }
    } catch (e) {
      if (!controller.signal.aborted) onError?.(e);
    }
  })();

  return () => controller.abort();
}
