/* ============================================================
   The picture.

   There is no image model behind this page, so the celebration
   picture is drawn rather than fetched: an SVG postcard of the two
   of you, composed from the answers she just gave. The sky comes
   from the hour, the backdrop from the activity, the props from the
   details. It always renders — offline, instantly, for free.
   ============================================================ */

/* Self-contained, so this file does not depend on app.js load order. */
const sEsc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Every instance needs its own gradient ids, or two scenes on one
   page both render with whichever sky was defined first. */
let sceneSeq = 0;

const SKIES = {
  day: {
    sky: ['#8fcfe6', '#c8e8ef', '#f4efe0'],
    sun: '#ffe6a3', glow: 'rgba(255,226,163,0.55)',
    far: '#8fae9f', near: '#6d8c81', ground: '#d3bd9c', ground2: '#c2a988',
    ink: '#2c2a28', ink2: '#59504a', water: '#79bcd2', accent: '#e8917c', wall: '#e7d7c4',
  },
  golden: {
    sky: ['#ffcf8e', '#fa9b70', '#e4695f'],
    sun: '#fff3cd', glow: 'rgba(255,224,163,0.75)',
    far: '#a06a6c', near: '#79484f', ground: '#8a5559', ground2: '#6e4149',
    ink: '#2a1a1e', ink2: '#5b3840', water: '#ef9772', accent: '#ffd9a8', wall: '#d9a184',
  },
  night: {
    sky: ['#26355a', '#3b4570', '#6d5b7c'],
    sun: '#f7f0dc', glow: 'rgba(247,240,220,0.30)',
    far: '#2a3253', near: '#1d2440', ground: '#232741', ground2: '#191c31',
    ink: '#0f1120', ink2: '#38406a', water: '#33436b', accent: '#f0cbba', wall: '#3a3550',
  },
};

/* Which sky? Sunset always wins, otherwise the hour decides. */
function sceneMood(timeStr, answers) {
  const a = answers || {};
  if (a.vibe === 'sunset' || a.when === 'sunset' || a.when === 'golden' || a.when === 'sunrise') return 'golden';
  if (a.when === 'night' || a.when === 'late') return 'night';
  const h = parseInt(String(timeStr || '20:00').split(':')[0], 10);
  if (isNaN(h)) return 'golden';
  if (h >= 21 || h < 6) return 'night';
  if (h >= 17) return 'golden';
  return 'day';
}

/* Composition. The couple stands on the right third, the light
   source sits on the left, so neither hides the other. */
const W = 640, PIC = 400;
const HORIZON = 278;   // where sky meets the far distance
const MID = 330;       // bottom of the water / street band
const FOOT = 376;      // where their feet land
const CX = 402;        // couple, right third
const LX = 232;        // sun / moon, left third

/* ---------- the couple ---------- */

/* Seen from behind, because a silhouette never looks wrong.
   `skirt` flares the hem so the two read as different people at a
   glance, even at thumbnail size. */
