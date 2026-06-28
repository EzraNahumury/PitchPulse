import "dotenv/config";
import * as path from "path";

export const config = {
  port: Number(process.env.PORT || 8787),
  rpcUrl: process.env.RPC_URL || "https://api.devnet.solana.com",
  txlineBase: (process.env.TXLINE_BASE || "https://txline-dev.txodds.com").replace(/\/$/, ""),
  programId: process.env.PROGRAM_ID || "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
  txlineMint: process.env.TXLINE_MINT || "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG",
  serviceLevelId: Number(process.env.SERVICE_LEVEL_ID || 1),
  durationWeeks: Number(process.env.DURATION_WEEKS || 4),
  walletPath: process.env.WALLET_PATH || "../spike/wallet-devnet.json",
  worldCupCompetitionId: Number(process.env.WORLD_CUP_COMPETITION_ID || 72),
  cacheDir: path.resolve(__dirname, "../.cache"),
};
