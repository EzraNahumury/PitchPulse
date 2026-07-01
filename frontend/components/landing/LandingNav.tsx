"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#app", label: "App" },
];

/** Landing wordmark — the "I" is a rising momentum tick, on light. */
function LandingMark() {
  return (
    <a href="#home" className="inline-flex items-center gap-2.5">
      <span className="relative inline-block h-5 w-5" aria-hidden>
        <span
          className="absolute inset-x-0 bottom-0 h-full rounded-[2px] bg-home"
          style={{
            clipPath:
              "polygon(0 60%,30% 60%,45% 20%,60% 80%,72% 45%,100% 45%,100% 100%,0 100%)",
          }}
        />
      </span>
      <span className="head text-[1.35rem] tracking-tight">
        <span className="text-neutral-900">Pitch</span>
        <span className="text-home">Pulse</span>
      </span>
    </a>
  );
}

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <LandingMark />

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[0.9rem] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="landing-wallet flex items-center gap-3">
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 lg:inline">
            Devnet
          </span>
          <WalletMultiButton />
        </div>
      </nav>
    </header>
  );
}