function person(x, h, p, opts) {
  const o = opts || {};
  const ink = o.ink || p.ink;
  const hr = h * 0.097;                 // head radius
  const cy = FOOT - h + hr;             // head centre
  const sy = cy + hr * 2.0;             // shoulder line
  const sw = h * 0.125;                 // half shoulder
  const ww = h * 0.088;                 // half waist
  const fw = o.skirt ? h * 0.132 : h * 0.076;   // half hem

  const body = `M ${x - sw + 2} ${sy - 4}
    C ${x - sw - 4} ${sy + h * 0.04}, ${x - sw - 2} ${sy + h * 0.14}, ${x - ww} ${sy + h * 0.26}
    C ${x - ww - 1} ${sy + h * 0.4}, ${x - fw} ${FOOT - h * 0.12}, ${x - fw} ${FOOT}
    L ${x + fw} ${FOOT}
    C ${x + fw} ${FOOT - h * 0.12}, ${x + ww + 1} ${sy + h * 0.4}, ${x + ww} ${sy + h * 0.26}
    C ${x + sw + 2} ${sy + h * 0.14}, ${x + sw + 4} ${sy + h * 0.04}, ${x + sw - 2} ${sy - 4} Z`;

  // Hair sits a shade darker than the body, so the head still reads
  // as a head instead of dissolving into the shoulders.
  const hair = o.hair ? `
    <path d="M ${x - hr - 2} ${cy - 1}
      C ${x - hr - 4} ${cy + hr * 1.5}, ${x - sw + 1} ${sy + h * 0.02}, ${x - sw + 3} ${sy + h * 0.1}
      L ${x + sw - 3} ${sy + h * 0.1}
      C ${x + sw - 1} ${sy + h * 0.02}, ${x + hr + 4} ${cy + hr * 1.5}, ${x + hr + 2} ${cy - 1}
      C ${x + hr + 2} ${cy - hr * 1.75}, ${x - hr - 2} ${cy - hr * 1.75}, ${x - hr - 2} ${cy - 1} Z"
      fill="${p.ink}" opacity="0.92"/>` : '';

  return `<g>
    <rect x="${x - hr * 0.4}" y="${cy}" width="${hr * 0.8}" height="${sy - cy + 3}" fill="${ink}"/>
    <circle cx="${x}" cy="${cy}" r="${hr}" fill="${ink}"/>
    ${hair}
    <path d="${body}" fill="${ink}"/>
  </g>`;
}

/* Two of them, hands joined across the gap. */
function couple(p, cx) {
  const x = cx == null ? CX : cx;
  const a = x - 36, b = x + 36;
  const hy = FOOT - 72;
  return `
    <ellipse cx="${x}" cy="${FOOT + 2}" rx="80" ry="8" fill="${p.ink}" opacity="0.16"/>
    ${person(a, 160, p, {})}
    ${person(b, 148, p, { hair: true, skirt: true, ink: p.ink2 })}
    <path d="M ${a + 12} ${hy} Q ${x} ${hy + 7} ${b - 11} ${hy - 4}"
          stroke="${p.ink2}" stroke-width="5" stroke-linecap="round" fill="none"/>
    ${[[x - 2, FOOT - 196, 1], [x + 34, FOOT - 220, 0.7], [x - 36, FOOT - 232, 0.55]].map(([hx, hy2, s]) => `
      <path transform="translate(${hx} ${hy2}) scale(${s})"
            d="M 0 9 C -15 -4 -11 -19 0 -13 C 11 -19 15 -4 0 9 Z"
            fill="${p.accent}" opacity="0.9"/>`).join('')}`;
}

/* ---------- ground planes ---------- */

function outdoorGround(p) {
  return `
    <rect x="0" y="${HORIZON}" width="${W}" height="${PIC - HORIZON}" fill="${p.ground}"/>
    <rect x="0" y="${MID + 26}" width="${W}" height="${PIC - MID - 26}" fill="${p.ground2}" opacity="0.55"/>`;
}

function indoorRoom(p, warmLight) {
  const floor = 300;
  return `
    <rect x="0" y="0" width="${W}" height="${floor}" fill="${p.wall}"/>
    <rect x="0" y="${floor}" width="${W}" height="${PIC - floor}" fill="${p.ground2}"/>
    <rect x="0" y="${floor}" width="${W}" height="3" fill="${p.ink}" opacity="0.14"/>
    <rect x="96" y="70" width="150" height="130" rx="5" fill="${warmLight}" opacity="0.5"/>
    <rect x="96" y="70" width="150" height="130" rx="5" fill="none" stroke="${p.ink}" stroke-width="6" opacity="0.6"/>
    <path d="M 171 70 L 171 200 M 96 135 L 246 135" stroke="${p.ink}" stroke-width="5" opacity="0.55"/>
    <circle cx="556" cy="52" r="8" fill="${p.ink}" opacity="0.65"/>
    <path d="M 556 60 L 556 96" stroke="${p.ink}" stroke-width="4" opacity="0.65"/>
    <path d="M 524 136 L 588 136 L 576 96 L 536 96 Z" fill="${p.sun}" opacity="0.85"/>
    <ellipse cx="556" cy="152" rx="52" ry="14" fill="${p.sun}" opacity="0.18"/>`;
}

