// Draws the player's avatar as an SVG, layer by layer.
// Head is drawn centred at (100, 72) with radius 38 inside a 200-wide canvas.
// On the full body it's scaled down about the neck for grown-up proportions.
(function () {
  const BODY_VIEW = '0 14 200 262';
  const HEAD_VIEW = '36 -16 128 128';
  const HEAD_SCALE = 'translate(100 106) scale(.8) translate(-100 -106)';
  const INK = '#1f2227';

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = v => Math.max(0, Math.min(255, v));
    const r = c((n >> 16) + amt), g = c(((n >> 8) & 255) + amt), b = c((n & 255) + amt);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  const logo = (x, y, s) =>
    `<circle cx="${x}" cy="${y}" r="${14 * s}" fill="#d9434a"/><circle cx="${x}" cy="${y}" r="${10 * s}" fill="#ececec"/>` +
    `<circle cx="${x}" cy="${y}" r="${6 * s}" fill="#d9434a"/><circle cx="${x}" cy="${y}" r="${2.5 * s}" fill="#ececec"/>`;

  // ---------- Hair ----------
  const SHORT_FRONT = c => `<path d="M61 72 Q58 30 100 30 Q142 30 139 72 Q132 50 100 47 Q70 50 61 72Z" fill="${c}"/>`;
  const HAIR = {
    bald: { front: c => `<path d="M63 62 Q66 34 100 33 Q134 34 137 62 Q120 44 100 44 Q80 44 63 62Z" fill="${c}" opacity=".35"/>` },
    short: { front: SHORT_FRONT },
    long: {
      back: c => `<path d="M58 70 Q56 26 100 26 Q144 26 142 70 L146 150 Q100 160 54 150Z" fill="${c}"/>`,
      front: c => `<path d="M60 80 Q57 28 100 28 Q143 28 140 80 Q135 54 114 46 Q98 60 70 56 Q63 66 60 80Z" fill="${c}"/>`,
    },
    curly: {
      front: c => [[64, 62, 10], [68, 47, 11], [80, 37, 12], [100, 33, 13], [120, 37, 12], [132, 47, 11], [136, 62, 10]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join(''),
    },
    ponytail: {
      back: c => `<path d="M126 42 Q170 46 160 120 Q154 96 138 80Z" fill="${c}"/>`,
      front: c => SHORT_FRONT(c) + `<circle cx="134" cy="46" r="4" fill="${shade(c, -25)}"/>`,
    },
    spiky: {
      front: c => `<path d="M62 68 L60 44 L72 50 L76 30 L88 42 L100 26 L112 42 L124 30 L128 50 L140 44 L138 68 Q128 50 100 50 Q72 50 62 68Z" fill="${c}"/>`,
    },
    buns: {
      back: c => `<circle cx="100" cy="24" r="14" fill="${c}"/>`,
      front: c => SHORT_FRONT(c) + `<rect x="92" y="33" width="16" height="4" rx="2" fill="${shade(c, -25)}"/>`,
    },
    afro: {
      back: c => `<circle cx="100" cy="62" r="52" fill="${c}"/>`,
      front: c => `<path d="M64 64 Q64 36 100 36 Q136 36 136 64 Q120 50 100 50 Q80 50 64 64Z" fill="${c}"/>`,
    },
    mohawk: {
      front: c => `<path d="M91 46 L88 12 Q100 4 112 12 L109 46 Q100 40 91 46Z" fill="${c}"/>` +
        `<path d="M63 64 Q66 38 88 36 L90 46 Q72 50 63 64Z M137 64 Q134 38 112 36 L110 46 Q128 50 137 64Z" fill="${c}" opacity=".35"/>`,
    },
  };

  // ---------- Faces ----------
  const eye = (x, r) => `<ellipse cx="${x}" cy="71" rx="${r || 3.6}" ry="${(r || 3.6) * 0.85}" fill="#1a1a1a"/>`;
  const line = (d, w) => `<path d="${d}" stroke="#1a1a1a" stroke-width="${w || 2.5}" fill="none" stroke-linecap="round"/>`;
  const BROWS = line('M79 61 Q86 58 93 61', 2.8) + line('M107 61 Q114 58 121 61', 2.8);
  const EYES = eye(86) + eye(114);
  const SMILE = line('M91 88 Q100 93 109 88');
  const FACES = {
    smile: () => EYES + BROWS + SMILE,
    grin: () => EYES + BROWS + `<path d="M89 86 Q100 98 111 86Z" fill="#4a1c1c"/><path d="M90 86.5 L110 86.5 L108.5 89.5 L91.5 89.5Z" fill="#f4f4f4"/>`,
    surprised: () => eye(86, 4.2) + eye(114, 4.2) + line('M79 57 Q86 53 93 57', 2.8) + line('M107 57 Q114 53 121 57', 2.8) +
      `<ellipse cx="100" cy="91" rx="3.5" ry="5" fill="#4a1c1c"/>`,
    wink: () => eye(86) + line('M109 72 Q114 68 119 72') + BROWS + SMILE,
    cool: () => line('M81 72 L91 72', 3) + line('M109 72 L119 72', 3) + line('M79 63 L93 62', 2.8) + line('M107 62 L121 63', 2.8) +
      line('M91 89 Q102 92 110 86'),
    tongue: () => EYES + line('M79 61 Q86 58 93 61', 2.8) + line('M107 59 Q114 54 121 58', 2.8) + line('M90 89 Q102 91 111 84'),
    angry: () => EYES + line('M79 59 L93 64', 3) + line('M121 59 L107 64', 3) + line('M92 90 L108 90'),
  };

  // ---------- Outfits ----------
  // sleeve: 'short' | 'long' | 'none'. pants: colour, or null for bare legs.
  const OUTFITS = {
    tee:      { top: '#2b2f36', sleeve: 'short', pants: '#1f2329', shoes: '#111', extra: () => logo(100, 150, 0.8) },
    dress:    { top: '#3f5e6e', sleeve: 'short', pants: null, shoes: '#262626',
                skirt: c => `<path d="M66 172 L134 172 L150 236 Q100 246 50 236Z" fill="${c}"/><rect x="64" y="168" width="72" height="7" rx="3" fill="${shade(c, -30)}"/>` },
    striped:  { top: '#efebe2', sleeve: 'long', pants: '#2c3e50', shoes: '#222',
                extra: () => [126, 140, 154, 168, 182, 196].map(y => `<rect x="63" y="${y}" width="74" height="5" fill="#1f3a5f"/>`).join('') },
    hoodie:   { top: '#4b5563', sleeve: 'long', pants: '#23272e', shoes: '#e5e5e5',
                extra: c => `<path d="M76 114 Q100 134 124 114 Q120 106 100 108 Q80 106 76 114Z" fill="${shade(c, -25)}"/>` +
                  `<path d="M78 172 L122 172 L128 198 L72 198Z" fill="${shade(c, -18)}"/>` +
                  `<path d="M92 122 L90 146 M108 122 L110 146" stroke="#d0d0d0" stroke-width="2" stroke-linecap="round"/>` },
    overalls: { top: '#556043', sleeve: 'long', pants: '#2b2f36', shoes: '#3b2a1e',
                extra: c => `<path d="M100 116 L100 204" stroke="${shade(c, -30)}" stroke-width="2"/>` +
                  `<rect x="72" y="140" width="18" height="14" rx="2" fill="${shade(c, -15)}" stroke="${shade(c, -30)}"/>` +
                  `<rect x="110" y="140" width="18" height="14" rx="2" fill="${shade(c, -15)}" stroke="${shade(c, -30)}"/>` +
                  `<path d="M82 113 L100 126 L118 113" stroke="${shade(c, -30)}" stroke-width="4" fill="none" stroke-linejoin="round"/>` },
    jersey:   { top: '#7d3530', sleeve: 'none', pants: '#23272e', shoes: '#e5e5e5',
                extra: () => `<text x="100" y="178" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="#ececec" text-anchor="middle">10</text>` },
    suit:     { top: '#262a31', sleeve: 'long', pants: '#262a31', shoes: '#0d0d0d',
                extra: () => `<path d="M86 113 L100 144 L114 113Z" fill="#f2f2f2"/><path d="M100 118 L95 125 L100 162 L105 125Z" fill="#6e1d24"/>` +
                  `<path d="M86 113 L96 150 L90 152 L78 118Z M114 113 L104 150 L110 152 L122 118Z" fill="#1c1f25"/>` },
    gown:     { top: '#4a2340', sleeve: 'none', pants: null, shoes: '#2a1426',
                skirt: c => `<path d="M64 168 L136 168 L164 266 Q100 278 36 266Z" fill="${c}"/><path d="M100 172 Q106 220 124 266" stroke="${shade(c, -20)}" stroke-width="2" fill="none"/>` },
    hero:     { top: '#1c1c1e', sleeve: 'long', pants: '#2d3a4a', shoes: '#111',
                extra: () => `<path d="M88 114 L100 152 L112 114Z" fill="#e8e8e8"/>` +
                  `<path d="M86 113 L97 152 L91 154 L78 118Z M114 113 L103 152 L109 154 L122 118Z" fill="#2c2c2f"/>` +
                  `<path d="M70 172 L130 172" stroke="#2c2c2f" stroke-width="4"/><circle cx="126" cy="132" r="1.5" fill="#888"/>` },
    space:    { top: '#6b705c', sleeve: 'long', pants: '#6b705c', shoes: '#2b2b2b',
                extra: () => `<path d="M100 116 L100 204" stroke="#4e5243" stroke-width="2.5"/>` +
                  `<rect x="72" y="134" width="20" height="8" rx="1" fill="#4e5243"/><rect x="110" y="150" width="18" height="16" rx="2" fill="#4e5243"/>` +
                  logo(82, 138, 0.3) },
  };

  // ---------- Hats ----------
  const HATS = {
    none: () => '',
    headband: () => `<path d="M62 58 Q100 34 138 58" stroke="#2b2f36" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    party: () => `<path d="M72 46 Q70 16 100 18 Q130 16 128 46Z" fill="#4a505a"/><path d="M88 21 Q100 27 112 21" stroke="#3a3f47" stroke-width="3" fill="none"/>` +
      `<rect x="72" y="37" width="56" height="7" fill="#1f2227"/><path d="M60 46 Q100 38 140 46 Q138 53 100 50 Q62 53 60 46Z" fill="#3a3f47"/>`,
    cap: () => `<path d="M61 60 Q61 22 100 22 Q139 22 139 60Z" fill="#2b2f36"/><path d="M56 58 Q100 50 152 58 Q148 67 100 64 Q70 64 56 62Z" fill="#1c1f24"/><circle cx="100" cy="23" r="3.5" fill="#1c1f24"/>` + logo(100, 42, 0.45),
    beanie: () => `<path d="M60 62 Q60 18 100 18 Q140 18 140 62Z" fill="#3d4b5c"/><rect x="57" y="52" width="86" height="13" rx="6" fill="#2e3947"/>` +
      [72, 84, 96, 108, 120].map(x => `<path d="M${x} 53 L${x} 64" stroke="#27313d" stroke-width="2"/>`).join(''),
    cowboy: () => `<ellipse cx="100" cy="46" rx="60" ry="10" fill="#6b4226"/><path d="M72 46 Q70 10 100 16 Q130 10 128 46Z" fill="#7d4f2f"/><rect x="72" y="36" width="56" height="6" fill="#3d2414"/>`,
    wizard: () => `<ellipse cx="100" cy="46" rx="56" ry="9" fill="#4b3a2c"/><path d="M70 46 Q68 8 100 12 Q132 8 130 46Z" fill="#5b4636"/>` +
      `<path d="M86 14 Q100 22 114 14" stroke="#4b3a2c" stroke-width="3" fill="none"/><rect x="70" y="35" width="60" height="8" fill="#1a1512"/>`,
    crown: () => `<path d="M66 50 L64 18 L82 32 L100 10 L118 32 L136 18 L134 50Z" fill="#c9a236" stroke="#9a7a22" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle cx="100" cy="38" r="4.5" fill="#7a1f2b"/><circle cx="80" cy="41" r="3" fill="#1f3a5f"/><circle cx="120" cy="41" r="3" fill="#1f5f4a"/>`,
  };

  // ---------- Accessories ----------
  const ACCESSORIES = {
    none: () => '',
    glasses: () => `<g fill="rgba(255,255,255,.15)" stroke="${INK}" stroke-width="2.5"><rect x="76" y="63" width="20" height="15" rx="4"/><rect x="104" y="63" width="20" height="15" rx="4"/></g>` +
      `<path d="M96 69 L104 69 M76 68 L63 66 M124 68 L137 66" stroke="${INK}" stroke-width="2.5"/>`,
    mustache: () => `<path d="M100 83 Q91 77 82 82 Q88 88 100 85.5 Q112 88 118 82 Q109 77 100 83Z" fill="#3a2416"/>`,
    eyepatch: () => `<path d="M62 60 L138 82" stroke="#111" stroke-width="2.5"/><ellipse cx="114" cy="71" rx="10" ry="9" fill="#111"/>`,
    sunglasses: () => `<rect x="73" y="63" width="24" height="14" rx="5" fill="#111"/><rect x="103" y="63" width="24" height="14" rx="5" fill="#111"/>` +
      `<path d="M97 67 L103 67 M73 66 L62 64 M127 66 L138 64" stroke="#111" stroke-width="3"/><path d="M78 67 L84 67 M108 67 L114 67" stroke="#fff" stroke-width="1.5" opacity=".35"/>`,
    headphones: () => `<path d="M60 74 Q58 22 100 22 Q142 22 140 74" stroke="${INK}" stroke-width="6" fill="none"/>` +
      `<rect x="50" y="60" width="15" height="28" rx="7" fill="#2b2f36"/><rect x="135" y="60" width="15" height="28" rx="7" fill="#2b2f36"/>` +
      `<rect x="53" y="66" width="3" height="16" rx="1.5" fill="#d9434a"/><rect x="144" y="66" width="3" height="16" rx="1.5" fill="#d9434a"/>`,
  };

  function colorOf(cat, id, fallback) {
    const item = BB.findItem(cat, id);
    return (item && item.color) || fallback;
  }

  function arm(side, sleeve, top, skin) {
    const m = x => (side < 0 ? x : 200 - x);
    const upper = sleeve === 'none' ? skin : top;
    const lower = sleeve === 'long' ? top : skin;
    return `<path d="M${m(67)} 122 L${m(58)} 162" stroke="${upper}" stroke-width="${sleeve === 'none' ? 12 : 16}" stroke-linecap="round"/>` +
      `<path d="M${m(58)} 162 L${m(54)} 196" stroke="${lower}" stroke-width="${sleeve === 'long' ? 14 : 12}" stroke-linecap="round"/>` +
      `<circle cx="${m(54)}" cy="201" r="7" fill="${skin}"/>`;
  }

  // Returns an SVG string. opts.head = true draws only the head (used on trick bullseyes and shop cards).
  BB.renderAvatar = function (a, opts) {
    opts = opts || {};
    const skin = colorOf('skin', a.skin, '#e2b98f');
    const hairC = colorOf('hairColor', a.hairColor, '#1b1b1b');
    const hair = HAIR[a.hair] || {};
    const o = OUTFITS[a.outfit] || OUTFITS.tee;
    const headGroup = inner => (opts.head ? inner : `<g transform="${HEAD_SCALE}">${inner}</g>`);
    const parts = [];

    if (hair.back) parts.push(headGroup(hair.back(hairC)));

    if (!opts.head) {
      if (o.pants) {
        parts.push(`<rect x="72" y="198" width="25" height="70" rx="6" fill="${o.pants}"/><rect x="103" y="198" width="25" height="70" rx="6" fill="${o.pants}"/>`);
      } else {
        parts.push(`<rect x="77" y="198" width="17" height="70" rx="6" fill="${skin}"/><rect x="106" y="198" width="17" height="70" rx="6" fill="${skin}"/>`);
      }
      parts.push(`<path d="M70 266 Q70 260 84 260 L96 260 L98 272 L70 272Z" fill="${o.shoes}"/><path d="M130 266 Q130 260 116 260 L104 260 L102 272 L130 272Z" fill="${o.shoes}"/>`);
      parts.push(`<rect x="92" y="100" width="16" height="18" fill="${shade(skin, -18)}"/>`);
      parts.push(`<path d="M66 128 Q66 115 84 113 L116 113 Q134 115 134 128 L136 204 L64 204Z" fill="${o.top}" stroke="${shade(o.top, -20)}" stroke-width="1.2"/>`);
      if (o.skirt) parts.push(o.skirt(o.top));
      if (o.extra) parts.push(o.extra(o.top));
      parts.push(arm(-1, o.sleeve, o.top, skin), arm(1, o.sleeve, o.top, skin));
    } else {
      parts.push(`<rect x="91" y="102" width="18" height="16" fill="${shade(skin, -18)}"/>`);
    }

    // ears, head, face
    const head = [
      `<ellipse cx="62" cy="74" rx="5.5" ry="7.5" fill="${shade(skin, -12)}"/><ellipse cx="138" cy="74" rx="5.5" ry="7.5" fill="${shade(skin, -12)}"/>`,
      `<path d="M62 70 Q62 34 100 34 Q138 34 138 70 Q138 98 118 106 Q100 112 82 106 Q62 98 62 70Z" fill="${skin}"/>`,
      `<path d="M100 74 Q97 81 101 82.5" stroke="${shade(skin, -40)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      (FACES[a.face] || FACES.smile)(),
      hair.front ? hair.front(hairC) : '',
      BB.wornIn(a, 'accessory').map(id => (ACCESSORIES[id] || ACCESSORIES.none)()).join(''),
      (HATS[a.hat] || HATS.none)(),
    ].join('');
    parts.push(headGroup(head));

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.head ? HEAD_VIEW : BODY_VIEW}" preserveAspectRatio="xMidYMid meet">${parts.join('')}</svg>`;
  };

  BB.avatarDataUrl = function (a) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BB.renderAvatar(a, { head: true }));
  };
})();
