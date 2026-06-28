import Link from "next/link";

/** PitchPulse wordmark — the "I" is a momentum tick. */
export function Brand({ small }: { small?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <span
        className={`relative inline-block ${small ? "h-4 w-4" : "h-5 w-5"}`}
        aria-hidden
      >
        <span className="absolute inset-x-0 bottom-0 h-full rounded-[2px] bg-home" style={{ clipPath: "polygon(0 60%,30% 60%,45% 20%,60% 80%,72% 45%,100% 45%,100% 100%,0 100%)" }} />
      </span>
      <span
        className={`font-display tracking-tight ${small ? "text-lg" : "text-xl"}`}
      >
        <span className="text-chalk">PITCH</span>
        <span className="text-away">PULSE</span>
      </span>
    </Link>
  );
}

/** Compliance chip — momentum/sentiment, never betting. */
export function ComplianceChip() {
  return (
    <span className="rounded-full border border-line bg-panel/60 px-2.5 py-1 text-[11px] text-chalk-dim">
      Market sentiment · not betting
    </span>
  );
}
