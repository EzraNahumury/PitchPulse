"use client";

import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import LandingNav from "./LandingNav";
import MomentumTeaser from "./MomentumTeaser";
import StickerMarquee from "./StickerMarquee";

/* README-grounded feature set (Key Features). */
const FEATURES: { tag: string; title: string; body: string }[] = [
  {
    tag: "01",
    title: "Momentum Ribbon",
    body: "A live, animated win-probability timeline driven by the consensus-odds Pct stream — framed strictly as match momentum, never a bet.",
  },
  {
    tag: "02",
    title: "Momentum Impact Score",
    body: "Every moment scored by how much it moved the market's belief. A goal might be +38, a red card −22 — Win-Probability-Added for football.",
  },
  {
    tag: "03",
    title: "AI Co-Commentator",
    body: "Short, plain-language narration on each swing and key event. It explains cause and effect in one sentence, and never advises a bet.",
  },
  {
    tag: "04",
    title: "Story of the Match",
    body: "At full time, one shareable card: the full momentum arc, the biggest swing moments, and a one-paragraph recap. One tap to share.",
  },
  {
    tag: "05",
    title: "Biggest Swings",
    body: "A tournament-wide ranking of the highest-impact moments across all 104 games — a reason to open PitchPulse between matches.",
  },
  {
    tag: "06",
    title: "Replay Mode",
    body: "Re-stream any finished fixture from historical data through the exact same pipeline, so the experience is fully demonstrable with no live match.",
  },
];

/* README-grounded Core User Experience, 5 steps. */
const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Sign up with Solana",
    body: "Connect your wallet to sign in. The TxLINE data token is provisioned server-side and never touches your browser. No funds move.",
  },
  {
    n: "2",
    title: "Pick a match",
    body: "A clean list of World Cup fixtures. Live matches surface first; finished matches are ready in Replay mode.",
  },
  {
    n: "3",
    title: "Watch the pulse",
    body: "Inside a match, the Momentum Ribbon shifts toward the side the market currently favours — in real time, from the odds Pct.",
  },
  {
    n: "4",
    title: "Feel the swings",
    body: "On a goal, red card, penalty or VAR, a marker drops onto the ribbon and the co-commentator prints one human sentence.",
  },
  {
    n: "5",
    title: "Get the story",
    body: "Tap Story of the Match for a shareable card: the momentum arc, the biggest swings, and a one-paragraph recap.",
  },
];

