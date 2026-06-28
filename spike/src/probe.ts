/**
 * PitchPulse — Phase 0 Data Spike
 * -------------------------------------------------------------------------
 * Goal: prove the TxLINE pipe end to end and resolve the last open unknowns,
 * by adapting the official tx-on-chain examples:
 *
 *   1. ensure a funded devnet wallet (generate + airdrop if missing)
 *   2. POST {AUTH_BASE}/auth/guest/start            -> guest JWT
 *   3. on-chain subscribe(serviceLevelId, weeks)    -> txSig  (free tier = 0 TxLINE)
 *   4. sign "${txSig}:${leagues}:${jwt}" (nacl)     -> walletSignature (base64)
 *   5. POST {AUTH_BASE}/api/token/activate          -> long-lived API token
 *   6. GET  {DATA_BASE}/api/fixtures/snapshot       -> list fixtures, pick one
 *   7. GET  odds (updates/snapshot) + scores snapshot for that fixture
 *   8. dump raw payloads to ./out and print the resolved field mapping:
 *        - SuperOddsType literal value(s)        (expected: TXStablePriceDemargined)
 *        - PriceNames labels for the result market
 *        - sample Pct (the demargined fair win-probability %)
 *
 * Run:  npm install  &&  npm run probe
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as nacl from "tweetnacl";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import idl from "../idl/txoracle.json";

// ---- config ----
const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
const AUTH_BASE = (process.env.AUTH_BASE || "https://oracle-dev.txodds.com").replace(/\/$/, "");
const DATA_BASE = (process.env.DATA_BASE || "https://oracle-dev.txodds.com").replace(/\/$/, "");
const SERVICE_LEVEL_ID = Number(process.env.SERVICE_LEVEL_ID || 1);
const DURATION_WEEKS = Number(process.env.DURATION_WEEKS || 1);
const WALLET_PATH = process.env.WALLET_PATH || "./wallet-devnet.json";
const SELECTED_LEAGUES: number[] = []; // standard bundle

// Devnet uses a DIFFERENT program + mint than the IDL (which ships mainnet).
// PDAs derive from the program id, so this must match the cluster.
const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);
const TXLINE_MINT = new PublicKey(
  process.env.TXLINE_MINT || "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"
);

const OUT = path.resolve(__dirname, "../out");

function log(...a: any[]) { console.log(...a); }
function save(name: string, data: any) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
  log(`  saved out/${name}`);
}

async function loadOrCreateWallet(connection: Connection): Promise<Keypair> {
  const p = path.resolve(WALLET_PATH);
  let kp: Keypair;
  if (fs.existsSync(p)) {
    kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
    log("Wallet loaded:", kp.publicKey.toBase58());
  } else {
    kp = Keypair.generate();
    fs.writeFileSync(p, JSON.stringify(Array.from(kp.secretKey)));
    log("Wallet generated (saved, gitignored):", kp.publicKey.toBase58());
  }
  // ensure some devnet SOL for rent + gas
  const bal = await connection.getBalance(kp.publicKey);
  log("SOL balance:", bal / LAMPORTS_PER_SOL);
  if (bal < 0.3 * LAMPORTS_PER_SOL) {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let funded = false;
    for (let i = 1; i <= 4 && !funded; i++) {
      log(`Requesting devnet airdrop (1 SOL), attempt ${i}/4...`);
      try {
        const sig = await connection.requestAirdrop(kp.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig, "confirmed");
        funded = true;
        log("Airdrop ok. New balance:", (await connection.getBalance(kp.publicKey)) / LAMPORTS_PER_SOL);
      } catch (e: any) {
        log(`  airdrop attempt ${i} failed: ${String(e.message).slice(0, 90)}`);
        if (i < 4) await delay(4000);
      }
    }
    if (!funded) {
      log("!! Devnet faucet is rate-limited. Fund this address, then re-run:");
      log("  ", kp.publicKey.toBase58());
      log("   Web faucet: https://faucet.solana.com  (select Devnet)");
      throw new Error("insufficient devnet SOL");
    }
  }
  return kp;
}

// GET with TxLINE auth headers; returns parsed JSON or throws with context.
async function authGet(base: string, urlPath: string, jwt: string, apiToken: string, params?: any) {
  const res = await axios.get(`${base}${urlPath}`, {
    params,
    headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
    timeout: 30000,
    validateStatus: () => true,
  });
  if (res.status !== 200) {
    throw new Error(`GET ${urlPath} -> ${res.status}: ${JSON.stringify(res.data).slice(0, 300)}`);
  }
  return res.data;
}

// Try several candidate paths until one returns 200 (endpoint shapes still TO VERIFY).
async function tryGet(base: string, candidates: string[], jwt: string, apiToken: string, params?: any) {
  let lastErr: any;
  for (const c of candidates) {
    try {
      const data = await authGet(base, c, jwt, apiToken, params);
      log(`  ✓ ${c}`);
      return { path: c, data };
    } catch (e: any) {
      lastErr = e;
      log(`  · ${c} -> ${String(e.message).slice(0, 80)}`);
    }
  }
  throw lastErr;
}

function summariseOdds(odds: any[]) {
  if (!Array.isArray(odds) || odds.length === 0) { log("  (no odds rows)"); return; }
  const superTypes = new Set<string>();
  const priceNameSets = new Set<string>();
  let sample: any;
  for (const o of odds) {
    if (o.SuperOddsType) superTypes.add(o.SuperOddsType);
    if (Array.isArray(o.PriceNames)) priceNameSets.add(JSON.stringify(o.PriceNames));
    if (!sample && Array.isArray(o.Pct) && o.Pct.length) sample = o;
  }
  log("\n  >>> RESOLVED FROM LIVE PAYLOAD <<<");
  log("  SuperOddsType values:", [...superTypes]);
  log("  PriceNames sets:", [...priceNameSets].slice(0, 8));
  if (sample) {
    log("  sample row:", {
      SuperOddsType: sample.SuperOddsType,
      MarketPeriod: sample.MarketPeriod,
      MarketParameters: sample.MarketParameters,
      InRunning: sample.InRunning,
      PriceNames: sample.PriceNames,
      Pct: sample.Pct,
      Prices: sample.Prices,
    });
  }
}

async function main() {
  log("=== PitchPulse Phase 0 Data Spike ===");
  log("RPC:", RPC_URL, "| AUTH:", AUTH_BASE, "| DATA:", DATA_BASE);

  const connection = new Connection(RPC_URL, "confirmed");
  const keypair = await loadOrCreateWallet(connection);
  const wallet = new Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  // Override the IDL address (mainnet) with the active-cluster program id.
  const idlForCluster = { ...(idl as any), address: PROGRAM_ID.toBase58() };
  const program = new Program(idlForCluster as any, provider);
  log("Program id:", program.programId.toBase58(), "| mint:", TXLINE_MINT.toBase58());

  // 1) guest JWT
  log("\n[1] guest/start");
  const auth = await axios.post(`${AUTH_BASE}/auth/guest/start`, {}, { timeout: 30000 });
  const jwt = auth.data.token;
  log("  JWT acquired:", jwt ? jwt.slice(0, 24) + "..." : "(none)");

  // 2) ATA + PDAs
  log("\n[2] ensure ATA + derive PDAs");
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, keypair, TXLINE_MINT, keypair.publicKey, false, "confirmed", undefined, TOKEN_2022_PROGRAM_ID
  );
  const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], program.programId);
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], program.programId);
  const tokenTreasuryVault = getAssociatedTokenAddressSync(TXLINE_MINT, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID);

  // 3) subscribe on-chain (free tier charges 0 TxLINE)
  log(`\n[3] subscribe(level=${SERVICE_LEVEL_ID}, weeks=${DURATION_WEEKS})`);
  const txSig = await program.methods
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accounts({
      user: keypair.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: TXLINE_MINT,
      userTokenAccount: userTokenAccount.address,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  log("  txSig:", txSig);

  // 4) sign the binding message
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
  const walletSignature = Buffer.from(
    nacl.sign.detached(new TextEncoder().encode(messageString), keypair.secretKey)
  ).toString("base64");

  // 5) activate -> API token
  log("\n[4] token/activate");
  const act = await axios.post(
    `${AUTH_BASE}/api/token/activate`,
    { txSig, walletSignature, leagues: SELECTED_LEAGUES },
    { headers: { Authorization: `Bearer ${jwt}` }, timeout: 30000 }
  );
  const apiToken = act.data.token || act.data;
  log("  API token acquired:", String(apiToken).slice(0, 24) + "...");

  // 6) fixtures snapshot
  log("\n[5] fixtures/snapshot");
  const fx = await tryGet(DATA_BASE, ["/api/fixtures/snapshot"], jwt, apiToken);
  const fixtures: any[] = Array.isArray(fx.data) ? fx.data : [];
  save("fixtures.json", fixtures);
  log("  fixtures returned:", fixtures.length);
  const comps = [...new Set(fixtures.map((f) => f.Competition))].slice(0, 30);
  log("  competitions:", comps);

  // pick a World Cup / international fixture if present, else the first
  const pick =
    fixtures.find((f) => /world cup|friendl|international|fifa/i.test(f.Competition || "")) ||
    fixtures[0];
  if (!pick) { log("  no fixtures available on this tier right now — stop after auth proof."); return; }
  const fixtureId = pick.FixtureId;
  log("  picked fixture:", fixtureId, "|", pick.Participant1, "vs", pick.Participant2, "|", pick.Competition);

  // 7) odds for that fixture
  log("\n[6] odds for fixture", fixtureId);
  try {
    const odds = await tryGet(
      DATA_BASE,
      [`/api/odds/updates/${fixtureId}`, `/api/odds/snapshot/${fixtureId}`],
      jwt, apiToken
    );
    save("odds.json", odds.data);
    summariseOdds(odds.data);
  } catch (e: any) {
    log("  odds fetch failed:", String(e.message).slice(0, 160));
  }

  // 8) scores for that fixture
  log("\n[7] scores/snapshot", fixtureId);
  try {
    const scores = await tryGet(
      DATA_BASE,
      [`/api/scores/snapshot/${fixtureId}`],
      jwt, apiToken
    );
    save("scores.json", scores.data);
    const arr = Array.isArray(scores.data) ? scores.data : [];
    log("  score rows:", arr.length, "| sample dataSoccer:", arr.find((r: any) => r.dataSoccer)?.dataSoccer);
  } catch (e: any) {
    log("  scores fetch failed:", String(e.message).slice(0, 160));
  }

  log("\n=== DONE. Inspect ./out/*.json. Key answers above under 'RESOLVED'. ===");
}

main().catch((e) => { console.error("\nSPIKE FAILED:", e.message || e); process.exit(1); });