/* ---------- outdoor backdrops ---------- */

function sea(p) {
  return `
    <rect x="0" y="${HORIZON}" width="${W}" height="${MID - HORIZON}" fill="${p.water}"/>
    <rect x="0" y="${HORIZON}" width="${W}" height="2.5" fill="${p.ink}" opacity="0.16"/>
    ${[0, 1, 2, 3].map((i) => `
      <rect x="${LX - 22 - i * 5}" y="${HORIZON + 8 + i * 11}" width="${44 + i * 14}" height="4"
            rx="2" fill="${p.sun}" opacity="${0.55 - i * 0.1}"/>`).join('')}
    <path d="M 0 ${MID} Q 60 ${MID - 9} 130 ${MID} T 300 ${MID} T 470 ${MID} T ${W} ${MID}
             L ${W} ${MID + 14} L 0 ${MID + 14} Z" fill="${p.water}" opacity="0.55"/>`;
}

function hills(p) {
  return `
    <path d="M -20 ${HORIZON} Q 110 ${HORIZON - 84} 250 ${HORIZON} Z" fill="${p.far}" opacity="0.7"/>
    <path d="M 170 ${HORIZON} Q 350 ${HORIZON - 112} 540 ${HORIZON} Z" fill="${p.far}"/>
    <path d="M 420 ${HORIZON} Q 560 ${HORIZON - 66} 680 ${HORIZON} Z" fill="${p.near}" opacity="0.85"/>
    ${[[120, 8], [200, 6], [520, 7]].map(([x, r]) => `
      <path d="M ${x} ${HORIZON} q -${r} -${r * 2.4} 0 -${r * 3.4} q ${r} ${r} 0 ${r * 3.4} Z"
            fill="${p.near}" opacity="0.7"/>`).join('')}`;
}

function skyline(p) {
  const b = [[26, 74], [70, 112], [116, 52], [152, 92], [200, 134], [252, 66],
             [296, 100], [344, 58], [386, 120], [440, 78], [486, 106], [536, 62], [586, 92]];
  return `
    ${b.map(([x, h], i) => `
      <rect x="${x}" y="${HORIZON - h}" width="${24 + (i % 3) * 8}" height="${h}"
            fill="${i % 2 ? p.near : p.far}"/>
      ${[0, 1, 2, 3].map((r) => (r * 18 + 14 < h ? `
        <rect x="${x + 6}" y="${HORIZON - h + 12 + r * 18}" width="5" height="7"
              fill="${p.sun}" opacity="${0.6 - r * 0.11}"/>` : '')).join('')}`).join('')}
    <rect x="0" y="${HORIZON}" width="${W}" height="${MID - HORIZON}" fill="${p.near}" opacity="0.28"/>`;
}

function arches(p) {
  const col = (x, w, h) => `
    <path d="M ${x} ${HORIZON} L ${x} ${HORIZON - h + w / 2}
             a ${w / 2} ${w / 2} 0 0 1 ${w} 0 L ${x + w} ${HORIZON} Z" fill="${p.far}"/>`;
  let out = `<rect x="86" y="${HORIZON - 132}" width="404" height="132" fill="${p.near}" opacity="0.5"/>`;
  for (let i = 0; i < 7; i++) out += col(104 + i * 55, 34, 104);
  out += `<rect x="86" y="${HORIZON - 138}" width="404" height="14" rx="4" fill="${p.far}"/>`;
  out += `<rect x="86" y="${HORIZON - 168}" width="330" height="30" rx="4" fill="${p.far}" opacity="0.8"/>`;
  return out;
}