const accentOf = (i: number) => (i % 2 === 0 ? "var(--color-home)" : "var(--color-away)");

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <LandingNav />

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section id="home" className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "url('/asset/bkg1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
            maskImage: "linear-gradient(to bottom, black, transparent 86%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 86%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3.5 py-1.5 kicker">
              <span className="h-1.5 w-1.5 rounded-full bg-home" />
              World Cup 2026 · second-screen companion
            </span>
            <h1 className="head mt-6 text-[2.4rem] text-neutral-900 sm:text-[3.4rem]">
              See who&apos;s winning <span className="em">the moment</span> —
              <br className="hidden sm:block" /> and understand exactly{" "}
              <span className="em">why</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-500 sm:text-[1.05rem]">
              PitchPulse turns TxLINE&apos;s live scores, events and consensus odds
              into a single animated momentum story — narrated in plain language and
              exported as a shareable recap. Scores tell you{" "}
              <em className="not-italic font-medium text-neutral-900">what</em>. We
              show you <em className="not-italic font-medium text-neutral-900">why</em>.
            </p>
          </div>

          {/* oversized wordmark behind the mascot */}
          <div className="relative mt-6 flex items-end justify-center">
            <span
              aria-hidden
              className="head pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center leading-none text-home/[0.22]"
              style={{ fontSize: "clamp(3.5rem, 16.5vw, 14rem)", fontWeight: 700, letterSpacing: "-0.05em" }}
            >
              PITCHPULSE
            </span>
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[68%] w-[68%] max-w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200/80"
            />
            <div className="relative z-10 float-y">
              <Image
                src="/asset/image1-removebg-preview.png"
                alt="PitchPulse World Cup mascots chasing a golden ball"
                width={531}
                height={470}
                priority
                className="h-auto w-[min(86vw,700px)] drop-shadow-[0_34px_44px_rgba(15,23,20,0.16)]"
              />
            </div>
          </div>

          {/* CTA row */}
          <div id="app" className="landing-wallet mx-auto mt-4 flex max-w-3xl flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <WalletMultiButton />
              <a
                href="#how"
                className="rounded-full border border-neutral-300 px-6 py-[11px] text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                See how it works
              </a>
            </div>
            <p className="text-xs text-neutral-400">
              Connect a Solana wallet to enter the live app. Entertainment &amp;
              information — not betting.
            </p>
          </div>

          {/* momentum teaser + stat rail */}
          <div className="mx-auto mt-14 grid max-w-4xl items-center gap-6 lg:grid-cols-[1.15fr_1fr]">
            <MomentumTeaser />
            <dl className="grid grid-cols-3 gap-3">
              {[
                { k: "104", v: "World Cup games" },
                { k: "2", v: "live data streams" },
                { k: "0", v: "bets, ever" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-5 text-center"
                >
                  <dt className="head tnum text-3xl text-neutral-900">{s.k}</dt>
                  <dd className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───────────────────────── FEATURES ───────────────────────── */}
      <section id="features" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="kicker">What&apos;s inside</p>
          <h2 className="head mt-3 text-[2rem] text-neutral-900 sm:text-[2.6rem]">
            Every moment, scored by{" "}
            <span className="em">how much it moved the market&apos;s belief</span>.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <article
              key={f.tag}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_26px_60px_-34px_rgba(15,23,20,0.4)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="tnum text-sm font-semibold" style={{ color: accentOf(i) }}>
                  {f.tag}
                </span>
                <span className="h-2 w-2 rounded-full" style={{ background: accentOf(i) }} />
              </div>
              <h3 className="head text-[1.35rem] text-neutral-900">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-500">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─────────────── MARKET SENTIMENT, NOT BETTING (judge) ─────────────── */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="kicker">The signal</p>
            <h2 className="head mt-3 text-[2rem] text-neutral-900 sm:text-[2.6rem]">
              The sharpest probability in sports —{" "}
              <span className="em">with the betting stripped out</span>.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-600">
              TxLINE&apos;s Stable Price line is already{" "}
              <span className="font-medium text-neutral-900">demargined</span> — the
              bookmaker&apos;s cut removed — so its <span className="tnum">Pct</span>{" "}
              is a fair win-probability, not a marked-up price. We render it directly
              as momentum, reframed as neutral market sentiment.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "No bet slip, no stake, no odds-as-call-to-action.",
                "No custody, deposits, payouts, or money movement.",
                "The AI describes momentum — it never suggests a position.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-away" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-away/[0.06]" aria-hidden />
            <Image
              src="/asset/judge.png"
              alt="A PitchPulse analyst reading match probabilities"
              width={1452}
              height={1103}
              className="relative h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
      <section id="how" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="kicker">How it works</p>
            <h2 className="head mt-3 text-[2rem] text-neutral-900 sm:text-[2.6rem]">
              From wallet to the whistle in <span className="em">five moments</span>.
            </h2>
            <div className="relative mt-9">
              <Image
                src="/asset/Hero1.png"
                alt="PitchPulse mascots celebrating the World Cup"
                width={1600}
                height={1177}
                className="h-auto w-full"
              />
            </div>
          </div>

          <ol className="relative space-y-7 border-l border-neutral-200 pl-8">
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span className="absolute -left-[41px] flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  {s.n}
                </span>
                <h3 className="head text-[1.3rem] text-neutral-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── MARQUEE ───────────────────────── */}
      <section className="border-y border-neutral-200 bg-white py-16">
        <div className="mx-auto mb-9 w-full max-w-6xl px-5 text-center sm:px-8">
          <h2 className="head text-[2rem] text-neutral-900 sm:text-[2.6rem]">
            104 games. Every nation. <span className="em">One pulse</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
            One normalised feed, from the group stage to the final — scaled across
            the whole tournament.
          </p>
        </div>
        <StickerMarquee />
      </section>

      {/* ───────────────────────── DARK CTA ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/asset/bkg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#070b0a]/85" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-24 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="head text-[2.6rem] text-white sm:text-[3.4rem]">
              Ready to feel <span className="em text-white">the momentum</span>?
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
              Connect your Solana wallet and step into the live match view — the
              Momentum Ribbon, the co-commentator, and the Story of the Match are
              one click away.
            </p>
            <div className="landing-wallet mt-8 flex flex-wrap items-center gap-3">
              <WalletMultiButton />
              <a
                href="#features"
                className="rounded-full border border-white/25 px-6 py-[11px] text-sm font-semibold text-white/90 transition-colors hover:border-white hover:text-white"
              >
                Explore features
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-[min(78vw,400px)]">
            <Image
              src="/asset/image2.png"
              alt="PitchPulse mascots lifting the World Cup trophy"
              width={1400}
              height={993}
              className="h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────── FOOTER ───────────────────────── */}
      <footer className="bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-9 text-center sm:flex-row sm:px-8 sm:text-left">
          <span className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="PitchPulse" width={24} height={24} style={{ width: 24, height: "auto" }} />
            <span className="head text-lg tracking-tight">
              <span className="text-neutral-900">Pitch</span>
              <span className="text-home">Pulse</span>
            </span>
          </span>
          <p className="text-xs text-neutral-400">
            Built on TxLINE live data · sign-up via Solana · entertainment &amp;
            information, not betting
          </p>
        </div>
      </footer>
    </div>
  );
}
