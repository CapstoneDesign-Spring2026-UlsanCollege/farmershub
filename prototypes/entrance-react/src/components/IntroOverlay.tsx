import { useEffect, useState } from "react";

const WORDMARK = "FarmersHub";

// Timings (kept in sync with the CSS variables in index.css)
const LETTER_STAGGER = 45; // ms between letters
const LETTER_DURATION = 500; // ms per-letter animation
const GLOW_CAP = 1600; // glow fires by this point at the latest
const EXIT_START = 2600; // overlay begins fading
const TOTAL = 3000; // overlay fully gone / hero revealed

type IntroOverlayProps = {
  /** Called once the overlay has finished and should be removed. */
  onDone: () => void;
};

/**
 * Full-screen intro overlay: logo badge (shine sweep + glow pulse) and a
 * letter-by-letter "FarmersHub" wordmark. After ~3s it fades out and calls
 * `onDone`, revealing the hero underneath. Ported from the v1/vanilla intro.
 */
export function IntroOverlay({ onDone }: IntroOverlayProps) {
  const [glowing, setGlowing] = useState(false);
  const [exiting, setExiting] = useState(false);

  const letters = Array.from(WORDMARK);
  const letterRevealMs = letters.length * LETTER_STAGGER + LETTER_DURATION;

  useEffect(() => {
    // Glow + sweep once the word is (about) revealed, capped so it never drags.
    const glowAt = Math.min(letterRevealMs, GLOW_CAP);
    const timers = [
      window.setTimeout(() => setGlowing(true), glowAt),
      window.setTimeout(() => setExiting(true), EXIT_START),
      window.setTimeout(() => onDone(), TOTAL),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [letterRevealMs, onDone]);

  return (
    <div className={`intro${exiting ? " is-exiting" : ""}`} aria-hidden="true">
      <div className={`intro__badge${glowing ? " is-glowing" : ""}`}>
        <img className="intro__logo" src="/logo.png" alt="" />
        <div className="intro__sweep" />
      </div>
      <div className="intro__word">
        {letters.map((ch, i) => (
          <span
            key={i}
            className="intro__letter"
            style={{ animationDelay: `${i * LETTER_STAGGER}ms` }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}
