import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and the first client render, then `true` after
 * hydration completes. This is the React-recommended, SSR-safe way to gate
 * client-only UI without a `setState`-in-effect (which triggers cascading
 * renders and the `react-hooks` lint rule).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
