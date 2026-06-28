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

## What Makes This Genuinely Different (Competitive Audit)

We are honest about the landscape: **a "momentum bar" by itself is not new.**
FotMob has *Momentum* (xG-based), Sofascore has *Attack Momentum* (event-pressure
based), ESPN/Gracenote show *win probability*. A judge who follows football apps
will have seen these. So our edge is **not** "we drew a momentum graph." It is
four things those products structurally cannot or do not do:

| | FotMob / Sofascore / ESPN | **PitchPulse** |
|---|---|---|
| **Signal source** | Their own xG / event-pressure model | **Live consensus betting-market probability** — widely regarded as the *sharpest* probability estimate in sports — sourced from TxLINE's aggregated "StablePrice Odds" (`Pct`) |
| **Who shows market probability to casual fans** | Nobody — it is gambling-coded and locked inside sportsbooks | **We liberate it** and reframe it as a safe, non-betting *momentum / sentiment* signal |
| **Core unit** | A live bar widget buried in a stats app | **Momentum Impact Score** — every moment *scored* by how much it moved the world's belief (Win-Probability-Added for football) |
| **Product category** | Stats panel for hardcore fans | Standalone, AI-narrated **co-pilot for casual fans** + a shareable social artifact |
| **Output** | A number on screen | A **narrated story** + a *Story of the Match* card + a tournament-wide *Biggest Swings* leaderboard across all 104 games |

**The defensible, ownable idea:** PitchPulse is the first fan product that
**scores every World Cup moment by how much it moved the market's belief** — and
the only one that does it on the sharpest signal in sports, with the betting
stripped out. That sentence is not Sofascore. The market-probability stream is
data only TxLINE exposes, so this experience is *native to TxLINE* and hard to
clone on a generic livescore feed.

---

## Why This Can Win

Mapped directly to the official judging criteria:

