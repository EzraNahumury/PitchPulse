import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config";
import { getFixtures } from "./txline/client";
import { loadStaticState, loadSnapshots, fixtureStatus } from "./match";
import { MomentumEngine } from "./engine/momentum";
import { replay } from "./replay/replayer";
import { startLiveEngine } from "./live";
import { narrateEvent, NarrationInput } from "./ai/narrate";

export async function buildServer() {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });

  app.get("/api/health", async () => ({ ok: true, txlineBase: config.txlineBase }));

  // AI co-commentator: one event -> one plain-language sentence.
  app.post("/api/narrate", async (req, reply) => {
    const b = (req.body || {}) as Partial<NarrationInput>;
    if (!b.action || !b.home || !b.away) {
      return reply.code(400).send({ error: "action, home, away required" });
    }
    const input: NarrationInput = {
      action: String(b.action),
      side: b.side === "home" || b.side === "away" ? b.side : "neutral",
      home: String(b.home),
      away: String(b.away),
      scoreHome: Number(b.scoreHome) || 0,
      scoreAway: Number(b.scoreAway) || 0,
      impact: Number(b.impact) || 0,
      pHome: b.pHome != null ? Number(b.pHome) : undefined,
      pAway: b.pAway != null ? Number(b.pAway) : undefined,
      clock: b.clock != null ? Number(b.clock) : null,
    };
    return narrateEvent(input);
  });

  // Fixture list. ?worldCup=1 filters to the World Cup competition.
  app.get("/api/fixtures", async (req) => {
    const worldCup = (req.query as any)?.worldCup;
    const all = await getFixtures();
    const list = worldCup ? all.filter((f) => f.CompetitionId === config.worldCupCompetitionId) : all;
    return list.map((f) => ({
      fixtureId: f.FixtureId,
      competition: f.Competition,
      competitionId: f.CompetitionId,
      startTime: f.StartTime,
      home: f.Participant1IsHome ? f.Participant1 : f.Participant2,
      away: f.Participant1IsHome ? f.Participant2 : f.Participant1,
    }));
  });

  // Real per-fixture status (upcoming | live | finished), derived from the score
  // feed. ?ids=1,2,3 (comma-separated); returns { "1": "live", ... }. Cached.
  app.get("/api/fixtures/status", async (req) => {
    const raw = String((req.query as any)?.ids || "");
    const ids = raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
      .slice(0, 60);
    const entries = await Promise.all(
      ids.map(async (id) => [id, await fixtureStatus(id)] as const),
    );
    return Object.fromEntries(entries);
  });

  // Full static match state (ribbon + events + impact scores + top moments).
  // ?source=demo swaps in synthesized moving odds.
  app.get("/api/match/:id", async (req, reply) => {
    const id = Number((req.params as any).id);
    if (!Number.isFinite(id)) return reply.code(400).send({ error: "bad fixtureId" });
    const source = (req.query as any)?.source === "demo" ? "demo" : "real";
    try {
      return await loadStaticState(id, source);
    } catch (e: any) {
      return reply.code(502).send({ error: String(e.message || e) });
    }
  });

  // SSE stream. mode=replay (real flat odds), mode=demo (synthesized moving
  // odds), or mode=live (upstream feed).
  app.get("/api/match/:id/stream", async (req, reply) => {
    const id = Number((req.params as any).id);
    const q = req.query as any;
    const mode = q.mode === "live" ? "live" : q.mode === "demo" ? "demo" : "replay";
    const stepMs = Number(q.stepMs) || 200;
    if (!Number.isFinite(id)) return reply.code(400).send({ error: "bad fixtureId" });

    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    const send = (event: string, data: any) => raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const hb = setInterval(() => raw.write(`: ping\n\n`), 15000);

    let cleanup = () => {};
    try {
      if (mode === "replay" || mode === "demo") {
        const { meta, odds, scores } = await loadSnapshots(id, mode === "demo" ? "demo" : "real");
        const engine = new MomentumEngine(meta);
        engine.on("momentum", (p) => send("momentum", p));
        engine.on("event", (e) => send("event", e));
        engine.on("event:pending", (e) => send("event:pending", e));
        send("meta", { mode, meta });
        const handle = replay(engine, odds, scores, {
          stepMs,
          onDone: () => { send("state", engine.snapshot()); send("done", { ok: true }); },
        });
        cleanup = () => handle.stop();
      } else {
        const { engine, stop } = await startLiveEngine(id);
        engine.on("momentum", (p) => send("momentum", p));
        engine.on("event", (e) => send("event", e));
        engine.on("event:pending", (e) => send("event:pending", e));
        engine.on("upstream-error", (e) => send("error", { message: String(e?.message || e) }));
        send("meta", { mode, meta: engine.meta });
        cleanup = stop;
      }
    } catch (e: any) {
      send("error", { message: String(e.message || e) });
    }

    raw.on("close", () => { clearInterval(hb); cleanup(); });
  });

  return app;
}
