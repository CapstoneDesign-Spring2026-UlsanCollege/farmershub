import { useEffect, useRef, useState } from "react";
import { Login } from "./Login";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type View = "hero" | "login";

/**
 * The hero over the looping farm video, with the login view layered on top of
 * the same (still-playing) video. "Get Started" reveals the login; "Back" /
 * Esc returns to the hero.
 */
export function Entrance() {
  const [view, setView] = useState<View>("hero");
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);

  // Start the looping background video — but only when motion is allowed.
  // With reduced motion it stays paused, showing its poster image.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {});
    }
  }, [reducedMotion]);

  // Return focus to "Get Started" when coming back from the login view
  // (but not on the initial render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (view === "hero") ctaRef.current?.focus();
  }, [view]);

  const showLogin = view === "login";

  return (
    <main className={`hero${showLogin ? " show-login" : ""}`}>
      {/* Looping farm video background. Plays muted; falls back to the poster
          image when motion is reduced (play() is gated above). */}
      <video
        ref={videoRef}
        className="scene-video"
        muted
        loop
        playsInline
        poster="/farm.jpg"
        aria-hidden="true"
      >
        <source src="/farm.mp4" type="video/mp4" />
      </video>

      {/* Scrim keeps the hero text readable over the video */}
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner" inert={showLogin}>
        <div className="hero__badge">
          <img className="hero__logo" src="/logo.png" alt="FarmersHub logo" />
        </div>
        <h1 className="hero__title">FarmersHub</h1>
        <p className="hero__tagline">
          Fresh from the farm to your hands — connecting growers and buyers,
          directly.
        </p>
        <button
          ref={ctaRef}
          className="hero__cta"
          type="button"
          onClick={() => setView("login")}
        >
          Get Started
        </button>
      </div>

      <Login active={showLogin} onBack={() => setView("hero")} />
    </main>
  );
}
