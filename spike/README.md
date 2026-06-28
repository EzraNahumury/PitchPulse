# PitchPulse — Phase 0 Data Spike

Proves the TxLINE pipe end to end on **devnet** and resolves the last open
unknowns (the `PriceNames` labels and the `SuperOddsType` literal) by printing a
**real** odds/scores payload. Adapts the official `txodds/tx-on-chain` examples.

## What it does

1. Loads or **generates** a devnet wallet (`wallet-devnet.json`, gitignored) and
   airdrops devnet SOL for gas.
2. `POST {AUTH_BASE}/auth/guest/start` → guest **JWT**.
3. On-chain `subscribe(serviceLevelId, weeks)` via the `txoracle` program
   (`9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA`). Free World Cup / International
   tier (Level 1) charges **0 TxLINE**; you only pay nominal devnet SOL gas.
4. Signs `${txSig}:${leagues}:${jwt}` with the wallet (NaCl detached) and
   `POST {AUTH_BASE}/api/token/activate` → long-lived **API token**.
5. `GET {DATA_BASE}/api/fixtures/snapshot`, picks a fixture, then fetches its
   **odds** and **scores**, saving raw payloads to `./out/`.
6. Prints the resolved mapping: `SuperOddsType` value(s) (expected
   `TXStablePriceDemargined`), the `PriceNames` sets, and a sample `Pct`.

## Run

```bash
cd spike
cp .env.example .env      # defaults are fine for devnet
npm install
npm run probe
```

If the devnet faucet rate-limits the airdrop, fund the printed address at
<https://faucet.solana.com> (Devnet) and re-run.

## Verified facts baked in

- Program: `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` (`subscribe(u16, u8)`)
- PDAs: `pricing_matrix`, `token_treasury_v2`; mint `TXLINE_MINT` from the IDL
- Auth host (devnet): `oracle-dev.txodds.com`
- Odds line: `TXStablePriceDemargined` (demargined fair probability via `Pct`)

## Still confirmed by this run (the point of the spike)

- Exact `PriceNames` labels for the match-result market (home / draw / away).
- Whether devnet data is served from `oracle-dev` or `txline-dev` (override
  `DATA_BASE` in `.env` if the data calls 404).
- Whether the current tier exposes live in-play odds rows right now.