| Criterion | How PitchPulse wins |
|---|---|
| **Fan Accessibility & UX** | One screen, one big animated ribbon, one sentence of narration at a time. A non-technical fan understands "Brazil's momentum just jumped" instantly — no odds, no jargon, no setup. |
| **Real-Time Responsiveness** | Subscribes to **two** live SSE streams (`/api/scores/stream` + `/api/odds/stream`). The ribbon physically swings the instant odds move; events pop onto the timeline as they happen. Most submissions will use only the score stream — the odds stream is our visible, animated differentiator. |
| **Originality & Value Creation** | We score every moment by **Win-Probability-Added** on the *sharpest probability signal in sports* (live consensus odds), with the betting stripped out — a unit no casual fan app shows because it is locked in sportsbooks. See [Competitive Audit](#what-makes-this-genuinely-different-competitive-audit). Not a repackaged feed; a new fan unit. |
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
  consensus odds `Pct` stream, framed strictly as "match momentum / market
  sentiment."
- **Momentum Impact Score** *(the signature feature)* — every event is scored by
  **how much it moved the market's belief** (Win-Probability-Added). A goal might
  be *+38%*, a missed penalty *−12%*, a red card *−22%*. This turns a vague bar
  into a concrete, rankable, talk-about-able number for each moment.
- **Event Pins** — goals, yellow/red cards, penalties, VAR, substitutions and
  corners from the scores/events stream, pinned to the exact moment on the ribbon,
  each tagged with its Impact Score.
- **AI Co-Commentator** — short, plain-language narration generated on each
  *swing moment* and key event. Explains cause → effect, never advises a bet.
- **"The Market Knew First"** — when the consensus probability drifts *before* a
  visible event (pressure building), we surface it: *"The market has been sensing
  this for two minutes."* A magic, demoable moment no casual app shows.
  *(Depends on in-play odds granularity — see Open Questions.)*
- **Swing Detector** — server-side logic that flags meaningful probability moves
  (e.g. a jump beyond a threshold within a short window) so narration fires on
  what matters, not on noise.
- **Story of the Match** — auto-generated, shareable recap card with the momentum
  arc and the top moments ranked by Impact Score.
- **Biggest Swings Leaderboard** — a tournament-wide, cross-match ranking of the
  highest-impact moments across all 104 games. Replayable and shareable, it gives
  the product a reason to open *between* matches, and a viral surface.
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

**Base URLs (verified live in the Phase 0 spike):**
- **Mainnet:** `https://txline.txodds.com` serves **both** auth and data.
- **Devnet:** `https://txline-dev.txodds.com` serves both. *(The `oracle.txodds.com`
  / `oracle-dev.txodds.com` hosts in the older example code no longer resolve —
  use the `txline` hosts.)*

**Full sign-up flow (verified, 11 steps condensed):**
1. `POST https://oracle.txodds.com/auth/guest/start` → anonymous **JWT** with
   guest claims. *(JWT expires after 30 days; on HTTP 401, re-acquire.)*
2. Build + sign + confirm a Solana **`subscribe`** instruction with the duration
   in weeks (multiple of 4) and the chosen service level. The wallet is the fee
   payer. **For the free World Cup tier the contract charges 0 TxLINE.**
3. Record the confirmed transaction signature (`txSig`).
4. Construct a strict message binding `txSig` + comma-separated selected leagues
   + the JWT, sign it with the wallet secret key (detached signature), Base64-encode.
5. `POST https://oracle.txodds.com/api/token/activate` with `{ txSig,
   walletSignature (base64), leagues[] }` and the JWT → long-lived **API token**.
- Paid tiers only: `POST /api/guest/purchase/quote` with `{ buyerPubkey,
  txlineAmount }` returns a partially-signed purchase tx. **Skipped for the free
  World Cup tier** (token economics: 1 USDT = 1,000 TxLINE).
- **Service levels (verified from `subscription-tiers.md`):** both relevant tiers
  are **free** and scoped to *"World Cup & International Friendlies"*, and both
  include *"Scores and **StablePrice Odds**"* (the aggregated consensus line that
  feeds our ribbon):
  - **Level 12 — mainnet, real-time, free.** This is the tier we demo on.
  - **Level 1 — 60-second delayed, free** (available on **both** mainnet and
    devnet). We develop on **devnet Level 1** (no mainnet spend), and switch to
    **mainnet Level 12** for the live/real-time demo.
- Billing cycles are 28 days, purchased in 4-week multiples; the World Cup tiers
  are priced at zero. Requirement permits **mainnet or devnet**.
- **Note:** real-time (Level 12) appears to be **mainnet-only** — devnet tops out
  at the 60-second-delayed Level 1. Plan the real-time demo on mainnet.
- **Sampling cadence:** the spec overview describes the free World Cup feed as
  *"real-time sampled every 60 seconds."* A ~60s odds cadence is perfectly
  adequate for the Momentum Ribbon and Impact Scores; it only weakens the
  fine-grained "Market Knew First" pre-event drift detection, which is why that
  feature is positioned as a nice-to-have, not core.
- The wallet acts as transaction **fee payer** even on the free tier (nominal
  SOL gas), and the contract charges **0 TxLINE** for the World Cup subscription.

All requests after activation send:
`Authorization: Bearer {jwt}` **and** `X-Api-Token: {apiToken}`.

### Fixtures (match list)

- `GET /api/fixtures/snapshot` — optional query `startEpochDay`, `competitionId`.
  Returns `Fixture[]` with fields:
  `Ts`, `StartTime`, `Competition`, `CompetitionId`, `FixtureGroupId`,
  `Participant1Id`, `Participant1`, `Participant2Id`, `Participant2`,
  `FixtureId`, `Participant1IsHome`.
- **Mostly self-scoping:** the free Level 1/12 subscriptions only carry *"World
  Cup & International Friendlies,"* so the feed is already narrow — heavy
  filtering is unnecessary. **TO VERIFY:** the exact World Cup `competitionId`
  (published in the soccer coverage CSV, not inline in the docs) to separate the
  104 World Cup games from international friendlies in the list.

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
- **The signal is even better than "odds."** The spec states the feed includes
  the **`Stable Price`** — *"demargined prices and **percentages**, currently for
  key markets in European football (soccer)."* "Demargined" means the bookmaker
  margin (the vig) has been removed, so the percentage is a **fair probability**,
  not a marked-up price. That is *exactly* a clean win-probability — we render
  **`Pct`** directly as the momentum %, with no raw odds and no betting language
  reaching the fan.
- **Consensus is provided, not computed by us.** `Stable Price` is already an
  aggregated/demargined line (carried via `SuperOddsType`), so we do **not** need
  to average across individual `Bookmaker` records. This removes a whole class of
  modelling risk.
- **TO VERIFY (now low-risk, one probe call):** the exact `PriceNames` string
  labels for the match-result market (to map home/draw/away) and the literal
  `SuperOddsType` value for the Stable Price line. Not enumerated in the spec —
  resolved instantly by inspecting one real `GET /api/odds/updates/{fixtureId}`
  response. The integer `Prices` are the raw price representation; we use `Pct`
  and can ignore `Prices` scaling for the ribbon.

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

## Verified Live — Phase 0 Data Spike ✅

The full pipe has been **proven end to end on devnet** (see `/spike`). A throwaway
wallet ran: guest JWT → on-chain `subscribe` → activate → real World Cup data.
This resolved every previously-open field question with **real payload values**:

**On-chain / auth (devnet):**
- Devnet program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`; TxL mint
  `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG` (Token-2022). *(Mainnet program
  `9Exb…`, mint `Zhw9…` — the IDL ships mainnet; override per cluster.)*
- `subscribe(serviceLevelId=1, weeks)` — **`weeks` must be a multiple of 4**
  (on-chain error `InvalidWeeks` otherwise). Free tier charged **0 TxLINE**.
- Message binding `` `${txSig}:${leagues}:${jwt}` `` → NaCl detached → base64;
  activation returns an API token shaped `txoracle_api_…`.

**Fixtures:** `GET /api/fixtures/snapshot` returned live competitions
`["World Cup", "Friendlies"]`. **World Cup `CompetitionId = 72`, `SportId = 1`.**

**Odds — the ribbon signal (resolved):**
- Markets seen via `SuperOddsType`: **`1X2_PARTICIPANT_RESULT`** (match result),
  `OVERUNDER_PARTICIPANT_GOALS`, `ASIANHANDICAP_PARTICIPANT_GOALS`.
- The match-result market uses `PriceNames = ["part1","draw","part2"]`
  (home / draw / away via `Participant1IsHome`), with `MarketPeriod = null` for
  full-time and `"half=1"` for first half.
- **`Pct` is the demargined fair probability** and the three values sum to ~100%
  (e.g. `["5.556","11.624","82.850"]`). We render this directly as the Momentum
  Ribbon. `Prices` are decimal odds ×1000 (e.g. `1207` = 1.207) — not needed.

**Scores / events (resolved, PascalCase):**
- Each row carries `Action`, `StatusId` (match phase; `4` = 2nd-half in play),
  `Clock {Running, Seconds}`, `Score` (per-participant per-phase `Goals` /
  `YellowCards` / `Corners`), `Data` (event detail, e.g. `substitution` →
  `PlayerInId` / `PlayerOutId`), and `Stats` (period-keyed stat map).
- **`Action` enumeration (verified):** `goal`, `yellow_card`, `penalty`,
  `penalty_outcome`, `var`, `var_end`, `substitution`, `corner`, `shot`,
  `free_kick`, `kickoff`, `additional_time`, `injury`, `halftime_finalised`,
  `game_finalised`, `lineups`, plus **possession-danger states**
  (`attack_possession`, `danger_possession`, `high_danger_possession`,
  `safe_possession`) — a *pitch-pressure* signal we can fuse with odds drift.

**Bonus capability unlocked:** the possession-danger + `shot` + `corner` events
give a second, on-pitch momentum signal independent of the market. Triangulating
*market drift* (odds `Pct`) against *pitch pressure* (possession danger) is what
powers the AI co-commentator and the "Market Knew First" moment — and it is hard
to reproduce without TxLINE's combined feed.

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

Verified against the live OpenAPI spec (`https://txline.txodds.com/docs/docs.yaml`,
v1.5.2) and the docs index (`llms.txt`). *(Note: the `api-reference/openapi.json`
URL currently serves a placeholder "Plant Store" sample — use `docs.yaml`.)*