function poolScene(p) {
  const palm = (x, s) => `
    <g transform="translate(${x} ${HORIZON + 6}) scale(${s})">
      <path d="M 0 0 q -7 -54 5 -100" stroke="${p.near}" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${[-1, 1].map((d) => `
        <path d="M 5 -100 q ${40 * d} -22 ${62 * d} 5" stroke="${p.near}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M 5 -100 q ${32 * d} -36 ${46 * d} -28" stroke="${p.near}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
  return `
    ${palm(74, 1)}${palm(560, 0.82)}
    <rect x="40" y="${MID}" width="${W - 80}" height="${PIC - MID}" rx="24" fill="${p.water}"/>
    ${[0, 1, 2].map((i) => `
      <path d="M ${90 + i * 180} ${MID + 26 + i * 14} q 18 -8 36 0 q 18 8 36 0"
            stroke="#fff" stroke-width="3" fill="none" opacity="0.4" stroke-linecap="round"/>`).join('')}`;
}

function shopfronts(p) {
  return `${[0, 1, 2, 3, 4].map((i) => {
    const x = 8 + i * 130;
    return `
      <rect x="${x}" y="${HORIZON - 140}" width="112" height="140" fill="${i % 2 ? p.far : p.near}"/>
      <rect x="${x + 14}" y="${HORIZON - 96}" width="84" height="58" rx="3" fill="${p.sun}" opacity="0.6"/>
      <path d="M ${x - 4} ${HORIZON - 104} l 120 0 l -9 -18 l -102 0 Z" fill="${p.accent}" opacity="0.85"/>`;
  }).join('')}
    <rect x="0" y="${HORIZON}" width="${W}" height="${MID - HORIZON}" fill="${p.near}" opacity="0.22"/>`;
}

function cinemaScreen(p) {
  return `
    <rect x="0" y="0" width="${W}" height="${PIC}" fill="${p.near}" opacity="0.5"/>
    <rect x="96" y="44" width="448" height="228" rx="6" fill="${p.ink}" opacity="0.85"/>
    <rect x="106" y="54" width="428" height="208" rx="3" fill="${p.sun}" opacity="0.9"/>
    <rect x="106" y="54" width="428" height="208" rx="3" fill="${p.accent}" opacity="0.3"/>
    <circle cx="320" cy="158" r="46" fill="${p.ink}" opacity="0.14"/>
    <path d="M 304 136 L 304 180 L 342 158 Z" fill="${p.ink}" opacity="0.28"/>
    <rect x="0" y="300" width="${W}" height="${PIC - 300}" fill="${p.ground2}"/>`;
}

function lanes(p) {
  return `
    <rect x="0" y="0" width="${W}" height="${PIC}" fill="${p.near}" opacity="0.55"/>
    ${[0, 1, 2].map((i) => {
      const x = 70 + i * 190;
      return `
        <path d="M ${x} ${PIC} L ${x + 130} ${PIC} L ${x + 96} 120 L ${x + 34} 120 Z"
              fill="${p.wall}" opacity="${0.75 - i * 0.06}"/>
        ${[0, 1, 2, 3, 4, 5].map((k) => `
          <circle cx="${x + 52 + (k % 3) * 13}" cy="${132 + Math.floor(k / 3) * 12}" r="5"
                  fill="${p.sun}" opacity="0.9"/>`).join('')}`;
    }).join('')}`;
}

function track(p) {
  return `
    <path d="M -20 ${HORIZON} Q 150 ${HORIZON - 66} 320 ${HORIZON} Z" fill="${p.far}" opacity="0.7"/>
    <path d="M 0 ${MID + 6} Q 320 ${MID - 24} ${W} ${MID + 6} L ${W} ${PIC} L 0 ${PIC} Z"
          fill="${p.ink}" opacity="0.45"/>
    ${[0, 1, 2, 3, 4].map((i) => `
      <rect x="${40 + i * 130}" y="${MID + 38}" width="42" height="6" rx="3" fill="#fff" opacity="0.5"/>`).join('')}
    ${[[92, 1], [556, 0.85]].map(([x, sc]) => `
      <g transform="translate(${x} ${HORIZON - 2}) scale(${sc})">
        <path d="M 0 0 L 0 -66" stroke="${p.ink}" stroke-width="4"/>
        <path d="M 2 -66 l 40 12 l -40 12 Z" fill="${p.accent}"/>
      </g>`).join('')}`;
}

