import { useState } from "react";
import { Entrance } from "./components/Entrance";
import { IntroOverlay } from "./components/IntroOverlay";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  // Reduced motion: skip the intro entirely — the hero shows immediately.
  const [introDone, setIntroDone] = useState(reducedMotion);

  return (
    <>
      <Entrance />
      {!introDone && <IntroOverlay onDone={() => setIntroDone(true)} />}
    </>
  );
}
