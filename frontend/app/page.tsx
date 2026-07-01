"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMounted } from "@/lib/useMounted";
import Landing from "@/components/landing/Landing";
import AppHome from "@/components/AppHome";

/**
 * Entry gate: a wallet-connected user drops straight into the live app;
 * everyone else sees the landing page. Server render and the first client paint
 * both render Landing (connection state is client-only), so there's no
 * hydration mismatch — the app swaps in once the wallet reports connected.
 */
export default function Page() {
  const mounted = useMounted();
  const { connected } = useWallet();

  if (mounted && connected) return <AppHome />;
  return <Landing />;
}