function stage(p) {
  return `
    <rect x="0" y="0" width="${W}" height="${PIC}" fill="${p.near}" opacity="0.6"/>
    <rect x="110" y="96" width="420" height="172" rx="6" fill="${p.ink}" opacity="0.65"/>
    ${[0, 1, 2, 3, 4].map((i) => `
      <path d="M ${150 + i * 90} 96 L ${104 + i * 90} 300 L ${196 + i * 90} 300 Z"
            fill="${p.sun}" opacity="0.2"/>
      <circle cx="${150 + i * 90}" cy="92" r="8" fill="${p.sun}" opacity="0.95"/>`).join('')}
    <rect x="196" y="196" width="9" height="66" rx="4" fill="${p.ink}" opacity="0.9"/>
    <circle cx="200" cy="188" r="12" fill="${p.ink}" opacity="0.9"/>
    <rect x="0" y="300" width="${W}" height="${PIC - 300}" fill="${p.ground2}"/>`;
}

function frames(p) {
  return [[80, 0], [206, 1], [332, 0]].map(([x, tall]) => `
    <rect x="${x}" y="${tall ? 74 : 92}" width="96" height="${tall ? 116 : 84}" rx="3"
          fill="${p.sun}" opacity="0.45"/>
    <rect x="${x}" y="${tall ? 74 : 92}" width="96" height="${tall ? 116 : 84}" rx="3"
          fill="none" stroke="${p.ink}" stroke-width="5" opacity="0.65"/>`).join('');
}

function blanket(p, x) {
  return `
    <ellipse cx="${x}" cy="${FOOT + 7}" rx="152" ry="26" fill="${p.accent}" opacity="0.9"/>
    <ellipse cx="${x}" cy="${FOOT + 7}" rx="152" ry="26" fill="none" stroke="${p.ink}"
             stroke-width="3" opacity="0.22"/>
    <path d="M ${x + 74} ${FOOT + 3} l 0 -28 q 0 -8 9 -8 l 32 0 q 9 0 9 8 l 0 28 Z"
          fill="${p.ink}" opacity="0.7"/>
    <path d="M ${x + 79} ${FOOT - 33} q 16 -11 32 0" stroke="${p.ink}" stroke-width="3.5"
          fill="none" opacity="0.7"/>`;
}

/* ---------- foreground props ---------- */

function bikes(p, cx) {
  const bike = (x, s) => `
    <g transform="translate(${x} ${FOOT}) scale(${s})" fill="none"
       stroke="${p.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="-30" cy="-19" r="19"/><circle cx="30" cy="-19" r="19"/>
      <path d="M -30 -19 L -7 -51 L 21 -51 L 30 -19 M -7 -51 L 7 -19 L 30 -19 M 21 -51 L 28 -60"/>
      <path d="M -12 -56 L 2 -56"/>
    </g>`;
  return bike(cx - 150, 1) + bike(150, 0.92);
}

function bistroTable(p, x) {
  const top = FOOT - 64;
  const glass = (gx) => `
    <path d="M ${gx - 7} ${top - 30} L ${gx + 7} ${top - 30} L ${gx + 2} ${top - 14} L ${gx - 2} ${top - 14} Z"
          fill="${p.accent}" opacity="0.95"/>
    <rect x="${gx - 1}" y="${top - 15} " width="2" height="9" fill="${p.ink}" opacity="0.85"/>
    <rect x="${gx - 5}" y="${top - 7}" width="10" height="2.5" rx="1" fill="${p.ink}" opacity="0.85"/>`;
  return `
    <ellipse cx="${x}" cy="${FOOT + 1}" rx="28" ry="7" fill="${p.ink}" opacity="0.2"/>
    <rect x="${x - 4}" y="${top}" width="8" height="${FOOT - top}" fill="${p.ink}" opacity="0.85"/>
    <ellipse cx="${x}" cy="${top}" rx="44" ry="11" fill="${p.ink}" opacity="0.85"/>
    ${glass(x - 17)}${glass(x + 17)}`;
}

