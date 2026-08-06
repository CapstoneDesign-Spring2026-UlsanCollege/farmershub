/* ==========================================================================
   FarmersHub — shovel cursor
   Pairs with shovel-cursor.css. Drop both into a page and it self-installs.

   The tip of the blade is the hotspot. The tool chases the pointer through
   two lerps, so it arrives without a hard stop, and leans into whichever way
   it is travelling. Holding the mouse down loads the blade with soil and
   drops a heap under the tip.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.matchMedia || !matchMedia('(pointer:fine)').matches) return;

  var HOT_X = 14.9, HOT_Y = 84.2;   // blade tip, in element pixels
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- artwork ------------------------------------------------- */
  /* Drawn upright, then swung to 38° so the blade points down-left.
     Shared <defs> live in the tool svg; the soil layers reuse them. */
  var MARKUP = [

    /* ---- heap under the tip. Stays level; never rotates with the tool. ---- */
    '<svg class="fh-pile" viewBox="0 0 78 34" xmlns="http://www.w3.org/2000/svg">',
      '<defs>',
        '<linearGradient id="fhSoil" x1=".2" y1="0" x2=".5" y2="1">',
          '<stop offset="0" stop-color="#A87C52"/>',
          '<stop offset=".42" stop-color="#7B5537"/>',
          '<stop offset="1" stop-color="#4A2F1E"/>',
        '</linearGradient>',
      '</defs>',
      '<path d="M5 28C8 22.5 13 20 19 19.4c4-.4 6.5 1.4 10.5 1 4-.4 6-2.6 10-2.6 4 0 6.4 2.2 10.4 3',
            ' 4.4.9 9 2.4 11.6 4.6 2.8 2.4 1 5.6-4 5.6H11C5.4 31 3.6 30 5 28Z" fill="url(#fhSoil)"/>',
      '<path d="M12 26c3-3 7-4.6 12-4.8 3 0 5 1.4 8 1.4" fill="none" stroke="#C89C70"',
            ' stroke-width="1.3" stroke-linecap="round" opacity=".4"/>',
      '<g fill="#31200F" opacity=".5">',
        '<circle cx="18" cy="27" r="1.2"/><circle cx="29" cy="24.5" r=".9"/><circle cx="40" cy="28" r="1.3"/>',
        '<circle cx="50" cy="25" r="1"/><circle cx="60" cy="28.5" r="1.2"/><circle cx="34" cy="22" r=".85"/>',
        '<circle cx="46" cy="21.5" r="1"/><circle cx="24" cy="22" r=".85"/>',
      '</g>',
      '<circle class="fh-crumb" style="--dx:-13px;--dy:-18px" cx="21" cy="19" r="1.9" fill="#6A472C"/>',
      '<circle class="fh-crumb" style="--dx:-5px;--dy:-23px"  cx="33" cy="17" r="1.5" fill="#835B39"/>',
      '<circle class="fh-crumb" style="--dx:7px;--dy:-21px"   cx="45" cy="17.5" r="2.1" fill="#5C3D26"/>',
      '<circle class="fh-crumb" style="--dx:15px;--dy:-15px"  cx="56" cy="20" r="1.6" fill="#7A5334"/>',
      '<circle class="fh-crumb" style="--dx:-19px;--dy:-10px" cx="13" cy="22" r="1.3" fill="#8A6440"/>',
    '</svg>',

    '<div class="fh-tool">',

      /* ---- the trowel. Drawn upright, then swung 38° so it points down-left. ---- */
      '<svg class="fh-tool-svg" viewBox="0 0 108 120" xmlns="http://www.w3.org/2000/svg">',
        '<defs>',
          '<linearGradient id="fhWood" x1="0" y1="0" x2="1" y2="0">',
            '<stop offset="0" stop-color="#54300F"/>',
            '<stop offset=".26" stop-color="#8A5730"/>',
            '<stop offset=".5" stop-color="#B27E4B"/>',
            '<stop offset=".78" stop-color="#7C4A26"/>',
            '<stop offset="1" stop-color="#492A12"/>',
          '</linearGradient>',
          '<linearGradient id="fhTang" x1="0" y1="0" x2="1" y2="0">',
            '<stop offset="0" stop-color="#C7A170"/>',
            '<stop offset=".36" stop-color="#F4E1C0"/>',
            '<stop offset="1" stop-color="#B58B58"/>',
          '</linearGradient>',
          '<linearGradient id="fhFerrule" x1="0" y1="0" x2="1" y2="0">',
            '<stop offset="0" stop-color="#69727B"/>',
            '<stop offset=".32" stop-color="#D6DCE1"/>',
            '<stop offset=".68" stop-color="#8B949C"/>',
            '<stop offset="1" stop-color="#5A626A"/>',
          '</linearGradient>',
          '<linearGradient id="fhSteel" x1=".15" y1="0" x2=".85" y2="1">',
            '<stop offset="0" stop-color="#59626C"/>',
            '<stop offset=".5" stop-color="#8A939D"/>',
            '<stop offset="1" stop-color="#BAC4CD"/>',
          '</linearGradient>',
          /* soft light and shade, so nothing echoes the silhouette */
          '<radialGradient id="fhShine" cx=".7" cy=".7" r=".55">',
            '<stop offset="0" stop-color="#fff" stop-opacity=".62"/>',
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/>',
          '</radialGradient>',
          '<radialGradient id="fhShade" cx=".2" cy=".28" r=".62">',
            '<stop offset="0" stop-color="#2E3740" stop-opacity=".45"/>',
            '<stop offset="1" stop-color="#2E3740" stop-opacity="0"/>',
          '</radialGradient>',
          '<clipPath id="fhBladeClip">',
            '<path d="M0 41C-4.5 33-9.5 23-13.8 13.5-18.2 6.5-21.4 0-22.2-6',
                   '-23-12-19.6-15.2-14-15-5-14.2 5-14.2 14-15',
                   ' 19.6-15.2 23-12 22.2-6 21.4 0 18.2 6.5 13.8 13.5 9.5 23 4.5 33 0 41Z"/>',
          '</clipPath>',
          '<clipPath id="fhScoopClip">',
            '<path d="M0 36.7C-3.9 29.8-8.2 21.2-11.9 13-15.7 7-18.4 1.4-19.1-3.8',
                   '-19.8-8.9-16.9-11.7-12-11.5-4.3-10.8 4.3-10.8 12-11.5',
                   ' 16.9-11.7 19.8-8.9 19.1-3.8 18.4 1.4 15.7 7 11.9 13',
                   ' 8.2 21.2 3.9 29.8 0 36.7Z"/>',
          '</clipPath>',
        '</defs>',

        '<g transform="translate(44 73) rotate(38)">',

          /* white halo sits under the fill, so the edge stays clean */
          '<path d="M0 41C-4.5 33-9.5 23-13.8 13.5-18.2 6.5-21.4 0-22.2-6',
                 '-23-12-19.6-15.2-14-15-5-14.2 5-14.2 14-15',
                 ' 19.6-15.2 23-12 22.2-6 21.4 0 18.2 6.5 13.8 13.5 9.5 23 4.5 33 0 41Z"',
                ' fill="#fff" stroke="#fff" stroke-width="2.7" stroke-linejoin="round"/>',

          '<g clip-path="url(#fhBladeClip)">',
            '<rect x="-22.6" y="-15" width="45.2" height="56" fill="url(#fhSteel)"/>',
            '<rect x="-22.6" y="-15" width="45.2" height="56" fill="url(#fhShade)"/>',
            '<rect x="-22.6" y="-15" width="45.2" height="56" fill="url(#fhShine)"/>',
            /* raised rim: the outline stepped inward, so it reads as a scoop */
            '<path d="M0 36.7C-3.9 29.8-8.2 21.2-11.9 13-15.7 7-18.4 1.4-19.1-3.8',
                   '-19.8-8.9-16.9-11.7-12-11.5-4.3-10.8 4.3-10.8 12-11.5',
                   ' 16.9-11.7 19.8-8.9 19.1-3.8 18.4 1.4 15.7 7 11.9 13',
                   ' 8.2 21.2 3.9 29.8 0 36.7" fill="none" stroke="#E4EBF1" stroke-width="1.5" opacity=".35"/>',
          '</g>',

          '<path d="M0 41C-4.5 33-9.5 23-13.8 13.5-18.2 6.5-21.4 0-22.2-6',
                 '-23-12-19.6-15.2-14-15-5-14.2 5-14.2 14-15',
                 ' 19.6-15.2 23-12 22.2-6 21.4 0 18.2 6.5 13.8 13.5 9.5 23 4.5 33 0 41Z"',
                ' fill="none" stroke="#2C343E" stroke-width=".9" opacity=".35"/>',

          /* tang running down the blade */
          '<path d="M-5.6-22h11.2l-2 43c0 3.8-7.2 3.8-7.2 0Z"',
                ' fill="url(#fhTang)" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>',
          '<path d="M1.4-19 1 20" fill="none" stroke="#A87F50" stroke-width=".9" opacity=".4"/>',

          /* ferrule */
          '<rect x="-8" y="-31" width="16" height="11" rx="2.7"',
                ' fill="url(#fhFerrule)" stroke="#fff" stroke-width="1.3"/>',
          '<rect x="-4.6" y="-29" width="2.6" height="7" rx="1.3" fill="#fff" opacity=".7"/>',

          /* wooden handle */
          '<path d="M-6.6-66.5C-6.6-71.8-3.5-74.5 0-74.5s6.6 2.7 6.6 8L5.6-31H-5.6Z"',
                ' fill="url(#fhWood)" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>',
          '<path d="M-2.5-70.5c-1 12-.8 26-.2 38" fill="none" stroke="#43250F" stroke-width=".9" opacity=".4"/>',
          '<path d="M2.7-71c-.8 12-.4 26 .2 38" fill="none" stroke="#43250F" stroke-width=".8" opacity=".28"/>',
          '<path d="M-.4-70.5c-.8 12-.6 26 0 38" fill="none" stroke="#DDA96C" stroke-width="1.5" opacity=".45"/>',
          '<ellipse cx="3.3" cy="-63.5" rx="1.5" ry="2.1" fill="#43250F" opacity=".55"/>',
        '</g>',
      '</svg>',

      /* ---- soil loaded into the blade ---- */
      '<svg class="fh-load" viewBox="0 0 108 120" xmlns="http://www.w3.org/2000/svg">',
        '<g transform="translate(44 73) rotate(38)">',
          '<g clip-path="url(#fhScoopClip)">',
            '<path d="M-19-9C-12-13 12-13 19-9 20-1 13 14 5 24 2.5 27-2.5 27-5 24-13 14-20-1-19-9Z"',
                  ' fill="url(#fhSoil)"/>',
            '<path d="M-11-6.5c4-2.6 11-3 16-.4" fill="none" stroke="#C89C70" stroke-width="1.8"',
                  ' stroke-linecap="round" opacity=".45"/>',
            '<g fill="#2E1E0E" opacity=".42">',
              '<circle cx="-8" cy="-1" r="1.5"/><circle cx="2" cy="-5" r="1.2"/><circle cx="9" cy="3" r="1.5"/>',
              '<circle cx="-2" cy="7" r="1.3"/><circle cx="4" cy="14" r="1.1"/><circle cx="-9" cy="9" r="1"/>',
              '<circle cx="-1" cy="19" r="1"/>',
            '</g>',
          '</g>',
          '<circle cx="-15" cy="-9" r="2" fill="#6A472C"/>',
          '<circle cx="14" cy="-7.5" r="1.6" fill="#7A5334"/>',
        '</g>',
      '</svg>',

    '</div>'
  ].join('');

  /* ---------- install -------------------------------------------------- */
  var host = document.createElement('div');
  host.id = 'fh-cursor';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = MARKUP;

  var tool, px, py, cx, cy, aim = 0, ang = 0, press = 0, want = 0, shown = false;

  function isTextField(el) {
    return !!(el && el.closest && el.closest('input,textarea,select,[contenteditable="true"]'));
  }

  function show(on) {
    if (on === shown) return;
    shown = on;
    host.classList.toggle('fh-on', on);
  }

  function onMove(e) {
    px = e.clientX; py = e.clientY;
    show(!isTextField(e.target));
  }

  function onDown(e) {
    if (e.button !== 0) return;
    want = 1;
    /* restart the crumb animation on every press */
    host.classList.remove('fh-dig');
    void host.offsetWidth;
    host.classList.add('fh-dig');
  }

  function onUp(e) {
    if (e.button !== 0) return;
    want = 0;
    host.classList.remove('fh-dig');
  }

  var last = 0;
  function frame(now) {
    var dt = last ? Math.min(now - last, 64) : 16.7;
    last = now;

    /* frame-rate independent lerp: k is the pull per 60fps frame */
    var ease = function (k) { return 1 - Math.pow(1 - k, dt / 16.667); };

    if (reduce) {
      cx = px; cy = py; ang = 0; press = want;
    } else {
      cx += (px - cx) * ease(.19);
      cy += (py - cy) * ease(.19);

      /* how far the tip is trailing the pointer *is* the velocity — lean into it */
      var lead = Math.max(-17, Math.min(17, (px - cx) * .75));
      aim += (lead - aim) * ease(.22);
      ang += (aim - ang) * ease(.14);       /* second lerp = the buttery part */

      press += (want - press) * ease(.32);
    }

    host.style.transform = 'translate3d(' + (cx - HOT_X) + 'px,' + (cy - HOT_Y) + 'px,0)';
    tool.style.transform = 'rotate(' + (ang + press * 7) + 'deg) scale(' + (1 - press * .12) + ')';

    requestAnimationFrame(frame);
  }

  function start() {
    document.body.appendChild(host);
    document.documentElement.classList.add('fh-shovel');
    tool = host.querySelector('.fh-tool');

    px = cx = innerWidth / 2;
    py = cy = innerHeight / 2;

    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('mousedown', onDown, { passive: true });
    addEventListener('mouseup', onUp, { passive: true });
    addEventListener('blur', function () { want = 0; host.classList.remove('fh-dig'); });
    document.addEventListener('mouseleave', function () { show(false); });

    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
