import { buildServer } from "./server";
import { config } from "./config";
import { ensureCreds } from "./txline/auth";

async function main() {
  console.log("PitchPulse backend starting...");
  console.log("TxLINE base:", config.txlineBase);
  // Warm the credentials so the first request is fast (and fails loud if auth breaks).
  try {
    await ensureCreds();
    console.log("TxLINE credentials ready.");
  } catch (e: any) {
    console.error("WARNING: could not obtain TxLINE credentials at boot:", e.message || e);
    console.error("The server will still start; calls will retry auth on demand.");
  }
  const app = await buildServer();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`PitchPulse backend listening on http://localhost:${config.port}`);
  console.log("Try:  GET /api/health  |  /api/fixtures?worldCup=1  |  /api/match/:id  |  /api/match/:id/stream");
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
