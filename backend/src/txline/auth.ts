/**
 * TxLINE credentials: returns { jwt, apiToken }, cached on disk.
 * On a cache miss / 401 it runs the verified flow:
 *   guest/start -> on-chain subscribe(level, weeks) -> token/activate.
 * weeks must be a multiple of 4 (on-chain InvalidWeeks otherwise).
 */
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as nacl from "tweetnacl";
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import idl from "../../idl/txoracle.json";
import { config } from "../config";

export interface Creds { jwt: string; apiToken: string; }

const CACHE_FILE = path.join(config.cacheDir, "creds.json");
const SELECTED_LEAGUES: number[] = [];

function readCache(): Creds | null {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch { return null; }
}
function writeCache(c: Creds) {
  fs.mkdirSync(config.cacheDir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2));
}

// A cheap call that requires valid creds; 200 => creds still good.
async function credsValid(c: Creds): Promise<boolean> {
  try {
    const res = await axios.get(`${config.txlineBase}/api/fixtures/snapshot`, {
      headers: { Authorization: `Bearer ${c.jwt}`, "X-Api-Token": c.apiToken },
      timeout: 20000,
      validateStatus: () => true,
    });
    return res.status === 200;
  } catch { return false; }
}

function loadWallet(connection: Connection): Keypair {
  const p = path.resolve(__dirname, "../../", config.walletPath);
  if (!fs.existsSync(p)) {
    throw new Error(`Wallet not found at ${p}. Run the spike first to create + fund a devnet wallet.`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}

async function fullAuth(): Promise<Creds> {
  const connection = new Connection(config.rpcUrl, "confirmed");
  const keypair = loadWallet(connection);
  const bal = await connection.getBalance(keypair.publicKey);
  if (bal < 0.05 * LAMPORTS_PER_SOL) {
    throw new Error(`Wallet ${keypair.publicKey.toBase58()} has too little SOL (${bal / LAMPORTS_PER_SOL}). Fund it on devnet.`);
  }

  const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed" });
  const program = new Program({ ...(idl as any), address: config.programId } as any, provider);
  const mint = new PublicKey(config.txlineMint);

  // 1) guest JWT
  const jwt = (await axios.post(`${config.txlineBase}/auth/guest/start`, {}, { timeout: 20000 })).data.token;

  // 2) ATA + PDAs
  const ata = await getOrCreateAssociatedTokenAccount(
    connection, keypair, mint, keypair.publicKey, false, "confirmed", undefined, TOKEN_2022_PROGRAM_ID
  );
  const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], program.programId);
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], program.programId);
  const tokenTreasuryVault = getAssociatedTokenAddressSync(mint, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID);

  // 3) subscribe (free tier, 0 TxLINE)
  const txSig = await program.methods
    .subscribe(config.serviceLevelId, config.durationWeeks)
    .accounts({
      user: keypair.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: mint,
      userTokenAccount: ata.address,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // 4) sign binding + activate
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
  const walletSignature = Buffer.from(
    nacl.sign.detached(new TextEncoder().encode(messageString), keypair.secretKey)
  ).toString("base64");
  const act = await axios.post(
    `${config.txlineBase}/api/token/activate`,
    { txSig, walletSignature, leagues: SELECTED_LEAGUES },
    { headers: { Authorization: `Bearer ${jwt}` }, timeout: 20000 }
  );
  const apiToken = act.data.token || act.data;
  const creds: Creds = { jwt, apiToken };
  writeCache(creds);
  return creds;
}

let inflight: Promise<Creds> | null = null;

export async function ensureCreds(): Promise<Creds> {
  const cached = readCache();
  if (cached && (await credsValid(cached))) return cached;
  if (!inflight) inflight = fullAuth().finally(() => { inflight = null; });
  return inflight;
}
