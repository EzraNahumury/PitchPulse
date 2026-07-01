"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import WalletAvatar from "./WalletAvatar";

/**
 * RainbowKit-style account card: avatar, address, SOL balance, and Copy /
 * Disconnect actions, plus a link to the Solana explorer. Replaces the default
 * wallet-adapter dropdown for a connected wallet.
 */
export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { publicKey, disconnect, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const pk = publicKey?.toBase58() ?? "";
  const short = pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : "";

  // Fetch balance once when the card opens (async setState — not a sync effect write).
  useEffect(() => {
    if (!publicKey) return;
    let alive = true;
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (alive) setBalance(lamports / LAMPORTS_PER_SOL);
      })
      .catch(() => {
        if (alive) setBalance(null);
      });
    return () => {
      alive = false;
    };
  }, [publicKey, connection]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pk);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  }, [pk]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } finally {
      onClose();
    }
  }, [disconnect, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0f1714]/40 px-4 pt-24 backdrop-blur-[6px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[380px] rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_44px_100px_-34px_rgba(15,23,20,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <div className="mb-1 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* identity */}
        <div className="flex flex-col items-center">
          <WalletAvatar pubkey={pk} size={64} />
          <div className="mt-4 head text-xl text-neutral-900">{short}</div>
          <div className="tnum mt-1 text-sm text-neutral-400">
            {balance == null ? "— SOL" : `${balance.toFixed(3)} SOL`}
            <span className="ml-1.5 text-neutral-300">· devnet</span>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={copy}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-200 bg-neutral-50 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M5 15V5a2 2 0 012-2h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            {copied ? "Copied" : "Copy Address"}
          </button>
          <button
            onClick={handleDisconnect}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-200 bg-neutral-50 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:border-home/40 hover:bg-home/5 hover:text-home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M10 12H3m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Disconnect
          </button>
        </div>

        {/* footer */}
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <p className="text-xs text-neutral-400">
            {wallet?.adapter.name
              ? `Connected with ${wallet.adapter.name}.`
              : "Connected."}{" "}
            No funds move — sign-in only.
          </p>
          <a
            href={`https://explorer.solana.com/address/${pk}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between text-sm font-medium text-neutral-800 transition-colors hover:text-home"
          >
            View on explorer
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H8M17 7v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
