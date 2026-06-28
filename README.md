# PitchPulse

**The live heartbeat of every World Cup match — see who is winning the moment, and understand exactly why.**

PitchPulse is a real-time "co-pilot" you keep open while you watch a World Cup
match. It turns TxLINE's live score, event, and odds streams into a single
animated **Momentum Ribbon** and a plain-language **AI co-commentator** that
explains every swing as it happens — then hands you a shareable *Story of the
Match* the moment the final whistle blows.

> ⚠️ PitchPulse is an **entertainment and information** product. It uses odds
> data purely as a *market-sentiment / momentum signal* and never as a betting
> mechanism. There is no wagering, no sportsbook, no deposits, no payouts, and
> no financial advice. See [Compliance & Safety](#compliance--safety).

---

## One-Liner

A non-gambling, second-screen World Cup companion that fuses TxLINE's live
**scores + match events + consensus odds** into a real-time win-probability
story, narrated in plain language by an AI co-commentator and exported as a
shareable match recap.

---

## Problem

Most fans watch the World Cup with a phone in one hand, and the phone is doing
almost nothing useful:

1. **Scores tell you *what*, never *why*.** A livescore app shows `1-0`, but not
   that the underdog has spent 20 minutes strangling the favourite and the match
   is about to flip.
2. **Momentum is invisible.** The single most emotional thing in football — the
   feeling that "something is about to happen" — has no display. Fans feel it but
   can't see it, and casual fans miss it entirely.
3. **Casual fans lack context.** A red card, a substitution, a penalty, a VAR
   check — newer fans don't know how much each one actually changes the match.
4. **Odds are powerful but scary.** The richest "what does the world think right
   now" signal lives in betting markets, but it is locked inside sportsbooks,
   wrapped in jargon, and tied to gambling that most fans don't want.
5. **The shared moment is gone.** After a great match there's nothing personal to
   share — just a final score that looks identical for everyone.

There is a gap between a dry scoreboard and an expensive trading terminal.
Nothing in between is built **for the fan**.

---

## Solution

PitchPulse sits in that gap. It treats the **consensus odds probability** as a
real-time *momentum / sentiment* signal — not a bet — and draws it as a living
ribbon across the match timeline. Every TxLINE event (goal, red card, penalty,
substitution, VAR, corner) is pinned onto that ribbon, and an AI co-commentator
explains, in one sentence, what just changed and what it means.

Why this is a natural fit for TxLINE specifically:

- TxLINE is one of the few feeds that exposes **both** a real-time scores/events
  stream **and** a real-time consensus-odds stream (`Pct`, the implied
  probability as a percentage). PitchPulse is built on the *fusion* of the two —
  exactly the data combination TxLINE is uniquely good at.
- The `Pct` field gives a ready-made probability we can render directly, so we
  never have to expose raw odds or betting language to the fan.
- TxLINE's historical 5-minute-interval and snapshot endpoints let us **replay**
  any finished match, which solves the hackathon's "no live match during judging"
  problem cleanly.

---

## Why This Can Win

Mapped directly to the official judging criteria:

| Criterion | How PitchPulse wins |
|---|---|
| **Fan Accessibility & UX** | One screen, one big animated ribbon, one sentence of narration at a time. A non-technical fan understands "Brazil's momentum just jumped" instantly — no odds, no jargon, no setup. |
| **Real-Time Responsiveness** | Subscribes to **two** live SSE streams (`/api/scores/stream` + `/api/odds/stream`). The ribbon physically swings the instant odds move; events pop onto the timeline as they happen. Most submissions will use only the score stream — the odds stream is our visible, animated differentiator. |
| **Originality & Value Creation** | Nobody has shipped a *win-probability momentum story for casual fans*. We convert a gambling-only signal into a safe, emotional, mainstream fan experience. It is a new interaction model, not a repackaged feed. |
| **Commercial & Monetization Path** | Clear freemium + creator-tools + B2B white-label ladder (see [Monetization](#monetization-path)). Story-card export and a media/club second-screen are real, sellable products. |
| **Completeness & Execution** | Deliberately small scope: one polished match view + one shareable artifact + Solana sign-up + replay mode. End-to-end and demo-ready, not a sprawling half-built platform. |

**The single most important reason:** the demo is unbeatable. A probability
ribbon that visibly *snaps* upward the instant a goal lands is the most
compelling five seconds of video any judge will watch in this track — and we can
trigger it on command using replay mode.

---

## Core User Experience

1. **Open & sign up.** The user lands on PitchPulse and signs up through Solana
   (wallet connect). This satisfies the hackathon's Solana requirement and gates
   access to the data layer. The TxLINE API token is provisioned server-side and
   never exposed to the browser.
2. **Pick a match.** A clean list of World Cup fixtures (from
   `/api/fixtures/snapshot`) shows kickoff times and teams. Live matches surface
   first; finished matches are available in **Replay** mode.
3. **Watch the pulse.** Inside a match, the centerpiece is the **Momentum
   Ribbon**: a horizontal timeline where the band shifts toward the team the
   market currently favours, in real time, sourced from the odds `Pct`.
4. **Feel the swings.** When a goal, red card, penalty, VAR check, or
   substitution occurs, an animated marker drops onto the ribbon and the **AI
   co-commentator** prints one human sentence: *"Red card for France — the market
   has swung Argentina's win chance from 41% to 63% in seconds."*
5. **Get the story.** At full time (or any moment), the user taps **Story of the
   Match** and receives a single shareable card: the full momentum arc, the 3–5
   biggest swing moments, and a one-paragraph AI recap. One tap to share.

The "aha" moment is step 4: the fan *sees* momentum for the first time.

---

## Key Features

- **Momentum Ribbon** — a live, animated win-probability timeline driven by the
  odds `Pct` stream, framed strictly as "match momentum / market sentiment."
- **Event Pins** — goals, yellow/red cards, penalties, VAR, substitutions and
  corners from the scores/events stream, pinned to the exact moment on the ribbon.
- **AI Co-Commentator** — short, plain-language narration generated on each
  *swing moment* and key event. Explains cause → effect, never advises a bet.
- **Swing Detector** — server-side logic that flags meaningful probability moves
  (e.g. a jump beyond a threshold within a short window) so narration fires on
  what matters, not on noise.
- **Story of the Match** — auto-generated, shareable recap card (image/card) with
  the momentum arc and top moments.
- **Replay Mode** — replays any finished fixture from TxLINE historical/snapshot
  data, so the experience is fully demonstrable with zero live matches running.
- **Penalty-Shootout Mode** *(stretch)* — special handling for the `PE` game
  phase, the highest-drama moment of any knockout.

---

## TxLINE Integration Plan

> Only endpoints and fields **found in the TxLINE documentation** are listed
> here. Anything not fully confirmed is marked **TO VERIFY** rather than assumed.
> Authoritative index used: `https://txline-docs.txodds.com/llms.txt`.

### Authentication & sign-up (Solana)

- `POST /auth/guest/start` → returns a guest session **JWT**.
- On-chain subscription activation via the TxLINE Solana program (Anchor;
  references `token_treasury_v2` and `pricing_matrix` PDAs, `TOKEN_2022`), then:
- `POST /api/token/activate` with body `{ txSig, walletSignature, leagues }` →
  returns the long-lived **API token**.
- `POST /api/guest/purchase/quote` with `{ buyerPubkey, txlineAmount }` →
  returns a partially-signed transaction quote.
- Service levels: **Level 1** (60-second delayed) and **Level 12** (real-time).
  TxODDS is waiving commercial data fees for the hackathon window.
- **TO VERIFY:** exact devnet activation flow and whether devnet sign-up is
  fee-free (`/documentation/programs/devnet.md`), so we can develop without
  mainnet spend. Requirement permits **mainnet or devnet**.

All requests after activation send:
`Authorization: Bearer {jwt}` **and** `X-Api-Token: {apiToken}`.

### Fixtures (match list)

- `GET /api/fixtures/snapshot` — optional query `startEpochDay`, `competitionId`.
  Returns `Fixture[]` with fields:
  `Ts`, `StartTime`, `Competition`, `CompetitionId`, `FixtureGroupId`,
  `Participant1Id`, `Participant1`, `Participant2Id`, `Participant2`,
  `FixtureId`, `Participant1IsHome`.
- **TO VERIFY:** the exact `competitionId` value for the World Cup, to filter the
  fixture list to the 104 tournament games.

### Live scores & events (primary stream)

- `GET /api/scores/stream` — real-time **SSE**. Optional `fixtureId` query to
  scope to one match; `Last-Event-ID` header to resume. Content-Type
  `text/event-stream`; emits `data` messages and `heartbeat` events.
- `GET /api/scores/snapshot/{fixtureId}` — latest snapshot; optional `asOf`
  (ms epoch) for a historical snapshot.
- **Scores object fields (as observed):** `fixtureId`, `gameState`, `startTime`,
  `isTeam`, `fixtureGroupId`, `competitionId`, `countryId`, `sportId`,
  `participant1IsHome`, `participant1Id`, `participant2Id`, `action`, `id`, `ts`,
  `connectionId`, `seq`, plus `scoreSoccer` / `dataSoccer`.
- **`SoccerTotalScore`** is split by phase: `H1`, `HT`, `H2`, `ET1`, `ET2`, `PE`,
  `ETTotal`, `Total`, each a **`SoccerScore`** of
  `{ Goals, YellowCards, RedCards, Corners }`.
- **`dataSoccer`** (the event detail we narrate from): `Action`, `Color`,
  `Conditions`, `Corner`, `FreeKickType`, `Goal`, `GoalType`, `Minutes`,
  `Outcome`, `Participant`, `Penalty`, `PlayerId`, `PlayerInId`, `PlayerOutId`,
  `RedCard`, `YellowCard`, `VAR`, `VenueType`, `Type`.
- **Game-phase encoding (`gameState`/status):** `NS, H1, HT, H2, F, WET, ET1,
  HTET, ET2, FET, WPE, PE, FPE, I, A, C, TXCC, TXCS, P` (covers normal time,
  extra time, penalty shootout, interruptions).
- **TO VERIFY:** the enumerated value set of the `action` field, and exact field
  casing (the scores payload appears `camelCase`; confirm against
  `api-reference/openapi.json`).

### Live odds (the momentum signal)

- `GET /api/odds/stream` — real-time **SSE** consensus odds. Optional `fixtureId`.
- `GET /api/odds/updates/{fixtureId}` — currently-live odds for one fixture.
- **OddsPayload fields:** `FixtureId`, `MessageId`, `Ts`, `Bookmaker`,
  `BookmakerId`, `SuperOddsType`, `GameState`, `InRunning`, `MarketParameters`,
  `MarketPeriod`, `PriceNames` (e.g. outcome labels), `Prices` (int),
  **`Pct`** (implied probability as a string, *"strictly formatted to 3 decimal
  places, or NA for quarter-handicap lines"*).
- We render the **`Pct`** value directly as the momentum percentage — no raw
  odds and no betting language reach the fan.
- **TO VERIFY:** (a) the exact `PriceNames` labels for the 1X2 / match-result
  market so we map home/draw/away correctly; (b) whether `SuperOddsType` already
  provides a single consensus line, or whether we aggregate across `Bookmaker`
  records ourselves; (c) the meaning/scale of the integer `Prices` field.

### Historical replay (demo enablement)

- Historical 5-minute-interval endpoints exist for **both** scores and odds
  ("get a JSON array of all score/odd updates from a specific historical
  5-minute interval"), plus full per-fixture score sequences. These feed our
  **Replay Mode** so a finished match can be re-streamed for the demo.
- **TO VERIFY:** the exact paths and the time/interval parameters of the
  historical-interval and full-sequence endpoints
  (`api-reference/scores/...`, `api-reference/odds/...`).

### On-chain validation (optional credibility layer)

- TxLINE exposes **Merkle-proof** endpoints for fixtures, odds, and scores, plus
  an on-chain validation example. A "verified on Solana ✓" badge on a Story card
  is a possible stretch differentiator. **TO VERIFY:** proof endpoint paths and
  verification flow (`documentation/examples/onchain-validation.md`).

---

## Real-Time Flow

```
                         ┌──────────────────────────────────────────────┐
                         │                 TxLINE                        │
                         │   GET /api/scores/stream   (SSE, events)      │
                         │   GET /api/odds/stream     (SSE, Pct %)       │
                         └───────────────┬──────────────────────────────┘
                                         │  (server holds the ONE upstream
                                         │   connection; API token stays
                                         │   server-side, never in browser)
                                         ▼
                ┌────────────────────────────────────────────────┐
                │              PitchPulse Backend                 │
                │  1. Ingest both SSE streams per fixture         │
                │  2. Normalise → unified match-state timeline    │
                │  3. Swing Detector: flag meaningful Pct moves   │
                │  4. On swing/key event → AI narration call      │
                │  5. Fan out to clients (SSE / WebSocket)        │
                │     ── Replay Mode feeds recorded history here ─│
                └───────────────────────┬────────────────────────┘
                                        │  lightweight client SSE/WS
                                        ▼
                ┌────────────────────────────────────────────────┐
                │            PitchPulse Frontend                  │
                │  • Momentum Ribbon animates on each Pct tick    │
                │  • Event pins drop from dataSoccer events       │
                │  • AI co-commentator line updates               │
                │  • "Story of the Match" card on demand          │
                └────────────────────────────────────────────────┘
```

Key design choice: **the backend owns the single TxLINE connection.** This keeps
the API token secret, lets us aggregate odds and run the Swing Detector once for
all viewers, and means the browser only ever talks to *our* lightweight stream.

---

## Technical Architecture

Optimised for fast build + a polished, animated demo.

- **Frontend:** Next.js (React) + TypeScript, Tailwind CSS, **Framer Motion** for
  the ribbon's spring animations, and a charting lib (Recharts / visx) for the
  probability arc. Deployed on **Vercel**.
- **Backend / realtime layer:** Node.js + TypeScript service that maintains the
  upstream TxLINE SSE connections, runs normalisation + the Swing Detector, and
  re-broadcasts to clients over **SSE** (simplest) or WebSocket. Deployed on
  **Railway / Render / Fly.io**.
- **AI layer:** Claude (`claude-sonnet-4-6`, or `claude-opus-4-8` for the recap)
  generates the co-commentator sentences and the Story-of-the-Match paragraph,
  from a compact structured prompt (event + before/after `Pct`). Strict prompt
  guardrails forbid betting language or advice. *Stretch:* TTS voice
  (ElevenLabs / Web Speech API).
- **Datastore:** Redis (or in-memory) for live match state + recent timeline;
  optional Postgres only to persist generated Story cards. Not required for the
  core loop.
- **Solana / sign-up:** Solana wallet adapter for connect + sign-up. Activation
  (`/auth/guest/start` → on-chain activation → `/api/token/activate`) runs
  server-side; the resulting API token is stored server-side. Devnet for
  development (TO VERIFY devnet flow).
- **Replay engine:** a module that loads historical interval/snapshot data for a
  finished fixture and replays it through the same pipeline at adjustable speed —
  identical code path to live, so the demo is faithful.

---

## Demo Video Plan

Target: **under 5 minutes**, structured exactly to the judging note (the demo is
weighted heavily and there may be no live match during review).

1. **Problem (0:00–0:45)** — split screen: a plain livescore showing `1-0` vs the
   real feeling of the match. "Scores tell you *what*. PitchPulse shows you
   *why*, and *who's about to win the moment*."
2. **Product walkthrough (0:45–1:45)** — Solana sign-up, pick a fixture, enter
   the match view, introduce the Momentum Ribbon, event pins, and the AI
   co-commentator.
3. **The money shot — live/replay swing (1:45–3:15)** — run a real World Cup
   match in **Replay Mode**. On a goal and a red card, the ribbon visibly snaps
   and the AI prints its one-line explanation. Then trigger **Story of the Match**
   and share the card.
4. **TxLINE backend (3:15–4:15)** — show the architecture: the two SSE streams
   (`/api/scores/stream`, `/api/odds/stream`), the server-side token, the Swing
   Detector, and how the `Pct` field becomes the ribbon. Name the exact endpoints
   used.
5. **Why it matters + monetization (4:15–5:00)** — freemium, creator story-cards,
   and media/club white-label second-screen. Close on the compliance framing:
   "sentiment, not betting."

---

## Monetization Path

A clear ladder, none of it involving gambling, custody, or money movement:

- **Freemium (B2C):** free single-match companion; **Premium** unlocks the
  multi-match "drama radar," the voice co-commentator (TTS), unlimited Story-card
  exports, team-focus alerts, and multi-language narration.
- **Creator tools (B2C/Pro):** auto-generated branded Story cards and short
  vertical recap clips that content creators and football pages can post — a
  subscription tier aimed at the huge football-content economy.
- **White-label second-screen (B2B):** licence the match view to media outlets,
  broadcasters, clubs, and fan communities as an embeddable companion. Highest
  revenue ceiling.
- **Sponsored watch-party rooms (B2B):** a brand sponsors a shared room or the
  Story card ("This match's momentum, brought to you by…").

The product's value is *understanding and shareability*, which is sellable
without any wager ever existing.

---

## MVP Scope

The smallest build that still feels like a complete, shippable product:

- Solana sign-up + server-side TxLINE activation → API token.
- Fixture list from `/api/fixtures/snapshot`.
- One match view that subscribes (server-side) to both `/api/scores/stream` and
  `/api/odds/stream` for the chosen fixture.
- **Momentum Ribbon** animating from the odds `Pct`.
- **Event pins** for goals + red/yellow cards + penalties + substitutions from
  `dataSoccer`.
- **AI co-commentator** firing on swing moments + key events (text only).
- **Story of the Match** shareable card at full time.
- **Replay Mode** for at least one finished fixture (demo-critical).

If only one thing works perfectly, it is the ribbon swinging on a goal in replay.

---

## Stretch Goals

- TTS voice co-commentator (the requirement explicitly rewards TTS).
- Telegram delivery of swing alerts (aligns with the suggested "AI Pundit Bot").
- "Drama Radar" home screen ranking all live matches by momentum volatility.
- Watch-party shared rooms with live reactions and a non-money streak game.
- Penalty-shootout special mode for the `PE` phase.
- "Verified on Solana ✓" badge using TxLINE Merkle-proof endpoints.
- Multi-language narration.

---

## Compliance & Safety

PitchPulse is built to be safe for a mainstream, general audience.

- **No betting, no wagering, no sportsbook.** Users cannot place, accept, or
  simulate a bet. There is no bet slip, no stake, no odds-as-call-to-action.
- **No custody, no deposits, no payouts, no money movement.** The only on-chain
  action is the required Solana sign-up / data-subscription activation — that is
  *data access*, not a wager or a financial transaction with the user.
- **No financial or investment advice.** The AI is constrained by prompt
  guardrails to describe momentum and events; it never suggests a bet or a
  position.
- **Odds are reframed as "Market Sentiment / Momentum."** We display the `Pct`
  probability as a neutral momentum indicator, clearly labelled, with a visible
  disclaimer that it is informational entertainment derived from market data.
- **Jurisdiction.** Participants remain responsible for legal compliance; this
  framing is designed to stay on the consumer-information side of gambling,
  gaming, financial, and consumer-protection lines.

---

## Development Checklist

- [ ] Repo scaffold: Next.js frontend + Node/TS backend, shared types.
- [ ] Solana wallet connect + sign-up flow on the frontend.
- [ ] Backend: `POST /auth/guest/start` → guest JWT.
- [ ] Backend: on-chain activation + `POST /api/token/activate` → store API token
      server-side (devnet first — **TO VERIFY** flow).
- [ ] Backend: `GET /api/fixtures/snapshot` → fixture list endpoint for the UI
      (resolve World Cup `competitionId` — **TO VERIFY**).
- [ ] Backend: subscribe to `GET /api/scores/stream?fixtureId=…` (SSE) and parse
      `dataSoccer` events.
- [ ] Backend: subscribe to `GET /api/odds/stream?fixtureId=…` (SSE) and extract
      `Pct` for the match-result market (map `PriceNames` — **TO VERIFY**).
- [ ] Backend: unified per-fixture timeline + state model.
- [ ] Backend: Swing Detector (threshold + window over `Pct`).
- [ ] Backend: AI narration service (Claude) with anti-gambling guardrails.
- [ ] Backend: client fan-out stream (SSE/WS) + reconnect/`Last-Event-ID`.
- [ ] Frontend: Momentum Ribbon component (animated on each tick).
- [ ] Frontend: event-pin rendering + AI co-commentator line.
- [ ] Frontend: Story-of-the-Match card + share.
- [ ] Replay engine: load historical interval/snapshot data → replay pipeline
      (**TO VERIFY** exact historical endpoint paths).
- [ ] Deploy (Vercel + Railway/Render), record the demo video.

---

## Open Questions / To Verify

These are **not assumed** in code until confirmed against the TxLINE docs/API
(`llms.txt`, `api-reference/openapi.json`, `docs/docs.yaml`) or the support
Discord/Telegram:

1. **World Cup `competitionId`** — exact value to filter `/api/fixtures/snapshot`.
2. **Odds market mapping** — exact `PriceNames` labels for the 1X2 / match-result
   market, and which line to read for "win probability."
3. **Consensus vs per-bookmaker** — does `SuperOddsType` already give a single
   consensus line, or do we aggregate across `Bookmaker` records?
4. **`Prices` field** — its integer scale/encoding and relationship to `Pct`.
5. **`action` enumeration** — the full set of values of the scores `action` field
   and the exact `dataSoccer` value conventions (e.g. how a substitution vs a
   goal is signalled).
6. **Field casing** — confirm camelCase (scores) vs PascalCase (odds) against the
   OpenAPI spec.
7. **Historical replay endpoints** — exact paths + parameters for the 5-minute
   interval and full-sequence score/odds endpoints powering Replay Mode.
8. **Devnet sign-up** — exact devnet activation flow and whether it is fee-free
   for development.
9. **SSE payload framing** — exact `id` / `event` / `data` line format and
   heartbeat cadence for robust client parsing and resume.
10. **Merkle proofs (stretch)** — endpoint paths and the on-chain verification
    flow for a "verified on Solana" badge.

---

*Built for the TxLINE / TxODDS World Cup Hackathon — "Consumer and Fan
Experiences" track. Uses TxLINE live data as input; sign-up via Solana.*