function sofa(p, x) {
  return `
    <path d="M ${x - 118} ${FOOT} l 0 -54 q 0 -20 22 -20 l 192 0 q 22 0 22 20 l 0 54 Z"
          fill="${p.ink}" opacity="0.62"/>
    <rect x="${x - 132}" y="${FOOT - 44}" width="264" height="44" rx="12" fill="${p.ink}" opacity="0.8"/>`;
}

function counter(p, x) {
  return `
    <rect x="${x - 150}" y="${FOOT - 76}" width="300" height="16" rx="5" fill="${p.ink}" opacity="0.6"/>
    <rect x="${x - 138}" y="${FOOT - 60}" width="276" height="60" fill="${p.ink}" opacity="0.4"/>
    <path d="M ${x - 34} ${FOOT - 76} l 9 -34 h 50 l 9 34 Z" fill="${p.ink}" opacity="0.8"/>
    ${[0, 1, 2].map((i) => `
      <path d="M ${x - 18 + i * 16} ${FOOT - 118} q 8 -14 0 -26 q -8 -12 0 -22"
            stroke="${p.sun}" stroke-width="3.5" fill="none"
            opacity="${0.7 - i * 0.14}" stroke-linecap="round"/>`).join('')}`;
}

function bags(p, cx) {
  return [[-70, 1], [72, 0.9]].map(([d, s]) => `
    <g transform="translate(${cx + d} ${FOOT - 34}) scale(${s})">
      <rect x="-15" y="0" width="30" height="34" rx="3" fill="${p.accent}"/>
      <path d="M -8 0 q 8 -13 16 0" stroke="${p.ink}" stroke-width="2.5" fill="none" opacity="0.8"/>
    </g>`).join('');
}

/* ---------- the whole postcard ---------- */

