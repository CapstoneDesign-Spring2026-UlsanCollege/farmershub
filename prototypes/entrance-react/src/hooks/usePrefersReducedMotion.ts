import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Reactively tracks the user's `prefers-reduced-motion` setting. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(QUERY).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
