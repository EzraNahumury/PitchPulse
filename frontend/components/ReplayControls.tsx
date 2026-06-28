"use client";

import type { StreamMode } from "@/lib/types";
import type { StreamStatus } from "@/lib/useMatchStream";

interface Props {
  mode: StreamMode;
  stepMs: number;
  status: StreamStatus;
  setMode: (m: StreamMode) => void;
  setStepMs: (n: number) => void;
  restart: () => void;
}

const MODES: { key: StreamMode; label: string; hint: string }[] = [
  { key: "demo", label: "Demo", hint: "Simulated moving odds — the ribbon swings on every goal" },
  { key: "replay", label: "Real", hint: "Actual TxLINE snapshot odds (flat on this devnet sample)" },
  { key: "live", label: "Live", hint: "Upstream TxLINE feed in real time" },
];

const SPEEDS: { label: string; stepMs: number }[] = [
  { label: "0.5×", stepMs: 400 },
  { label: "1×", stepMs: 200 },
  { label: "2×", stepMs: 90 },
  { label: "4×", stepMs: 35 },
];

export default function ReplayControls({
  mode,
  stepMs,
  status,
  setMode,
  setStepMs,
  restart,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-sm border border-line">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            title={m.hint}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === m.key
                ? "bg-chalk text-void"
                : "bg-panel text-chalk-dim hover:bg-panel-2"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode !== "live" ? (
        <div className="inline-flex overflow-hidden rounded-sm border border-line">
          {SPEEDS.map((s) => (
            <button
              key={s.stepMs}
              onClick={() => setStepMs(s.stepMs)}
              className={`tnum px-2.5 py-1.5 text-xs transition-colors ${
                stepMs === s.stepMs
                  ? "bg-panel-2 text-chalk"
                  : "bg-panel text-chalk-dim hover:bg-panel-2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <button
        onClick={restart}
        className="rounded-sm border border-line bg-panel px-3 py-1.5 text-xs font-medium text-chalk transition-colors hover:bg-panel-2"
      >
        {status === "done" ? "Replay again" : "Restart"}
      </button>

      <span className="eyebrow ml-auto">
        {status === "streaming"
          ? "Streaming"
          : status === "done"
            ? "Complete"
            : status === "connecting"
              ? "Connecting"
              : status === "error"
                ? "Feed down"
                : "Idle"}
      </span>
    </div>
  );
}
