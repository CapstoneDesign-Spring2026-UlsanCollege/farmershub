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

/* ==========================================================================
   FarmersHub v2 — login view toggle (UI only)
   "Get Started" reveals a frosted login card over the same, still-playing
   video; "← Back" returns to the hero. No auth, no validation, no requests —
   just show/hide wiring plus a visual password show/hide toggle.
   ========================================================================== */

(function () {
  "use strict";

  var hero = document.getElementById("hero");
  var cta = document.getElementById("getStarted");
  var login = document.getElementById("login");
  var back = document.getElementById("loginBack");
  if (!hero || !cta || !login || !back) return;

  var inner = hero.querySelector(".hero__inner");
  var emailInput = document.getElementById("email");
  var supportsInert = "inert" in HTMLElement.prototype;

  function showLogin() {
    hero.classList.add("show-login");
    login.setAttribute("aria-hidden", "false");
    // Take the (now hidden) hero content out of the tab order.
    if (inner && supportsInert) inner.inert = true;
    // Drop focus into the form for keyboard users, after the transition starts.
    if (emailInput) {
      window.setTimeout(function () {
        emailInput.focus();
      }, 60);
    }
  }

  function showHero() {
    hero.classList.remove("show-login");
    login.setAttribute("aria-hidden", "true");
    if (inner && supportsInert) inner.inert = false;
    cta.focus();
  }

  cta.addEventListener("click", showLogin);
  back.addEventListener("click", showHero);

  // Esc returns to the hero while the login view is open.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && hero.classList.contains("show-login")) {
      showHero();
    }
  });

  // Password show/hide — a UI convenience only; nothing leaves the page.
  var pw = document.getElementById("password");
  var eye = document.getElementById("togglePw");
  if (pw && eye) {
    eye.addEventListener("click", function () {
      var show = pw.type === "password";
      pw.type = show ? "text" : "password";
      eye.classList.toggle("is-on", show);
      eye.setAttribute("aria-pressed", String(show));
      eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  }

  // The form is decorative — it never submits or navigates anywhere.
  var form = login.querySelector(".login__card");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
})();
