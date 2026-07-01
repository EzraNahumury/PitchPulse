"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useMounted } from "@/lib/useMounted";
import WalletAvatar from "./WalletAvatar";
import AccountModal from "./AccountModal";

const SIGN_MESSAGE =
  "Sign in to PitchPulse. This proves wallet ownership for sign-up. No funds move. Momentum and sentiment, not betting.";

const sessionKey = (pubkey: string) => `pp_signed_${pubkey}`;

/**
 * Solana sign-up: connect a wallet, then sign a plain message to prove
 * ownership (no transaction, no funds). Satisfies the hackathon's "sign up
 * through Solana" requirement without any financial action.
 */
export default function WalletStatus() {
  const mounted = useMounted();
  const { publicKey, signMessage, connected } = useWallet();
  // event-driven overrides so we never sync state inside an effect
  const [override, setOverride] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const pk = connected && publicKey ? publicKey.toBase58() : null;
  const short = pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : "";
  const signed =
    mounted && pk
      ? (override[pk] ?? localStorage.getItem(sessionKey(pk)) === "1")
      : false;

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    const key = publicKey.toBase58();
    setBusy(true);
    setRejected(false);
    try {
      await signMessage(new TextEncoder().encode(SIGN_MESSAGE));
      localStorage.setItem(sessionKey(key), "1");
      setOverride((o) => ({ ...o, [key]: true }));
    } catch {
      setRejected(true);
    } finally {
      setBusy(false);
    }
  }, [publicKey, signMessage]);

  if (!mounted) {
    return <div className="skeleton h-9 w-36 rounded-sm" />;
  }

  return (
    <div className="flex items-center gap-2">
      {connected && !signed ? (
        <button
          onClick={signIn}
          disabled={busy}
          className="rounded-sm border border-away/50 bg-away/10 px-3 py-2 text-xs font-medium text-away transition-colors hover:bg-away/20 disabled:opacity-60"
        >
          {busy
            ? "Check your wallet…"
            : rejected
              ? "Try sign-in again"
              : "Sign in with Solana"}
        </button>
      ) : null}
      {connected && signed ? (
        <span className="hidden items-center gap-1.5 rounded-full border border-live/40 px-2.5 py-1.5 text-xs text-live sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-live" />
          Signed in
        </span>
      ) : null}

      {pk ? (
        <button
          onClick={() => setAccountOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-2.5 py-1.5 text-sm font-semibold text-chalk transition-colors hover:bg-panel-2"
        >
          <WalletAvatar pubkey={pk} size={22} />
          <span className="tnum">{short}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-chalk-faint">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <WalletMultiButton />
      )}

      {accountOpen ? <AccountModal onClose={() => setAccountOpen(false)} /> : null}
    </div>
  );
}