**Resolved during this audit:**

- ✅ **Auth base URLs** — `oracle.txodds.com` (mainnet) / `oracle-dev.txodds.com`
  (devnet) for guest-start + activate; `txline.txodds.com` for data.
- ✅ **Full Solana sign-up flow** — 11-step guest-JWT → `subscribe` (0 TxLINE on
  free tier) → activate → API token, documented above.
- ✅ **Consensus line** — `Stable Price` is pre-aggregated + **demargined**;
  `Pct` is a fair probability %. No client-side bookmaker averaging needed.
- ✅ **`Prices` for the ribbon** — not needed; we use `Pct`.
- ✅ **SSE event shape** — `OddsStreamEvent`/scores stream emit `{ id, event,
  data }` with `data` = the payload object, plus `heartbeat` events.

**Also resolved by the Phase 0 spike (real payloads):**

- ✅ **Match-result market** — `SuperOddsType = 1X2_PARTICIPANT_RESULT`,
  `PriceNames = ["part1","draw","part2"]`, `Pct` = demargined fair %.
- ✅ **World Cup `CompetitionId = 72`** (live from `/api/fixtures/snapshot`).
- ✅ **`Action` enumeration** and the `Score` / `Data` / `Stats` / `Clock` /
  `StatusId` event schema (PascalCase) — documented above.
- ✅ **Live hosts** — `txline.txodds.com` / `txline-dev.txodds.com`.

**Still genuinely open:**

1. **In-play (`InRunning: true`) odds density during a real live match** — the
   spiked fixture was pre-match (`InRunning: false`). Confirm the tick rate once a
   World Cup match is actually in play. *(Expected fine; the ribbon only needs a
   tick every several seconds.)*
2. **Historical replay endpoints** — the odds historical-interval path is keyed by
   `epochDay` / `hourOfDay` / `interval` (+ `fixtureId`); confirm the exact score
   equivalents and full-sequence paths for Replay Mode.
3. **Red-card signalling** — `yellow_card` is confirmed; verify the exact `Action`
   value for a red/second-yellow (likely `red_card`) on a live match.
4. **Merkle proofs (stretch)** — endpoint paths + on-chain verify flow for a
   "verified on Solana" badge.

---

*Built for the TxLINE / TxODDS World Cup Hackathon — "Consumer and Fan
Experiences" track. Uses TxLINE live data as input; sign-up via Solana.*
