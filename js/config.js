/* ============================================================
   Config travels inside the link itself (#c=<base64url json>).
   No backend, no database — the URL is the database.
   ============================================================ */

const DEFAULT_CONFIG = {
  from: 'Eitan',
  to: 'Or',
  phone: '',                 // WhatsApp number that gets the answers, digits only
  city: 'Tel Aviv',
  photoHer: '',              // optional image URLs
  photoUs: '',
  igMe: '',                  // instagram handles, shown as links
  igHer: '',
  activities: ACTIVITIES.map((a) => a.id),
  blockedDays: [],           // weekday indices 0=Sun … 6=Sat that he can't do
  horizon: 60,               // how far ahead the calendar goes, in days
  note: '',                  // optional personal line on the ticket
};

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