function dateScene(o) {
  const uid = 'sc' + (++sceneSeq);
  const mood = sceneMood(o.time, o.answers);
  const p = SKIES[mood];
  const a = o.answers || {};
  const act = o.activity;

  const homeFood = act === 'food' && a.vibe === 'home';
  const homeMovie = act === 'movie' && a.where !== 'cinema' && a.where !== 'roof';
  const homeDance = act === 'dancing' && a.where === 'home';
  const kitchen = act === 'cook' || homeFood;
  const indoors = kitchen || homeMovie || homeDance
                  || ['nothing', 'games', 'spa', 'escape', 'museum'].includes(act);
  const bigRoom = act === 'bowling' || (act === 'movie' && !homeMovie)
                  || act === 'music' || (act === 'dancing' && !homeDance);

  let backdrop = '', prop = '', cx = CX;

  /* Photos land bottom-left, so any left-hand prop moves to the other
     side of the couple rather than hiding behind them. */
  const shots = (o.photos || []).filter(Boolean).slice(0, 2);
  const propX = shots.length ? Math.min(W - 76, CX + 122) : 150;

  if (act === 'bowling') {
    backdrop = lanes(p);
    cx = 320;
  } else if (indoors) {
    backdrop = indoorRoom(p, kitchen ? p.sun : p.accent) + (act === 'museum' ? frames(p) : '');
    prop = kitchen ? counter(p, 300)
         : ['nothing', 'games'].includes(act) || homeMovie ? sofa(p, 300) : '';
    cx = 470;
  } else if (bigRoom) {
    backdrop = act === 'movie' ? cinemaScreen(p) : stage(p);
    cx = 320;
  } else {
    switch (act) {
      case 'italy':    backdrop = arches(p); break;
      case 'trip':     backdrop = hills(p); break;
      case 'karting':  backdrop = track(p); break;
      case 'pool':     backdrop = poolScene(p); break;
      case 'shopping': backdrop = shopfronts(p); prop = bags(p, cx); break;
      case 'bikes':    backdrop = sea(p); prop = bikes(p, cx); break;
      case 'beach':    backdrop = sea(p); break;
      case 'picnic':   backdrop = a.where === 'beach' ? sea(p) : hills(p); prop = blanket(p, cx); break;
      case 'drinks':   backdrop = skyline(p); prop = bistroTable(p, propX); break;
      case 'food':     backdrop = a.vibe === 'roof' ? skyline(p) : sea(p); prop = bistroTable(p, propX); break;
      case 'walk':     backdrop = (a.where === 'market' || a.where === 'neve') ? shopfronts(p) : sea(p); break;
      default:         backdrop = sea(p);
    }
  }

  const sunY = mood === 'golden' ? HORIZON - 18 : 92;
  const sunR = mood === 'golden' ? 66 : mood === 'night' ? 32 : 44;

  const stars = (mood === 'night' && !indoors && !bigRoom)
    ? [[52, 54], [136, 92], [214, 40], [292, 74], [398, 50], [474, 96], [548, 62],
       [598, 126], [96, 142], [340, 116], [252, 150], [606, 40]]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.7 : 2.6}" fill="#fff" opacity="0.8"/>`).join('')
    : '';

  const sun = (indoors || bigRoom) ? '' : `
    <circle cx="${LX}" cy="${sunY}" r="${sunR * 2.3}" fill="url(#g${uid})"/>
    <circle cx="${LX}" cy="${sunY}" r="${sunR}" fill="${p.sun}"/>`;

  const line2 = [o.dateStr, o.time].filter(Boolean).join('  ·  ');

  /* Real photos, when he uploaded them, pinned on like polaroids.
     They arrive as data URIs, so they survive the PNG export intact. */
  const pinned = shots.map((src, i) => {
    const k = shots.length > 1 ? 0.84 : 1;
    const pw = 122 * k, ph = 142 * k;
    const px = 22 + i * (pw + 12);
    const py = PIC - ph - 16 - (i ? 8 : 0);
    const rot = i ? 3.5 : -4.5;
    return `
      <g transform="rotate(${rot} ${px + pw / 2} ${py + ph / 2})">
        <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="3" fill="#fdf8f3"
              stroke="rgba(47,42,38,0.16)" stroke-width="1"/>
        <image href="${src}" x="${px + 7 * k}" y="${py + 7 * k}"
               width="${pw - 14 * k}" height="${pw - 14 * k}"
               preserveAspectRatio="xMidYMid slice"/>
      </g>`;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 460" width="${W}" height="460" role="img"
     aria-label="An illustration of ${sEsc(o.from)} and ${sEsc(o.to)} on their date">
  <defs>
    <linearGradient id="s${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.sky[0]}"/>
      <stop offset="52%" stop-color="${p.sky[1]}"/>
      <stop offset="100%" stop-color="${p.sky[2]}"/>
    </linearGradient>
    <radialGradient id="g${uid}">
      <stop offset="0%" stop-color="${p.glow}"/>
      <stop offset="100%" stop-color="${p.glow.replace(/[\d.]+\)$/, '0)')}"/>
    </radialGradient>
    <clipPath id="c${uid}"><rect x="0" y="0" width="${W}" height="${PIC}"/></clipPath>
  </defs>

  <rect width="${W}" height="460" fill="#fdf8f3"/>
  <g clip-path="url(#c${uid})">
    <rect width="${W}" height="${PIC}" fill="url(#s${uid})"/>
    ${stars}
    ${sun}
    ${(indoors || bigRoom) ? '' : outdoorGround(p)}
    ${backdrop}
    ${couple(p, cx)}
    ${prop}
    ${pinned}
  </g>

  <text x="${W / 2}" y="428" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="26" fill="#2f2a26">${sEsc(o.from)} &amp; ${sEsc(o.to)}</text>
  <text x="${W / 2}" y="449" text-anchor="middle" font-family="ui-monospace, Menlo, monospace"
        font-size="11.5" letter-spacing="1.7" fill="#8c7f74">${sEsc(line2.toUpperCase())}</text>
</svg>`;
}

/* Rasterise the drawing so she can save it to her camera roll. */
function downloadScene(svgMarkup, filename) {
  const svg = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svg);
  const img = new Image();

  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = 460 * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, W, 460);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || 'our-date.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, 'image/png');
  };

  // If rasterising is blocked, hand over the drawing itself rather than nothing.
  img.onerror = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = (filename || 'our-date').replace(/\.png$/, '') + '.svg';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  };

  img.src = url;
}
