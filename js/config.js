/* ============================================================
   Config travels inside the link itself (#c=<base64url json>).
   No backend, no database — the URL is the database.
   ============================================================ */

const DEFAULT_CONFIG = {
  from: 'Eitan',
  to: 'Or',
  phone: '',                 // WhatsApp number that gets the answers, digits only
  city: 'Tel Aviv',
  faceMe: '',                // circular face crops, made in setup, ~168px
  faceHer: '',
  activities: ACTIVITIES.map((a) => a.id),
  favorites: [],             // his shortlist. Star any and the rest stop being pressable.
  rides: DEFAULT_RIDES,      // what's parked outside, with a photo of each
  blockedDays: [],           // weekday indices 0=Sun … 6=Sat that he can't do
  horizon: 60,               // how far ahead the calendar goes, in days
  note: '',                  // optional personal line on the ticket
  cc: '972',                 // country code for a number typed as 05x-xxx-xxxx
};

/* ------------------------------------------------------------
   wa.me will only accept a full international number in digits.
   "050-123-4567" is not one: it opens WhatsApp and then says the
   number doesn't exist, which is exactly the failure that looks
   like "the app didn't send anything". Fix it here, once, and use
   it from both the setup page and the invitation.
   ------------------------------------------------------------ */
function waNumber(raw, cc) {
  let s = String(raw || '').replace(/[^\d+]/g, '');
  if (!s) return '';
  const code = String(cc || '972').replace(/\D/g, '') || '972';

  if (s.startsWith('+')) s = s.slice(1);
  else if (s.startsWith('00')) s = s.slice(2);
  else if (s.startsWith('0')) s = code + s.replace(/^0+/, '');
  else if (!s.startsWith(code) && s.length <= 10) s = code + s;

  s = s.replace(/\D/g, '');
  // Anything outside E.164's range is a typo, not a number.
  return s.length >= 8 && s.length <= 15 ? s : '';
}

/* Pretty version of the above, for showing him what will be dialled. */
function waPretty(digits) {
  return digits ? '+' + digits : '';
}

function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeConfig(cfg) {
  // Only ship what differs from the defaults — keeps the link short.
  const slim = {};
  Object.keys(DEFAULT_CONFIG).forEach((k) => {
    const a = JSON.stringify(cfg[k]);
    const b = JSON.stringify(DEFAULT_CONFIG[k]);
    if (a !== b && cfg[k] !== undefined) slim[k] = cfg[k];
  });
  return b64urlEncode(JSON.stringify(slim));
}

function readConfig() {
  const cfg = { ...DEFAULT_CONFIG };
  const m = location.hash.match(/[#&]c=([^&]+)/);
  if (!m) return cfg;
  try {
    Object.assign(cfg, JSON.parse(b64urlDecode(m[1])));
  } catch (e) {
    console.warn('Bad config in link, using defaults.', e);
  }
  if (!Array.isArray(cfg.activities) || !cfg.activities.length) {
    cfg.activities = DEFAULT_CONFIG.activities;
  }
  // 'bikes' was bicycles before it became the motorcycle ride. Any link
  // built back then still names it, and would otherwise quietly lose it.
  cfg.activities = cfg.activities.map((id) => (id === 'bikes' ? 'moto' : id));

  // A star on something she can't see would lock her out of everything.
  if (!Array.isArray(cfg.favorites)) cfg.favorites = [];
  cfg.favorites = cfg.favorites
    .map((id) => (id === 'bikes' ? 'moto' : id))
    .filter((id) => cfg.activities.includes(id));
  if (!Array.isArray(cfg.rides)) cfg.rides = DEFAULT_CONFIG.rides;
  cfg.rides = cfg.rides
    .filter((r) => r && r.label)
    .map((r, i) => ({ id: r.id || 'r' + (i + 1), emoji: r.emoji || '🚗',
                      label: r.label, note: r.note || '', img: r.img || '' }));
  return cfg;
}

/* A stable-looking booking reference. Corporate theatre. */
function makeRef(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 6; i++) { out += chars[h % chars.length]; h = Math.floor(h / 7) + 13; }
  return out;
}
