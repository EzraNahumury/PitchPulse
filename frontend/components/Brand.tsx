import Image from "next/image";
import Link from "next/link";

/** PitchPulse wordmark — flaming-ball logo + name. */
export function Brand({ small }: { small?: boolean }) {
  const s = small ? 22 : 28;
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="PitchPulse"
        width={s}
        height={s}
        priority
        className="h-auto w-auto"
        style={{ width: s, height: "auto" }}
      />
      <span className={`head tracking-tight ${small ? "text-lg" : "text-xl"}`}>
        <span className="text-chalk">Pitch</span>
        <span className="text-home">Pulse</span>
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
