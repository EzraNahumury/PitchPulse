# PitchPulse Backend (Phase 1)

Holds the TxLINE pipe server-side, turns the **1X2 demargined `Pct`** stream into
the **Momentum Ribbon**, scores every event by its **Momentum Impact Score**
(Win-Probability-Added), and fans normalized match state out to clients over SSE.

The TxLINE API token never leaves the server.

## Run

```bash
cd backend
cp .env.example .env          # devnet defaults; reuses the spike's funded wallet
npm install
npm run smoke                 # auth -> build a match timeline -> print top moments
npm start                     # http://localhost:8787
```

`npm run dev` runs with watch-reload.

## What it does

- **Auth** (`src/txline/auth.ts`) — guest JWT → on-chain `subscribe(level,weeks)`
  → activate → API token, cached in `.cache/creds.json` and revalidated; only
  re-subscribes (free, 0 TxLINE) when the cache is invalid. Reuses the funded
  devnet wallet from `../spike`.
- **Client** (`src/txline/client.ts`) — `getFixtures`, `getOdds`, `getScores`,
  and `openStream("odds"|"scores", …)` SSE reader.
- **Engine** (`src/engine/momentum.ts`) — `MomentumEngine` ingests odds + scores,
  maintains the ribbon (`m = pHome − pAway`), and computes each event's impact as
  the signed change in `m` across the event. `buildTimeline()` produces a full
  static `MatchState` for REST and the Story card.
- **Replay** (`src/replay/replayer.ts`) — re-streams snapshot data through the
  engine at a fixed step, so the ribbon animates with no live match.
- **Live** (`src/live.ts`) — pipes upstream odds + scores SSE into the engine.

## HTTP / SSE API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness |
| GET | `/api/fixtures?worldCup=1` | fixtures (filter to World Cup, CompetitionId 72) |
| GET | `/api/match/:id` | full static `MatchState` (ribbon, events, impact, top moments) |
| GET | `/api/match/:id/stream?mode=replay&stepMs=200` | SSE: `meta`, `momentum`, `event`, `state`, `done` |
| GET | `/api/match/:id/stream?mode=live` | SSE from the upstream live feed |

### SSE events

- `meta` — match metadata + mode
- `momentum` — `{ ts, pHome, pDraw, pAway, m }` (one ribbon point)
- `event:pending` — an event fired; impact not yet settled
- `event` — `{ ts, clock, action, side, impact, scoreHome, scoreAway, label, key }`
- `state` — full `MatchState` snapshot (end of replay)
- `done` — replay finished

## Verified

`npm run smoke` against devnet returns 16 World Cup fixtures (Jordan v Argentina,
Algeria v Austria, South Africa v Canada, …), builds a 2,586-point ribbon, and
ranks events by Momentum Impact Score. See the root `README.md` Phase 0 section
for the underlying TxLINE field facts.

> Note: on devnet, the sample odds and sample scores come from different test
> timelines, so impact magnitudes are muted. With a single real finished match
> (same fixture's odds + scores), goal impacts resolve to large swings.
