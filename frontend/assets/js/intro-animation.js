(function () {
  function ensureStylesheet() {
    var existing = document.getElementById('fh-intro-styles');
    if (existing) {
      return existing.dataset.loaded === 'true' ? Promise.resolve() : new Promise(function (resolve) {
        existing.addEventListener('load', resolve, { once: true });
        setTimeout(resolve, 200);
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
      setTimeout(resolve, 200);
    });
  }

  function resolveAssetPath(path) {
    var script = document.currentScript || document.querySelector('script[src*="intro-animation.js"]');
    if (!script) return path;
    return new URL(path, script.src.replace(/assets\/js\/intro-animation\.js.*$/, '')).href;
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
