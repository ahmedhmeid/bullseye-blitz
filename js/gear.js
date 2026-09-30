// Draws paintball guns and paintballs as SVGs for the shop.
(function () {
  let gradCount = 0; // gradient ids must be unique across every SVG on the page

  // Bronze, silver and gold get a shiny metal gradient; everything else is a flat colour.
  function fill(defs, color, metal) {
    if (!metal) return color;
    const id = 'bbgear' + (++gradCount);
    defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BB.shade(color, 80)}"/>` +
      `<stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="${BB.shade(color, -70)}"/></linearGradient>`);
    return `url(#${id})`;
  }

  function ballFill(defs, p) {
    const id = 'bbgear' + (++gradCount);
    defs.push(`<radialGradient id="${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${BB.shade(p.color, p.metal ? 110 : 80)}"/>` +
      `<stop offset=".5" stop-color="${p.color}"/><stop offset="1" stop-color="${BB.shade(p.color, -70)}"/></radialGradient>`);
    return `url(#${id})`;
  }

  // Side view, pointing right, inside a 200 x 120 box.
  function gunSvg(defs, gun, p) {
    const body = fill(defs, gun.body, gun.metal);
    const trim = fill(defs, gun.trim, gun.metal);
    const L = Math.round(gun.barrel * 100);
    const ball = ballFill(defs, p);
    return [
      `<path d="M14 52 L52 46 L52 72 L20 84 Q11 84 11 75Z" fill="${trim}"/>`,
      `<path d="M74 70 L90 70 L84 102 L69 102Z" fill="${trim}"/>`,
      `<path d="M92 70 Q98 88 84 90" stroke="${gun.trim}" stroke-width="3" fill="none"/>`,
      `<rect x="108" y="50" width="${L}" height="9" rx="2" fill="${trim}"/>`,
      `<rect x="${104 + L}" y="47" width="9" height="15" rx="2" fill="${body}"/>`,
      `<rect x="50" y="44" width="62" height="26" rx="6" fill="${body}"/>`,
      `<rect x="54" y="47" width="54" height="3" rx="1.5" fill="#fff" opacity=".2"/>`,
      `<rect x="96" y="36" width="4" height="9" fill="#1f2227"/><rect x="124" y="36" width="4" height="15" fill="#1f2227"/>`,
      `<rect x="88" y="26" width="52" height="11" rx="5.5" fill="#1f2227"/>`,
      `<ellipse cx="140" cy="31.5" rx="3" ry="6.5" fill="#6fc3ff"/>`,
      // Hopper full of paintballs.
      `<path d="M55 45 Q55 12 70 12 Q85 12 85 45Z" fill="${p.color}" opacity=".35" stroke="${gun.trim}" stroke-width="2"/>`,
      [[63, 38], [76, 38], [69, 28], [63, 20], [76, 21]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${ball}"/>`).join(''),
    ].join('');
  }

  // A few points around a wobbly circle, for a paint splat.
  function splatPath(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const k = r * (i % 2 ? 0.72 : 1.05 + 0.15 * Math.sin(i * 2.3));
      pts.push(`${(cx + Math.cos(a) * k).toFixed(1)} ${(cy + Math.sin(a) * k).toFixed(1)}`);
    }
    return 'M' + pts.join(' L') + 'Z';
  }

  function paintSvg(defs, p) {
    const ball = ballFill(defs, p);
    return `<path d="${splatPath(100, 108, 70)}" fill="${fill(defs, p.color, p.metal)}" opacity=".85" stroke-linejoin="round"/>` +
      [[34, 44, 7], [170, 60, 6], [160, 170, 8], [40, 168, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.color}" opacity=".85"/>`).join('') +
      [[74, 118], [126, 118], [100, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="${ball}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>`).join('');
  }

  const gunOf = a => BB.findItem('gun', a.gun) || BB.ITEMS.gun[0];
  const paintOf = a => BB.findItem('paint', a.paint) || BB.ITEMS.paint[0];
  const svg = (view, defs, inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" preserveAspectRatio="xMidYMid meet"><defs>${defs.join('')}</defs>${inner}</svg>`;

  // Shop card picture for avatar `a`: its gun, or its paintballs.
  BB.renderGear = function (a, cat) {
    const defs = [];
    if (cat === 'paint') return svg('0 0 200 200', defs, paintSvg(defs, paintOf(a)));
    return svg('0 -40 210 200', defs, gunSvg(defs, gunOf(a), paintOf(a)));
  };

  // Big preview: gun above a pile of paintballs, the same shape as the avatar preview.
  BB.renderLoadout = function (a) {
    const defs = [];
    return svg('0 14 200 262', defs,
      `<g transform="translate(-4 40)">${gunSvg(defs, gunOf(a), paintOf(a))}</g>` +
      `<g transform="translate(30 125) scale(.7)">${paintSvg(defs, paintOf(a))}</g>`);
  };
})();
