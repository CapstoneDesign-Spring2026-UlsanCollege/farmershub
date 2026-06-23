/* ==========================================================================
   FarmersHub v2 — intro animation
   Builds a full-screen overlay on load: logo badge (shine sweep + glow pulse)
   and a letter-by-letter "FarmersHub" wordmark. After ~3s it fades out and
   reveals the hero underneath. Inspired by the v1 intro, rebuilt cleaner.
   ========================================================================== */

(function () {
  "use strict";

  var WORDMARK = "FarmersHub";

  // Timings (kept in sync with the CSS variables in style.css)
  var LETTER_STAGGER = 45; // ms between letters
  var LETTER_DURATION = 500; // ms per-letter animation
  var GLOW_CAP = 1600; // glow fires by this point at the latest
  var EXIT_START = 2600; // overlay begins fading
  var TOTAL = 3000; // overlay fully gone / hero revealed

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Build the staggered letter spans; returns when the last letter finishes. */
  function buildLetters(container, text) {
    var delay = 0;
    Array.prototype.forEach.call(text, function (ch) {
      var span = document.createElement("span");
      var isSpace = ch === " ";
      span.className =
        "intro__letter" + (isSpace ? " intro__letter--space" : "");
      span.textContent = isSpace ? " " : ch;
      span.style.animationDelay = delay + "ms";
      container.appendChild(span);
      delay += LETTER_STAGGER;
    });
    return delay + LETTER_DURATION;
  }

  /** Assemble the overlay DOM. */
  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "intro";
    overlay.setAttribute("aria-hidden", "true");

    var badge = document.createElement("div");
    badge.className = "intro__badge";

    var logo = document.createElement("img");
    logo.className = "intro__logo";
    logo.src = "logo.png";
    logo.alt = "";

    var sweep = document.createElement("div");
    sweep.className = "intro__sweep";

    badge.appendChild(logo);
    badge.appendChild(sweep);

    var word = document.createElement("div");
    word.className = "intro__word";
    var letterRevealMs = buildLetters(word, WORDMARK);

    overlay.appendChild(badge);
    overlay.appendChild(word);

    return { overlay: overlay, badge: badge, letterRevealMs: letterRevealMs };
  }

  function play() {
    var parts = buildOverlay();
    // The overlay (z-index 9999) sits on top of the hero, so the hero stays
    // hidden behind it until the overlay fades out — revealing it smoothly.
    document.body.appendChild(parts.overlay);

    // Glow + sweep once the word is (about) revealed, capped so it never drags.
    var glowAt = Math.min(parts.letterRevealMs, GLOW_CAP);
    setTimeout(function () {
      parts.badge.classList.add("is-glowing");
    }, glowAt);

    setTimeout(function () {
      parts.overlay.classList.add("is-exiting");
    }, EXIT_START);

    setTimeout(function () {
      parts.overlay.remove();
    }, TOTAL);
  }

  /* Start the looping background video — but only when motion is allowed.
     With reduced motion it stays paused, showing its poster image. */
  function startScene() {
    var video = document.querySelector(".scene-video");
    if (!video || prefersReducedMotion) return;
    var attempt = video.play();
    // Ignore autoplay rejections (e.g. very strict policies) — poster remains.
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  function init() {
    startScene();
    // Reduced motion: skip the intro entirely — the hero is already visible.
    if (prefersReducedMotion) return;
    play();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
