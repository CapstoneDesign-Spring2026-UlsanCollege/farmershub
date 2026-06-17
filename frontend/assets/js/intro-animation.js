(function () {
  // Capture immediately — document.currentScript is only valid during sync execution
  var _scriptSrc = (document.currentScript && document.currentScript.src) ||
    (function () {
      var s = document.querySelector('script[src*="intro-animation.js"]');
      return s ? s.src : '';
    })();

  function resolveAssetPath(path) {
    if (!_scriptSrc) return path;
    var base = _scriptSrc.replace(/assets\/js\/intro-animation\.js.*$/, '');
    return new URL(path, base).href;
  }

  function ensureStylesheet() {
    var existing = document.getElementById('fh-intro-styles');
    if (existing) {
      return existing.dataset.loaded === 'true' ? Promise.resolve() : new Promise(function (resolve) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', resolve, { once: true });
        // Long timeout fallback only — prefer event
        setTimeout(resolve, 1000);
      });
    }
    return new Promise(function (resolve) {
      var link = document.createElement('link');
      link.id = 'fh-intro-styles';
      link.rel = 'stylesheet';
      link.href = resolveAssetPath('assets/css/intro-animation.css');
      link.addEventListener('load', function () {
        link.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      link.addEventListener('error', resolve, { once: true });
      document.head.appendChild(link);
      // Fallback in case browser fires neither event (very unlikely, but safe)
      setTimeout(resolve, 1000);
    });
  }

  function buildLetters(container, text) {
    var delay = 0;
    var step = 45;
    Array.prototype.forEach.call(text, function (ch) {
      var span = document.createElement('span');
      span.className = 'fh-intro-letter' + (ch === ' ' ? ' fh-intro-space' : '');
      span.textContent = ch === ' ' ? ' ' : ch;
      span.style.animationDelay = delay + 'ms';
      container.appendChild(span);
      delay += step;
    });
    return delay;
  }

  function play(options) {
    options = options || {};
    var logoSrc = options.logoSrc || 'logo.png';
    var text = options.text || 'FarmersHub';
    var nextUrl = options.nextUrl;
    var navigate = typeof options.navigate === 'function' ? options.navigate : function () {
      if (nextUrl) window.location.href = nextUrl;
    };

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      navigate();
      return;
    }

    ensureStylesheet().then(function () {
      var overlay = document.createElement('div');
      overlay.className = 'fh-intro-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      var logoWrap = document.createElement('div');
      logoWrap.className = 'fh-intro-logo-wrap';

      var logo = document.createElement('img');
      logo.className = 'fh-intro-logo';
      logo.src = logoSrc;
      logo.alt = '';

      var sweep = document.createElement('div');
      sweep.className = 'fh-intro-sweep';

      logoWrap.appendChild(logo);
      logoWrap.appendChild(sweep);

      var textWrap = document.createElement('div');
      textWrap.className = 'fh-intro-text';
      var letterDuration = buildLetters(textWrap, text);

      overlay.appendChild(logoWrap);
      overlay.appendChild(textWrap);
      document.body.appendChild(overlay);

      var textRevealMs = letterDuration + 500;
      var glowStart = Math.min(textRevealMs, 1600);
      var exitStart = 2600;
      var totalDuration = 3000;

      setTimeout(function () {
        logoWrap.classList.add('fh-intro-glow');
      }, glowStart);

      setTimeout(function () {
        overlay.classList.add('fh-intro-exit');
      }, exitStart);

      setTimeout(function () {
        overlay.remove();
        navigate();
      }, totalDuration);
    });
  }

  window.FarmersHubIntro = { play: play };
})();
