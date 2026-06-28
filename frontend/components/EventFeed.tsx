"use client";

import type { MatchEvent } from "@/lib/types";
import { actionMeta, impactText, minute, sideColorVar } from "@/lib/format";

interface Props {
  title: string;
  rows: MatchEvent[];
  rank?: boolean;
  empty?: string;
}

/** A list of match events. `rank` shows 1..n ordering for the biggest swings. */
export default function EventFeed({ title, rows, rank, empty }: Props) {
  return (
    <div className="rounded-md border border-line bg-panel/60">
      <div className="eyebrow border-b border-line px-3 py-2">{title}</div>
      {rows.length === 0 ? (
        <p className="px-3 py-6 text-sm text-chalk-faint">{empty ?? "Nothing yet."}</p>
      ) : (
        <ul className="divide-y divide-line/60">
          {rows.map((e, i) => {
            const { glyph } = actionMeta(e.action);
            const color = sideColorVar(e.side);
            return (
              <li
                key={`${e.ts}-${i}`}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                {rank ? (
                  <span className="tnum w-4 text-chalk-faint">{i + 1}</span>
                ) : (
                  <span className="tnum w-9 shrink-0 text-chalk-dim">
                    {minute(e.clock)}
                  </span>
                )}
                <span
                  className="tnum shrink-0 rounded-xs px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                  style={{ background: color, color: "var(--color-void)" }}
                >
                  {glyph}
                </span>
                <span className="min-w-0 flex-1 truncate text-chalk-dim">
                  {e.label}
                </span>
                {Math.abs(e.impact) >= 0.5 ? (
                  <span className="tnum shrink-0 font-semibold" style={{ color }}>
                    {impactText(e.impact)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
