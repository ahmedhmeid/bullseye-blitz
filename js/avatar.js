// Draws the player's avatar as an SVG, layer by layer.
// Head is centred at (100, 72) with radius 38 inside a 200-wide canvas.
(function () {
  const BODY_VIEW = '0 -16 200 296';
  const HEAD_VIEW = '36 -16 128 128';
  const INK = '#2d3436';

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = v => Math.max(0, Math.min(255, v));
    const r = c((n >> 16) + amt), g = c(((n >> 8) & 255) + amt), b = c((n & 255) + amt);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function star(cx, cy, outer, inner) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? inner : outer;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  const logo = (x, y, s) =>
    `<circle cx="${x}" cy="${y}" r="${14 * s}" fill="#ff4757"/><circle cx="${x}" cy="${y}" r="${10 * s}" fill="#fff"/>` +
    `<circle cx="${x}" cy="${y}" r="${6 * s}" fill="#ff4757"/><circle cx="${x}" cy="${y}" r="${2.5 * s}" fill="#fff"/>`;

  // ---------- Hair ----------
  const SHORT_FRONT = c => `<path d="M61 72 Q58 30 100 30 Q142 30 139 72 Q132 50 100 47 Q70 50 61 72Z" fill="${c}"/>`;
  const HAIR = {
    bald: {},
    short: { front: SHORT_FRONT },
    long: {
      back: c => `<path d="M58 70 Q56 26 100 26 Q144 26 142 70 L148 168 Q100 180 52 168Z" fill="${c}"/>`,
      front: c => `<path d="M60 80 Q57 28 100 28 Q143 28 140 80 Q135 54 114 46 Q98 60 70 56 Q63 66 60 80Z" fill="${c}"/>`,
    },
    curly: {
      front: c => [[64, 64, 11], [68, 48, 12], [80, 36, 13], [100, 31, 14], [120, 36, 13], [132, 48, 12], [136, 64, 11]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join(''),
    },
    ponytail: {
      back: c => `<path d="M126 42 Q172 44 164 124 Q156 98 138 80Z" fill="${c}"/>`,
      front: c => SHORT_FRONT(c) + `<circle cx="134" cy="46" r="5" fill="#ff4757"/>`,
    },
    spiky: {
      front: c => `<path d="M62 68 L58 40 L74 48 L76 22 L90 40 L100 14 L110 40 L124 22 L126 48 L142 40 L138 68 Q128 50 100 50 Q72 50 62 68Z" fill="${c}"/>`,
    },
    buns: {
      back: c => `<circle cx="66" cy="34" r="16" fill="${c}"/><circle cx="134" cy="34" r="16" fill="${c}"/>`,
      front: SHORT_FRONT,
    },
    afro: {
      back: c => `<circle cx="100" cy="60" r="56" fill="${c}"/>`,
      front: c => `<path d="M64 64 Q64 36 100 36 Q136 36 136 64 Q120 50 100 50 Q80 50 64 64Z" fill="${c}"/>`,
    },
    mohawk: {
      front: c => `<path d="M90 46 L86 6 Q100 -4 114 6 L110 46 Q100 40 90 46Z" fill="${c}"/>`,
    },
  };

  // ---------- Faces ----------
  const eye = (x, r) => `<circle cx="${x}" cy="70" r="${r || 4.5}" fill="#222"/><circle cx="${x + 1.5}" cy="68.5" r="1.4" fill="#fff"/>`;
  const line = (d, w) => `<path d="${d}" stroke="#222" stroke-width="${w || 3}" fill="none" stroke-linecap="round"/>`;
  const SMILE = line('M88 86 Q100 97 112 86');
  const FACES = {
    smile: () => eye(86) + eye(114) + SMILE,
    grin: () => eye(86) + eye(114) + `<path d="M85 84 Q100 104 115 84Z" fill="#6b1d1d"/><path d="M87 85 L113 85 L111 89 L89 89Z" fill="#fff"/>`,
    surprised: () => eye(86, 6) + eye(114, 6) + `<ellipse cx="100" cy="91" rx="5" ry="7" fill="#6b1d1d"/>`,
    wink: () => eye(86) + line('M108 71 Q114 65 120 71') + SMILE,
    cool: () => line('M80 71 L92 71', 3.5) + line('M108 71 L120 71', 3.5) + line('M90 89 Q103 93 112 84'),
    tongue: () => eye(86) + eye(114) + `<ellipse cx="100" cy="94" rx="5.5" ry="6" fill="#ff6b81"/>` + SMILE,
    angry: () => eye(86) + eye(114) + line('M78 59 L93 65') + line('M122 59 L107 65') + line('M88 92 Q100 83 112 92'),
  };

  // ---------- Outfits ----------
  // sleeve: 'short' | 'long' | 'none'. pants: colour, or null for bare legs.
  const OUTFITS = {
    tee:      { top: '#2e86de', sleeve: 'short', pants: '#2f3542', shoes: '#222', extra: () => logo(100, 152, 1) },
    dress:    { top: '#e84393', sleeve: 'short', pants: null, shoes: '#c0392b',
                skirt: c => `<path d="M66 172 L134 172 L154 236 Q100 250 46 236Z" fill="${c}"/><rect x="64" y="168" width="72" height="9" rx="4" fill="${shade(c, -40)}"/>`,
                extra: () => `<circle cx="100" cy="140" r="5" fill="#fff" opacity=".8"/>` },
    striped:  { top: '#ffffff', sleeve: 'short', pants: '#3867d6', shoes: '#222',
                extra: () => [128, 148, 168, 188].map(y => `<rect x="63" y="${y}" width="74" height="9" fill="#ff4757"/>`).join('') },
    hoodie:   { top: '#6c5ce7', sleeve: 'long', pants: '#2f3542', shoes: '#fff',
                extra: c => `<path d="M76 114 Q100 134 124 114 Q120 106 100 108 Q80 106 76 114Z" fill="${shade(c, -35)}"/>` +
                  `<path d="M78 172 L122 172 L128 198 L72 198Z" fill="${shade(c, -25)}"/>` +
                  `<path d="M92 122 L90 146 M108 122 L110 146" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>` },
    overalls: { top: '#fed330', sleeve: 'short', pants: '#3867d6', shoes: '#6b3e1e',
                extra: () => `<rect x="78" y="142" width="44" height="64" rx="4" fill="#3867d6"/>` +
                  `<path d="M80 116 L84 144 M120 116 L116 144" stroke="#3867d6" stroke-width="7" stroke-linecap="round"/>` +
                  `<circle cx="84" cy="148" r="3" fill="#fed330"/><circle cx="116" cy="148" r="3" fill="#fed330"/>` },
    jersey:   { top: '#e17055', sleeve: 'none', pants: '#2d3436', shoes: '#fff',
                extra: () => `<text x="100" y="178" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#fff" text-anchor="middle">10</text>` },
    suit:     { top: '#2d3436', sleeve: 'long', pants: '#2d3436', shoes: '#111',
                extra: () => `<path d="M86 113 L100 144 L114 113Z" fill="#fff"/><path d="M100 118 L95 125 L100 162 L105 125Z" fill="#d63031"/>` },
    gown:     { top: '#8e44ad', sleeve: 'none', pants: null, shoes: '#8e44ad',
                skirt: c => `<path d="M64 168 L136 168 L172 270 Q100 286 28 270Z" fill="${c}"/>` +
                  `<polygon points="${star(80, 220, 5, 2)}" fill="#fff"/><polygon points="${star(124, 246, 5, 2)}" fill="#fff"/><polygon points="${star(104, 196, 4, 1.6)}" fill="#fff"/>`,
                extra: () => `<polygon points="${star(100, 138, 7, 3)}" fill="#f9ca24"/>` },
    hero:     { top: '#0984e3', sleeve: 'long', pants: '#0984e3', shoes: '#d63031',
                back: () => `<path d="M66 118 L134 118 L158 252 Q100 264 42 252Z" fill="#d63031"/>`,
                extra: () => `<circle cx="100" cy="152" r="17" fill="#f9ca24"/><polygon points="${star(100, 153, 13, 5.5)}" fill="#d63031"/>` +
                  `<rect x="62" y="194" width="76" height="8" fill="#f9ca24"/>` },
    space:    { top: '#dfe6e9', sleeve: 'long', pants: '#dfe6e9', shoes: '#636e72',
                extra: () => `<rect x="82" y="138" width="36" height="28" rx="4" fill="#636e72"/>` +
                  `<circle cx="91" cy="147" r="4" fill="#ff4757"/><circle cx="109" cy="147" r="4" fill="#2ecc71"/><rect x="88" y="156" width="24" height="5" rx="2" fill="#74b9ff"/>` +
                  logo(78, 128, 0.45) },
  };

  // ---------- Hats ----------
  const HATS = {
    none: () => '',
    headband: () => `<path d="M62 58 Q100 34 138 58" stroke="#ff4757" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    party: () => `<path d="M83 38 L100 -6 L117 38Z" fill="#fd79a8"/><path d="M89 22 L111 22 M86 31 L114 31" stroke="#fff" stroke-width="3"/><circle cx="100" cy="-7" r="6" fill="#fdcb6e"/>`,
    cap: () => `<path d="M61 60 Q61 22 100 22 Q139 22 139 60Z" fill="#ff4757"/><path d="M56 58 Q100 50 152 58 Q148 67 100 64 Q70 64 56 62Z" fill="#c0392b"/><circle cx="100" cy="23" r="4" fill="#c0392b"/>` + logo(100, 42, 0.5),
    beanie: () => `<path d="M60 62 Q60 18 100 18 Q140 18 140 62Z" fill="#00b894"/><rect x="57" y="52" width="86" height="13" rx="6" fill="#00866d"/><circle cx="100" cy="15" r="9" fill="#fff"/>`,
    cowboy: () => `<ellipse cx="100" cy="46" rx="60" ry="10" fill="#8b4513"/><path d="M72 46 Q70 10 100 16 Q130 10 128 46Z" fill="#a0522d"/><rect x="72" y="36" width="56" height="7" fill="#5d2e0c"/>`,
    wizard: () => `<ellipse cx="100" cy="48" rx="50" ry="9" fill="#30336b"/><path d="M66 48 L108 -14 L134 48Z" fill="#4834d4"/>` +
      `<polygon points="${star(98, 26, 6, 2.5)}" fill="#f9ca24"/><polygon points="${star(116, 38, 4, 1.7)}" fill="#f9ca24"/>`,
    crown: () => `<path d="M66 50 L64 16 L82 32 L100 8 L118 32 L136 16 L134 50Z" fill="#f9ca24" stroke="#e1a100" stroke-width="2" stroke-linejoin="round"/>` +
      `<circle cx="100" cy="38" r="5" fill="#e84393"/><circle cx="80" cy="41" r="3.5" fill="#0984e3"/><circle cx="120" cy="41" r="3.5" fill="#00b894"/>`,
  };

  // ---------- Accessories ----------
  const ACCESSORIES = {
    none: () => '',
    glasses: () => `<g fill="rgba(255,255,255,.3)" stroke="${INK}" stroke-width="3"><circle cx="86" cy="70" r="10"/><circle cx="114" cy="70" r="10"/></g>` +
      `<path d="M96 70 L104 70 M76 68 L63 66 M124 68 L137 66" stroke="${INK}" stroke-width="3"/>`,
    mustache: () => `<path d="M100 82 Q90 74 80 81 Q86 89 100 85 Q114 89 120 81 Q110 74 100 82Z" fill="#4a2c1a"/>`,
    eyepatch: () => `<path d="M62 60 L138 82" stroke="#111" stroke-width="3"/><ellipse cx="114" cy="71" rx="10" ry="9" fill="#111"/>`,
    sunglasses: () => `<rect x="73" y="62" width="24" height="15" rx="6" fill="#111"/><rect x="103" y="62" width="24" height="15" rx="6" fill="#111"/>` +
      `<path d="M97 67 L103 67 M73 66 L62 64 M127 66 L138 64" stroke="#111" stroke-width="3"/><path d="M78 66 L84 66 M108 66 L114 66" stroke="#fff" stroke-width="2" opacity=".6"/>`,
    headphones: () => `<path d="M60 74 Q58 22 100 22 Q142 22 140 74" stroke="${INK}" stroke-width="7" fill="none"/>` +
      `<rect x="50" y="60" width="15" height="28" rx="7" fill="#ff4757"/><rect x="135" y="60" width="15" height="28" rx="7" fill="#ff4757"/>`,
  };

  function colorOf(cat, id, fallback) {
    const item = BB.findItem(cat, id);
    return (item && item.color) || fallback;
  }

  function arm(side, sleeve, top, skin) {
    const m = x => (side < 0 ? x : 200 - x);
    const upper = sleeve === 'none' ? skin : top;
    const lower = sleeve === 'long' ? top : skin;
    return `<path d="M${m(66)} 124 L${m(54)} 160" stroke="${upper}" stroke-width="${sleeve === 'none' ? 13 : 18}" stroke-linecap="round"/>` +
      `<path d="M${m(54)} 160 L${m(48)} 190" stroke="${lower}" stroke-width="${sleeve === 'long' ? 15 : 13}" stroke-linecap="round"/>` +
      `<circle cx="${m(48)}" cy="196" r="8" fill="${skin}"/>`;
  }

  // Returns an SVG string. opts.head = true draws only the head (used on trick bullseyes and shop cards).
  BB.renderAvatar = function (a, opts) {
    opts = opts || {};
    const skin = colorOf('skin', a.skin, '#f1c27d');
    const hairC = colorOf('hairColor', a.hairColor, '#1e1e1e');
    const hair = HAIR[a.hair] || {};
    const o = OUTFITS[a.outfit] || OUTFITS.tee;
    const parts = [];

    if (!opts.head && o.back) parts.push(o.back(o.top));
    if (hair.back) parts.push(hair.back(hairC));

    if (!opts.head) {
      if (o.pants) {
        parts.push(`<rect x="70" y="198" width="26" height="66" rx="7" fill="${o.pants}"/><rect x="104" y="198" width="26" height="66" rx="7" fill="${o.pants}"/>`);
      } else {
        parts.push(`<rect x="76" y="198" width="18" height="66" rx="7" fill="${skin}"/><rect x="106" y="198" width="18" height="66" rx="7" fill="${skin}"/>`);
      }
      parts.push(`<ellipse cx="84" cy="266" rx="16" ry="8" fill="${o.shoes}"/><ellipse cx="116" cy="266" rx="16" ry="8" fill="${o.shoes}"/>`);
      parts.push(`<path d="M64 132 Q64 116 84 113 L116 113 Q136 116 136 132 L138 204 L62 204Z" fill="${o.top}" stroke="${shade(o.top, -30)}" stroke-width="1.5"/>`);
      if (o.skirt) parts.push(o.skirt(o.top));
      if (o.extra) parts.push(o.extra(o.top));
      parts.push(arm(-1, o.sleeve, o.top, skin), arm(1, o.sleeve, o.top, skin));
    }

    // neck, ears, head
    parts.push(`<rect x="91" y="102" width="18" height="16" fill="${shade(skin, -18)}"/>`);
    parts.push(`<circle cx="62" cy="74" r="7" fill="${shade(skin, -12)}"/><circle cx="138" cy="74" r="7" fill="${shade(skin, -12)}"/>`);
    parts.push(`<circle cx="100" cy="72" r="38" fill="${skin}"/>`);
    parts.push(`<circle cx="78" cy="84" r="6" fill="#ff7675" opacity=".3"/><circle cx="122" cy="84" r="6" fill="#ff7675" opacity=".3"/>`);
    parts.push((FACES[a.face] || FACES.smile)());
    if (hair.front) parts.push(hair.front(hairC));
    parts.push((ACCESSORIES[a.accessory] || ACCESSORIES.none)());
    parts.push((HATS[a.hat] || HATS.none)());

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.head ? HEAD_VIEW : BODY_VIEW}" preserveAspectRatio="xMidYMid meet">${parts.join('')}</svg>`;
  };

  BB.avatarDataUrl = function (a) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BB.renderAvatar(a, { head: true }));
  };
})();
