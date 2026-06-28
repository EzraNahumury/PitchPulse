"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * SSR-safe "are we on the client yet" flag. Returns false during server render
 * and the first client paint, true afterward — without calling setState in an
 * effect (which Next 16's react-hooks/set-state-in-effect rule forbids).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
