"use client";

import { useEffect } from "react";

/**
 * Browser wallet extensions (MetaMask, OKX, etc.) race to inject
 * `window.ethereum` and can throw "Cannot redefine property: ethereum" from
 * their own injected scripts. PitchPulse is Solana-only and never touches
 * window.ethereum, so these are third-party errors — this guard stops them from
 * bubbling into Next.js's dev error overlay. It only suppresses errors whose
 * source is a browser extension; app errors are untouched.
 */
export default function ExtensionErrorGuard() {
  useEffect(() => {
    const fromExtension = (s?: string | null) =>
      !!s && (s.includes("chrome-extension://") || s.includes("moz-extension://"));

    const isEthereumRedefine = (msg?: string | null) =>
      !!msg && /Cannot (redefine|set) property:? ethereum/i.test(msg);

    const onError = (e: ErrorEvent) => {
      if (
        fromExtension(e.filename) ||
        fromExtension(e.error?.stack) ||
        isEthereumRedefine(e.message)
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const stack = (reason && (reason.stack || String(reason))) || "";
      if (fromExtension(stack) || isEthereumRedefine(stack)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
    };
  }, []);

  return null;
}
