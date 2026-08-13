/* ============================================================
   The flow engine.
   ============================================================ */

/* There is only one link to remember. Land here without an invitation
   packed into the URL and you get the setup page instead, which is what
   you want, because a link with no config isn't an invitation to anyone.
   `?demo` skips this, for looking at it without building one first. */
if (!/[#&]c=/.test(location.hash) && !/[?&]demo/.test(location.search)) {
  location.replace('setup.html');
}

const cfg = readConfig();
const OTHER = '__other';

/* Language first: every view below reads through t(), and Hebrew needs
   the document flipped before the first paint. */
applyLang(cfg.lang);
if (isRTL()) {
  document.documentElement.lang = 'he';
  document.documentElement.dir = 'rtl';
}

const RIDES = (cfg.rides || []).filter((r) => r && r.label);

/* 'ride' only exists if he actually listed something to pick her up in. */
const BASE_QUEUE = ['envelope', 'ask', 'celebrate', 'activity', '__flow__', 'recs',
                    'dress', 'date', 'time', 'ride', 'terms', 'confirming', 'party',
                    'contact', 'ticket', 'receipt'].filter((s) => s !== 'ride' || RIDES.length);

const state = {
  stage: 0,
  queue: BASE_QUEUE.slice(),
  activity: null,
  answers: {},       // follow-up answers, keyed by step id
  other: {},         // free text she typed, keyed by question
  spot: null,        // chosen recommendation
  dress: null,
  ride: null,        // how he turns up
  date: null,        // Date at local midnight
  time: null,
  contact: { phone: '', email: '' },
  terms: [],
  noAttempts: 0,
  decoyAttempts: 0,  // options she reached for that were never hers to pick
  calMonth: null,
};

const el = (id) => document.getElementById(id);
const stageEl = () => el('stage');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const REF = makeRef(cfg.from + cfg.to + cfg.city);

/* ---------------- navigation ---------------- */

function currentId() { return state.queue[state.stage]; }

function next() {
  state.stage = Math.min(state.stage + 1, state.queue.length - 1);
  render();
}

function back() {
  state.stage = Math.max(state.stage - 1, 0);
  render();
}

function rebuildQueue() {
  const flow = FLOWS[state.activity] || [];
  const steps = flow.map((s) => 'f:' + s.id);
  const recs = buildRecs(state.activity, state.answers, cfg.city);
  const i = BASE_QUEUE.indexOf('__flow__');
  state.queue = [
    ...BASE_QUEUE.slice(0, i),
    ...steps,
    ...(recs.length ? [] : ['__norecs__']),
    ...BASE_QUEUE.slice(i + 1),
  ].filter((s) => s !== '__norecs__' && !(s === 'recs' && !recs.length));
}

function setProgress() {
  const id = currentId();
  const shown = state.stage > 0 && id !== 'receipt' && id !== 'party';
  const pct = shown ? state.stage / (state.queue.length - 1) : 0;
  el('bar').style.transform = `scaleX(${pct})`;
  el('step').textContent = shown ? t('stepOf', { a: state.stage, b: state.queue.length - 1 }) : '';
}

function render() {
  const id = currentId();
  const s = stageEl();
  s.classList.remove('enter');
  void s.offsetWidth;
  s.classList.add('enter');

  if (id.startsWith('f:')) renderFollowUp(id.slice(2));
  else (VIEWS[id] || VIEWS.envelope)();

  setProgress();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------- question rendering ---------------- */

function head(eyebrow, title, sub) {
  return `
    ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}
    <h2>${title}</h2>
    ${sub ? `<p class="sub">${sub}</p>` : ''}`;
}

function backLink() {
  return state.stage > 3
    ? `<button class="btn ghost" id="backBtn" style="margin-top:6px">${esc(t('back'))}</button>`
    : '';
}

function wireBack() {
  const b = el('backBtn');
  if (b) b.addEventListener('click', back);
}

/* Every question ends with "Something else", which opens a text box.
   Whatever she types becomes the answer and prints on the ticket. */
function askQuestion(opts) {
  const { key, eyebrow, title, sub, options, selected, onPick } = opts;
  const placeholder = opts.placeholder || t('typeItHere');
  const inputType = opts.inputType || 'text';
  const isOther = selected === OTHER;

  const tiles = [...options, {
    id: OTHER, emoji: '✏️', label: t('somethingElse'), note: opts.otherNote || t('yourIdea'),
  }];

  /* His shortlist. Star anything and the rest become decoys: they still
     look pressable, they just refuse to be pressed. Including "Something
     else", or the shortlist would mean nothing. */
  const favs = opts.favorites || [];
  const gated = favs.length > 0;
  const isFav = (id) => favs.includes(id);
  const tileState = (id) => (!gated ? '' : isFav(id) ? 'fav' : 'decoy');

  /* Two shapes of tile: the plain one, and — when the question is about
     things you have to see to choose between — a photo card. "Something
     else" stays plain either way; there is no photo of an idea. */
  const tile = (o) => (opts.gallery && o.id !== OTHER ? `
      <button class="opt shot-card ${selected === o.id ? 'selected' : ''}" data-id="${esc(o.id)}">
        ${o.img
          ? `<img class="shot" src="${esc(o.img)}" alt="${esc(o.label)}" loading="lazy">`
          : `<div class="shot ph">${o.emoji || '🚗'}</div>`}
        <span class="card-body">
          <span>${esc(o.label)}</span>
          ${o.note ? `<span class="note">${esc(o.note)}</span>` : ''}
        </span>
      </button>` : `
      <button class="opt ${tileState(o.id)} ${selected === o.id ? 'selected' : ''}" data-id="${esc(o.id)}">
        ${o.emoji ? `<span class="emoji">${o.emoji}</span>` : ''}
        <span>${esc(o.label)}</span>
        ${o.note ? `<span class="note">${esc(o.note)}</span>` : ''}
      </button>`);

  stageEl().innerHTML = `
    ${head(eyebrow, title, sub)}
    <div class="grid ${opts.oneCol ? 'one' : ''} ${opts.gallery ? 'gallery' : ''}">${
      tiles.map(tile).join('')}</div>
    ${gated ? `<div class="taunt grid-taunt" id="gridTaunt"></div>` : ''}
    <div class="other-box ${isOther ? '' : 'hide'}" id="otherBox">
      <input id="otherInput" type="${inputType}" placeholder="${esc(placeholder)}"
             value="${esc(state.other[key] || '')}" autocomplete="off">
      <button class="btn primary" id="otherGo">${esc(t('thatsTheOne'))}</button>
    </div>
    ${backLink()}`;

  const box = el('otherBox');
  const input = el('otherInput');

  const commit = () => {
    const v = input.value.trim();
    if (!v) { input.focus(); return; }
    state.other[key] = v;
    onPick(OTHER);
  };

  stageEl().querySelectorAll('.opt').forEach((b) => {
    if (gated && !isFav(b.dataset.id)) { wireDecoy(b); return; }
    b.addEventListener('click', () => {
      if (b.dataset.id === OTHER) {
        box.classList.remove('hide');
        stageEl().querySelectorAll('.opt').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        input.focus();
        return;
      }
      onPick(b.dataset.id);
    });
  });

  el('otherGo').addEventListener('click', commit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
  wireBack();
}

/* Turn a stored answer back into words for the ticket. */
function resolveLabel(key, options, value) {
  if (value === OTHER) return state.other[key] || t('somethingElse');
  const o = (options || []).find((x) => x.id === value);
  return o ? o.label : '';
}

/* ---------------- views ---------------- */

const VIEWS = {};

VIEWS.envelope = function () {
  stageEl().innerHTML = `
    <div class="envelope" id="env">
      <div class="body"></div>
      <div class="flap"></div>
      <div class="seal">${esc((cfg.from[0] || 'E').toUpperCase())}</div>
    </div>
    <div style="text-align:center">
      <div class="eyebrow" style="margin-bottom:10px">${esc(t('resSystem'))} · ${esc(REF)}</div>
      <h1>${t('envTitle')}</h1>
      <p class="sub" style="margin:0 auto 26px">${esc(t('envFor', { to: cfg.to, from: cfg.from }))}</p>
      <button class="btn primary" id="openBtn">${esc(t('envOpen'))}</button>
      <div class="tiny" style="margin-top:14px">${esc(t('envTap'))}</div>
    </div>`;
  el('openBtn').addEventListener('click', next);
  el('env').addEventListener('click', next);
};

VIEWS.ask = function () {
  stageEl().innerHTML = `
    <div class="eyebrow">${esc(t('q01'))}</div>
    <h1>${t('askTitle', { to: esc(cfg.to) })}</h1>
    <p class="sub">${esc(t('askSub'))}</p>
    <div class="duel" id="duel">
      <button class="btn primary" id="yesBtn">${esc(t('yes'))}</button>
      <button class="btn" id="noBtn">${esc(NO_LABELS[0])}</button>
      <div class="taunt" id="taunt"></div>
    </div>`;

  el('yesBtn').addEventListener('click', () => next());
  setupImpossibleNo();
};

VIEWS.celebrate = function () {
  stageEl().innerHTML = `
    <div class="party">
      ${sceneCard('pop pop-1')}
      <div class="big-emoji pop pop-1">🎉</div>
      <div class="eyebrow pop pop-2" style="margin-bottom:10px">${esc(t('answerRecorded'))}</div>
      <h1 class="pop pop-2" style="font-size:clamp(38px,12vw,58px)">${esc(t('knewIt'))}</h1>
      <p class="sub pop pop-3" style="margin:0 auto 28px">
        ${esc(state.noAttempts > 0
          ? t('triedOther', { n: state.noAttempts, s: state.noAttempts > 1 ? 's' : '' })
          : t('noHesitation'))}
      </p>
      <button class="btn primary pop pop-4" id="go">${esc(t('planIt'))}</button>
    </div>`;
  el('go').addEventListener('click', next);
  celebrate(3);
};

VIEWS.activity = function () {
  const options = ACTIVITIES.filter((a) => cfg.activities.includes(a.id));
  const favs = cfg.favorites || [];
  // Starring everything is the same as starring nothing.
  const gated = favs.length > 0 && favs.length < options.length + 1;

  askQuestion({
    key: 'activity',
    eyebrow: t('q02'),
    title: t('actTitle'),
    sub: gated ? esc(t('actSubGated', { from: cfg.from })) : esc(t('actSub')),
    options,
    favorites: gated ? favs : [],
    selected: state.activity,
    placeholder: 'Whatever you actually want to do…',
    otherNote: 'you name it',
    onPick: (id) => {
      state.activity = id;
      state.answers = {};
      state.spot = null;
      rebuildQueue();
      next();
    },
  });
};

function renderFollowUp(stepId) {
  const flow = FLOWS[state.activity] || [];
  const step = flow.find((s) => s.id === stepId);
  if (!step) { next(); return; }

  askQuestion({
    key: 'f:' + step.id,
    eyebrow: activityLabel(),
    title: step.q,
    sub: step.sub || '',
    options: step.options,
    selected: state.answers[step.id],
    onPick: (id) => {
      state.answers[step.id] = id;
      // Recommendations depend on these answers, so recompute the tail.
      const pos = state.stage;
      rebuildQueue();
      state.stage = pos;
      next();
    },
  });
}

VIEWS.recs = function () {
  const recs = buildRecs(state.activity, state.answers, cfg.city);
  const anyPlace = recs.some((r) => r.place);

  // She may have gone back and changed an answer — drop a spot that
  // is no longer on the list.
  if (state.spot && !recs.some((r) => r.place && r.name === state.spot)) state.spot = null;

  stageEl().innerHTML = `
    ${head(t('suggestions'), esc(t('homework')),
      esc(anyPlace ? t('recsSubPlaces') : t('recsSubIdeas')))}
    <div id="recList">${recs.map((r, i) => `
      <div class="rec ${r.place && state.spot === r.name ? 'selected' : ''}" data-i="${i}">
        <div class="rec-main">
          <div class="rec-name">${esc(r.name)}</div>
          <div class="rec-note">${esc(r.note)}</div>
        </div>
        <a class="maps" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(t('openMaps'))}</a>
      </div>`).join('')}
    </div>
    <div class="other-box" style="margin-top:14px">
      <input id="ownSpot" type="text" placeholder="${esc(t('somewhereElse'))}"
             value="${esc(state.spot && !recs.some((r) => r.name === state.spot) ? state.spot : '')}">
      <button class="btn primary" id="ownGo">${esc(t('useThis'))}</button>
    </div>
    <button class="btn primary" id="cont" style="margin-top:16px">${esc(t('continue'))}</button>
    <div class="btn-row">
      ${state.stage > 3 ? `<button class="btn ghost" id="backBtn">${esc(t('back'))}</button>` : ''}
      ${anyPlace ? `<button class="btn ghost" id="skip">${esc(t('surpriseMe'))}</button>` : ''}
    </div>`;

  stageEl().querySelectorAll('.rec').forEach((card) => {
    const rec = recs[+card.dataset.i];
    card.addEventListener('click', (e) => {
      if (e.target.closest('.maps')) return;
      // Idea cards aren't venues — tapping one just opens it.
      if (!rec.place) { window.open(rec.url, '_blank', 'noopener'); return; }
      state.spot = state.spot === rec.name ? null : rec.name;
      VIEWS.recs();
    });
  });

  el('ownGo').addEventListener('click', () => {
    const v = el('ownSpot').value.trim();
    if (!v) { el('ownSpot').focus(); return; }
    state.spot = v;
    next();
  });
  el('cont').addEventListener('click', next);
  const skip = el('skip');
  if (skip) skip.addEventListener('click', () => { state.spot = null; next(); });
  wireBack();
};

VIEWS.dress = function () {
  askQuestion({
    key: 'dress',
    eyebrow: t('dressCode'),
    title: t('dressTitle'),
    options: DRESS,
    selected: state.dress,
    placeholder: t('dressPh'),
    onPick: (id) => { state.dress = id; next(); },
  });
};

/* When he listed specific dates, that list is the whole truth: the
   weekday rules stop mattering and everything else is closed. */
const OK_DATES = (cfg.okDates || []).length ? new Set(cfg.okDates) : null;

VIEWS.date = function () {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (!state.calMonth) {
    // Open on the first month that actually has something in it, or she
    // lands on a page of crossed-out days and has to go hunting.
    const first = OK_DATES ? cfg.okDates[0].split('-') : null;
    state.calMonth = first
      ? new Date(+first[0], +first[1] - 1, 1)
      : new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const last = new Date(today);
  last.setDate(last.getDate() + (cfg.horizon || 60));
  if (OK_DATES) {
    // Never let the horizon hide a day he explicitly offered.
    const latest = cfg.okDates[cfg.okDates.length - 1].split('-');
    const l = new Date(+latest[0], +latest[1] - 1, +latest[2]);
    if (l > last) last.setTime(l.getTime());
  }

  stageEl().innerHTML = `
    ${head(t('availability'), esc(t('pickTheDay')),
      esc(OK_DATES ? t('dateSubOnly', { from: cfg.from }) : t('dateSub', { from: cfg.from })))}
    <div class="cal" id="cal"></div>
    <button class="btn primary" id="cont" ${state.date ? '' : 'disabled'}>
      ${state.date ? esc(fmtLong(state.date)) + ' →' : esc(t('chooseDay'))}
    </button>
    ${backLink()}`;

  drawCalendar(today, last);
  el('cont').addEventListener('click', next);
  wireBack();
};

function drawCalendar(today, last) {
  const m = state.calMonth;
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const prevOk = first > new Date(today.getFullYear(), today.getMonth(), 1);
  const nextOk = new Date(m.getFullYear(), m.getMonth() + 1, 1) <= last;

  let cells = '';
  for (let i = 0; i < first.getDay(); i++) cells += `<button class="day blank"></button>`;
  for (let d = 1; d <= days; d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d);
    const dow = date.getDay();
    const off = date < today || date > last
      || (OK_DATES ? !OK_DATES.has(isoDate(date)) : (cfg.blockedDays || []).includes(dow));
    const sel = state.date && date.getTime() === state.date.getTime();
    cells += `<button class="day ${off ? 'off' : ''} ${dow === 5 || dow === 6 ? 'weekend' : ''} ${sel ? 'selected' : ''}"
                data-d="${d}">${d}</button>`;
  }

  el('cal').innerHTML = `
    <div class="cal-head">
      <button class="cal-nav" id="prevM" ${prevOk ? '' : 'disabled'}>${isRTL() ? '›' : '‹'}</button>
      <div class="month">${m.toLocaleDateString(LOCALE[LANG], { month: 'long', year: 'numeric' })}</div>
      <button class="cal-nav" id="nextM" ${nextOk ? '' : 'disabled'}>${isRTL() ? '‹' : '›'}</button>
    </div>
    <div class="cal-grid">
      ${DOW[LANG].map((d) => `<div class="cal-dow">${d}</div>`).join('')}
      ${cells}
    </div>`;

  el('prevM').addEventListener('click', () => {
    state.calMonth = new Date(m.getFullYear(), m.getMonth() - 1, 1);
    VIEWS.date();
  });
  el('nextM').addEventListener('click', () => {
    state.calMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    VIEWS.date();
  });
  el('cal').querySelectorAll('.day[data-d]').forEach((b) => {
    if (b.classList.contains('off')) return;
    b.addEventListener('click', () => {
      state.date = new Date(m.getFullYear(), m.getMonth(), +b.dataset.d);
      VIEWS.date();
    });
  });
}

/* ---------------- sunset-aware time ---------------- */

/* Did she ask for sunset anywhere in her answers? */
function wantsSunset() {
  const a = state.answers;
  return a.vibe === 'sunset' || a.when === 'sunset' || a.when === 'golden';
}

function sunsetToday() {
  const c = coordsFor(cfg.city);
  if (!c || !state.date) return null;
  return sunsetFor(state.date, c[0], c[1]);
}

const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

/* Four slots around the actual sunset for the day she picked. */
function sunsetTimes(sunset) {
  const mins = sunset.getHours() * 60 + sunset.getMinutes();
  const base = Math.floor(mins / 30) * 30;
  return [-30, 0, 30, 60].map((off) => {
    const t = base + off;
    const id = String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
    const d = t - mins;
    const N = LANG === 'he' ? HE_SUNSET_NOTES : {
      early: 'early, while it is still bright',
      just: 'just before it drops. this one.',
      at: 'right as it goes down',
      after: 'just after, when the sky goes blue',
      dark: 'after dark, straight to dinner',
    };
    let emoji = '🌇', note;
    if (d <= -40) { emoji = '☀️'; note = N.early; }
    else if (d <= -10) { emoji = '🌅'; note = N.just; }
    else if (d <= 10) { emoji = '🌇'; note = N.at; }
    else if (d <= 40) { emoji = '🌆'; note = N.after; }
    else { emoji = '🌙'; note = N.dark; }
    return { id, emoji, label: id, note };
  });
}

VIEWS.time = function () {
  const sunset = wantsSunset() ? sunsetToday() : null;
  const options = sunset ? sunsetTimes(sunset) : TIMES;

  askQuestion({
    key: 'time',
    eyebrow: sunset ? t('sunsetAround', { t: hhmm(sunset) }) : fmtLong(state.date),
    title: sunset ? t('sunsetTitle') : t('andWhatTime'),
    sub: sunset
      ? esc(t('sunsetSub', { d: fmtShort(state.date), t: hhmm(sunset), city: cfg.city }))
      : '',
    options,
    selected: state.time,
    inputType: 'time',
    placeholder: t('pickATime'),
    otherNote: t('differentHour'),
    onPick: (id) => { state.time = id; next(); },
  });
};

/* The last real choice: what turns up outside her building. */
VIEWS.ride = function () {
  askQuestion({
    key: 'ride',
    eyebrow: t('thePickup'),
    title: t('rideTitle'),
    sub: esc(t('rideSub', { from: cfg.from })),
    options: RIDES,
    selected: state.ride,
    gallery: true,
    placeholder: t('ridePh'),
    otherNote: t('rideOther'),
    onPick: (id) => { state.ride = id; next(); },
  });
};

VIEWS.terms = function () {
  if (!state.terms.length) state.terms = TERMS.map((t) => !!t.locked);

  stageEl().innerHTML = `
    ${head(t('termsEyebrow'), esc(t('finePrint')), esc(t('termsSub')))}
    <div class="terms">
      ${TERMS.map((t, i) => `
        <div class="term ${state.terms[i] ? 'on' : ''} ${t.locked ? 'locked' : ''}" data-i="${i}">
          <div class="box">✓</div>
          <div>${esc(t.text)}${t.note ? `<div class="tiny" style="margin-top:3px">${esc(t.note)}</div>` : ''}</div>
        </div>`).join('')}
    </div>
    <button class="btn primary" id="cont">${esc(t('iAccept'))}</button>
    ${backLink()}`;

  stageEl().querySelectorAll('.term').forEach((row) => {
    row.addEventListener('click', () => {
      const i = +row.dataset.i;
      if (TERMS[i].locked) { shake(row); return; }
      state.terms[i] = !state.terms[i];
      VIEWS.terms();
    });
  });
  el('cont').addEventListener('click', next);
  wireBack();
};

VIEWS.confirming = function () {
  stageEl().innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      <div class="line" id="line"></div>
    </div>`;
  let i = 0;
  const tick = () => {
    if (!el('line')) return;
    if (i >= LOADING_LINES.length) { next(); return; }
    el('line').textContent = LOADING_LINES[i++];
    setTimeout(tick, i === LOADING_LINES.length ? 700 : 950);
  };
  tick();
};

/* The big one. Booking confirmed. */
VIEWS.party = function () {
  stageEl().innerHTML = `
    <div class="party">
      <div class="big-emoji pop pop-1">🎊</div>
      <div class="eyebrow pop pop-1">${esc(t('bookingConfirmed'))} · ${esc(REF)}</div>
      <h1 class="party-title pop pop-2">${t('itsOfficial')}</h1>
      <div class="party-lines">
        <div class="party-line pop pop-3">${esc(fmtLong(state.date))} · ${esc(state.time)}</div>
        <div class="party-line pop pop-4">${esc(summaryTitle())}</div>
        <div class="party-line pop pop-5">${esc(state.spot || cityFallback())}</div>
        ${rideLabel() ? `<div class="party-line pop pop-5">${esc(t('pickupLine', { x: rideLabel() }))}</div>` : ''}
      </div>
      ${sceneCard('pop pop-5')}
      <button class="btn ghost" id="saveScene" style="margin-bottom:20px">${esc(t('savePicture'))}</button>
      <p class="sub pop pop-6" style="margin:26px auto 26px">
        ${esc(t('partySub', { to: cfg.to, from: cfg.from }))}
      </p>
      <button class="btn primary pop pop-7" id="go">${esc(t('oneLastThing'))}</button>
    </div>`;

  el('go').addEventListener('click', next);
  el('saveScene').addEventListener('click', () =>
    downloadScene(sceneMarkup(), `${cfg.from}-and-${cfg.to}-${REF}.png`));
  celebrate(6);
};

VIEWS.contact = function () {
  stageEl().innerHTML = `
    ${head(t('almostDone'), t('contactTitle'), esc(t('contactSub')))}
    <div class="field">
      <label>${esc(t('yourPhone'))}</label>
      <input id="ph" type="tel" inputmode="tel" placeholder="05x-xxx-xxxx" value="${esc(state.contact.phone)}">
    </div>
    <div class="field">
      <label>${esc(t('yourEmail'))}</label>
      <input id="em" type="email" inputmode="email" placeholder="you@email.com" value="${esc(state.contact.email)}">
      <div class="hint">${esc(t('emailHint', { from: cfg.from }))}</div>
    </div>
    <button class="btn primary" id="cont">${esc(t('showTicket'))}</button>
    ${backLink()}`;

  el('cont').addEventListener('click', () => {
    state.contact.phone = el('ph').value.trim();
    state.contact.email = el('em').value.trim();
    next();
  });
  wireBack();
};

VIEWS.ticket = function () {
  const { start } = eventTimes();
  const what = summaryTitle();
  const where = state.spot || cityFallback();

  stageEl().innerHTML = `
    <div class="ticket">
      <div class="ticket-top">
        <div class="ticket-brand"><span>${esc(t('confirmedRes'))}</span><span>${esc(REF)}</span></div>
        <h2>${esc(t('itsADate'))}</h2>
        <div class="who">${esc(cfg.from)} &nbsp;+&nbsp; ${esc(cfg.to)}</div>
        <div class="ticket-rows">
          <div class="trow"><div class="k">${esc(t('kDate'))}</div><div class="v">${esc(fmtShort(state.date))}</div></div>
          <div class="trow"><div class="k">${esc(t('kTime'))}</div><div class="v">${esc(state.time)}</div></div>
          <div class="trow wide"><div class="k">${esc(t('kPlan'))}</div><div class="v">${esc(what)}</div></div>
          <div class="trow"><div class="k">${esc(t('kWhere'))}</div><div class="v">${esc(where)}</div></div>
          <div class="trow"><div class="k">${esc(t('kDress'))}</div><div class="v">${esc(dressLabel())}</div></div>
          ${rideLabel() ? `<div class="trow wide"><div class="k">${esc(t('kPickup'))}</div><div class="v">${esc(rideLabel())}</div></div>` : ''}
          ${cfg.note ? `<div class="trow wide"><div class="k">${esc(t('kNote'))}</div><div class="v" style="font-weight:400">${esc(cfg.note)}</div></div>` : ''}
        </div>
      </div>
      <div class="perf"></div>
      <div class="ticket-bottom">
        <div class="barcode"></div>
        <div class="ref-no">${t('noRefunds')}</div>
      </div>
    </div>

    ${sceneCard()}

    <!-- A real link, and deliberately not target="_blank". She will almost
         certainly open this invitation inside WhatsApp's own in-app browser,
         where _blank is a no-op and the button appears to do nothing. Same
         tab always works; wa.me shows its own "continue to chat" page. -->
    <a class="btn primary" id="tellHim" href="${esc(waLink())}"
       style="text-decoration:none;text-align:center;display:block">${esc(t('sendItTo', { from: cfg.from }))}</a>
    <div class="btn-row">
      <button class="btn ghost" id="ics">${esc(t('addToCalendar'))}</button>
      <a class="btn ghost" style="text-decoration:none;text-align:center" target="_blank" rel="noopener"
         href="${esc(gcalLink())}">${esc(t('googleCalendar'))}</a>
    </div>
    <div class="tiny" style="text-align:center;margin-top:12px">
      ${esc(t('waDidntOpen'))} <a href="#" id="copyMsg" style="color:var(--pink-soft)">${esc(t('copyInstead'))}</a>
    </div>
    <div class="tiny" style="text-align:center;margin-top:14px">
      ${esc(t('countdown'))} <span id="cd">—</span>
    </div>
    <button class="btn ghost" id="cont" style="margin-top:18px">${esc(t('oneMoreThing'))}</button>`;

  // Rebuild the href at click time — she may have gone back and changed
  // something after this screen was first drawn.
  el('tellHim').addEventListener('click', (e) => { e.currentTarget.href = waLink(); });
  el('copyMsg').addEventListener('click', async (e) => {
    e.preventDefault();
    const ok = await copyText(bookingMessage());
    e.target.textContent = ok ? t('copiedPaste') : t('copyFailed');
  });
  el('ics').addEventListener('click', downloadIcs);
  el('cont').addEventListener('click', next);

  const cd = el('cd');
  const tickCd = () => {
    if (!document.body.contains(cd)) return;
    const ms = start - new Date();
    if (ms <= 0) { cd.textContent = t('itsHappening'); return; }
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const mn = Math.floor(ms / 60000) % 60;
    cd.textContent = `${d}${t('dDay')} ${h}${t('dHour')} ${mn}${t('dMin')}`;
    setTimeout(tickCd, 30000);
  };
  tickCd();
};

VIEWS.receipt = function () {
  const rows = [
    [t('rNoAttempts'), state.noAttempts],
    ...(state.decoyAttempts ? [[t('rRanAway'), state.decoyAttempts]] : []),
    [t('rEscapes'), 0],
    [t('rAnswered'), 4 + Object.keys(state.answers).length + (state.ride ? 1 : 0)],
    [t('rCancel'), '0%'],
    [t('rRef'), REF],
  ];

  stageEl().innerHTML = `
    ${head(t('receipt'), esc(t('forTheRecord')), esc(t('receiptSub')))}
    <div class="panel">
      ${rows.map(([k, v]) => `<div class="stat"><span>${esc(k)}</span><span class="val">${esc(v)}</span></div>`).join('')}
    </div>
    <p class="sub">${esc(t('seeYou', { d: fmtShort(state.date), t: state.time }))}</p>
    <div class="btn-row">
      <button class="btn ghost" id="againBtn">${esc(t('backToTicket'))}</button>
      <button class="btn ghost" id="restart">${esc(t('startOver'))}</button>
    </div>`;

  el('againBtn').addEventListener('click', back);
  el('restart').addEventListener('click', () => {
    Object.assign(state, {
      stage: 0, queue: BASE_QUEUE.slice(), activity: null, answers: {}, other: {},
      spot: null, dress: null, ride: null, date: null, time: null, terms: [],
      noAttempts: 0, decoyAttempts: 0, calMonth: null,
    });
    render();
  });
};

/* ---------------- the picture ---------------- */

/* Always available, because it is drawn rather than fetched. */
function sceneMarkup() {
  return dateScene({
    from: cfg.from,
    to: cfg.to,
    activity: state.activity,
    answers: state.answers,
    time: state.time,
    dateStr: state.date ? fmtLong(state.date) : '',
    faces: { me: cfg.faceMe, her: cfg.faceHer },
  });
}

function sceneCard(cls) {
  return `<div class="scene ${cls || ''}">${sceneMarkup()}</div>`;
}

/* ---------------- the options she can't have ---------------- */

/* Same joke as the No button, applied to a grid. The tile keeps its cell
   so the layout never collapses; only the transform moves, away from
   wherever her finger is, and it stays where it lands. */
function wireDecoy(node) {
  let ox = 0;   // where it has fled to so far, tracked by hand because
  let oy = 0;   // getBoundingClientRect() already includes the transform

  const bump = (px, py) => {
    state.decoyAttempts++;
    const n = state.decoyAttempts;
    const b = node.getBoundingClientRect();
    const a = px == null
      ? Math.random() * Math.PI * 2
      : Math.atan2((b.top + b.height / 2) - py, (b.left + b.width / 2) - px);

    // It keeps fleeing until it runs out of page. Clamp against where the
    // tile would sit untransformed, or it escapes off the side of the phone.
    const d = 58 + Math.random() * 46;
    ox = Math.max(8 - (b.left - ox),
         Math.min(innerWidth - 8 - (b.right - ox), ox + Math.cos(a) * d));
    oy = Math.max(-90, Math.min(90, oy + Math.sin(a) * d));

    node.style.transform = `translate(${ox}px, ${oy}px)`
      + ` rotate(${(Math.random() - 0.5) * 14}deg)`
      + ` scale(${Math.max(0.72, 1 - n * 0.015)})`;
    node.style.zIndex = '6';

    const taunt = el('gridTaunt');
    if (taunt) {
      taunt.textContent = DECOY_TAUNTS[(n - 1) % DECOY_TAUNTS.length];
      taunt.classList.remove('pop');
      void taunt.offsetWidth;
      taunt.classList.add('pop');
    }
  };

  node.addEventListener('pointerenter', (e) => bump(e.clientX, e.clientY));
  ['pointerdown', 'touchstart', 'mousedown'].forEach((ev) => {
    node.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.touches ? e.touches[0] : e;
      bump(t.clientX, t.clientY);
    }, { passive: false });
  });

  // No keyboard route either.
  node.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  node.setAttribute('tabindex', '-1');
}

/* ---------------- the endless No ---------------- */

function setupImpossibleNo() {
  const duel = el('duel');
  const no = el('noBtn');
  const yes = el('yesBtn');
  const taunt = el('taunt');
  let curW = 0;   // tracked by hand — the CSS width transition makes
  let curH = 0;   // getBoundingClientRect() report stale numbers mid-animation.

  const dodge = (px, py) => {
    state.noAttempts++;
    const n = state.noAttempts;
    const box = duel.getBoundingClientRect();

    if (n === 1) {
      // Shrink it straight away so it has room to actually run around.
      const r = no.getBoundingClientRect();
      curH = r.height;
      curW = Math.min(r.width, Math.max(130, box.width * 0.42));
    }

    // It shrinks to a floor and stays there. It never disappears —
    // she can keep chasing it for as long as she finds it funny.
    curW = Math.max(92, curW * 0.93);
    no.textContent = NO_LABELS[n % NO_LABELS.length];
    no.style.width = curW + 'px';
    no.style.padding = '13px 10px';
    no.style.fontSize = Math.max(12, 16 - n) + 'px';

    // Yes grows through height and weight, not width, so it never
    // pushes past the page gutter. It stops growing before it gets silly.
    yes.style.fontSize = Math.min(26, 19 + n) + 'px';
    yes.style.padding = Math.min(32, 19 + n * 2) + 'px 22px';
    yes.style.transform = `scale(${Math.min(1.03, 1 + n * 0.006)})`;

    const btn = { width: curW, height: curH || 50 };
    const maxX = Math.max(0, box.width - btn.width);
    const maxY = Math.max(0, box.height - btn.height - 24);

    // Try a few spots, keep the one furthest from the pointer.
    let best = { x: 0, y: 0, d: -1 };
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      const cx = box.left + x + btn.width / 2;
      const cy = box.top + y + btn.height / 2;
      const d = px == null ? Math.random() : Math.hypot(cx - px, cy - py);
      if (d > best.d) best = { x, y, d };
    }

    no.style.transform = `translate(${best.x}px, ${best.y - 78}px) rotate(${(Math.random() - 0.5) * 16}deg)`;
    taunt.textContent = TAUNTS[(n - 1) % TAUNTS.length];
    taunt.classList.remove('pop');
    void taunt.offsetWidth;
    taunt.classList.add('pop');

    // No keyboard route in either.
    no.setAttribute('tabindex', '-1');
    no.blur();
  };

  // Desktop: run away when the cursor gets close.
  if (setupImpossibleNo.hover) document.removeEventListener('pointermove', setupImpossibleNo.hover);
  setupImpossibleNo.hover = (e) => {
    if (!document.body.contains(no)) return;
    const b = no.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < b.width / 2 + 55) dodge(e.clientX, e.clientY);
  };
  document.addEventListener('pointermove', setupImpossibleNo.hover, { passive: true });

  // Touch: dodge on the way down, before the tap can land.
  ['pointerdown', 'touchstart', 'mousedown'].forEach((ev) => {
    no.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.touches ? e.touches[0] : e;
      dodge(t.clientX, t.clientY);
    }, { passive: false });
  });

  // Belt and braces: if it somehow gets clicked, it still doesn't count.
  no.addEventListener('click', (e) => {
    e.preventDefault();
    taunt.textContent = 'invalid input. try the other one.';
  });
}

/* ---------------- summary helpers ---------------- */

function activityLabel() {
  if (state.activity === OTHER) return state.other.activity || 'Her idea';
  const a = ACTIVITIES.find((x) => x.id === state.activity);
  return a ? a.label : '';
}

function dressLabel() {
  return resolveLabel('dress', DRESS, state.dress) || 'Whatever you want';
}

function rideLabel() {
  return state.ride ? resolveLabel('ride', RIDES, state.ride) : '';
}

function summaryTitle() {
  const base = activityLabel();
  const flow = FLOWS[state.activity] || [];
  const parts = flow
    .filter((step) => state.answers[step.id])
    .map((step) => resolveLabel('f:' + step.id, step.options, state.answers[step.id]))
    .filter(Boolean);
  if (state.activity === 'surprise') return 'A surprise';
  return parts.length ? `${base} — ${parts.join(' · ')}` : base;
}

/* When she didn't lock in a venue, print something better than the city. */
function cityFallback() {
  const a = state.answers;
  // Each entry is [translation key, the English it falls back to].
  const pick = (map, key, dflt) => (map[key] ? pl(map[key][0], map[key][1]) : dflt);

  switch (state.activity) {
    case 'food':     return a.vibe === 'home' ? pl('home', 'Home') : cfg.city;
    case 'italy':    return pick({ rome: ['rome', 'Rome'], florence: ['florence', 'Florence'],
                                   venice: ['venice', 'Venice'], amalfi: ['amalfi', 'Amalfi Coast'],
                                   milan: ['milan', 'Milan'] }, a.city, pl('italy', 'Italy'));
    case 'cook':     return a.who === 'order' ? pl('sofa', 'The sofa') : pl('kitchen', 'The kitchen');
    case 'surprise': return pl('findOut', "You'll find out");
    case 'nothing':  return pick({ mine: ['mine', 'My place'], yours: ['yours', 'Your place'],
                                   beach: ['beach', 'The beach'], bed: ['bed', 'Bed'] },
                                 a.where, pl('soft', 'Somewhere soft'));
    case 'movie':    return pick({ fort: ['fort', 'The blanket fort'], roof: ['roof', 'The roof'],
                                   car: ['car', 'The car'] }, a.where, cfg.city);
    case 'trip':     return pick({ north: ['north', 'North'], desert: ['desert', 'The desert'],
                                   coast: ['coast', 'Up the coast'], jlm: ['jlm', 'Jerusalem'] },
                                 a.direction, cfg.city);
    case 'moto':     return pick({ north: ['galilee', 'The Galilee'], carmel: ['carmel', 'The Carmel'],
                                   jlm: ['judean', 'The Judean hills'], desert: ['deadsea', 'The Dead Sea road'],
                                   coast: ['coast', 'Up the coast'] }, a.where, pl('openroad', 'The open road'));
    default:         return cfg.city;
  }
}

function eventTimes() {
  const m = /(\d{1,2}):(\d{2})/.exec(state.time || '');
  const h = m ? +m[1] : 20;
  const mi = m ? +m[2] : 0;
  const start = new Date(state.date);
  start.setHours(h, mi, 0, 0);
  const end = new Date(start.getTime() + 3 * 3600 * 1000);
  return { start, end };
}

function fmtLong(d) {
  return d ? d.toLocaleDateString(LOCALE[LANG], { weekday: 'long', day: 'numeric', month: 'long' }) : '';
}

function fmtShort(d) {
  return d ? d.toLocaleDateString(LOCALE[LANG], { weekday: 'short', day: 'numeric', month: 'short' }) : '';
}

function eventTitle() { return t('evTitle', { from: cfg.from }); }

function eventDetails() {
  return [
    summaryTitle(),
    t('evWhere', { x: state.spot || cityFallback() }),
    t('evDress', { x: dressLabel() }),
    rideLabel() ? t('evPickup', { x: rideLabel() }) : '',
    cfg.note || '',
    t('evRef', { r: REF }),
  ].filter(Boolean).join('\n');
}

/* ---------------- calendar export ---------------- */

function utcStamp(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function downloadIcs() {
  const { start, end } = eventTimes();
  const escIcs = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//date-app//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${REF}-${utcStamp(start)}@date-app`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escIcs(eventTitle())}`,
    `DESCRIPTION:${escIcs(eventDetails())}`,
    `LOCATION:${escIcs(state.spot || cityFallback())}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escIcs(t('evAlarm', { from: cfg.from }))}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `date-${REF}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function gcalLink() {
  const { start, end } = eventTimes();
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(),
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    details: eventDetails(),
    location: state.spot || cityFallback(),
  });
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}

/* ---------------- telling him ---------------- */

/* null drops the line, '' is a deliberate blank one. */
function bookingMessage() {
  return [
    t('waSaidYes', { to: cfg.to }),
    '',
    t('waWhen', { d: fmtLong(state.date), t: state.time }),
    `🎯 ${summaryTitle()}`,
    `📍 ${state.spot || cityFallback()}`,
    `👗 ${dressLabel()}`,
    rideLabel() ? t('waPickHerUp', { x: rideLabel() }) : null,
    state.contact.phone ? `📱 ${state.contact.phone}` : null,
    state.contact.email ? `✉️ ${state.contact.email}` : null,
    '',
    t('waTried', { n: state.noAttempts, r: REF }),
  ].filter((l) => l !== null).join('\n');
}

/* wa.me needs a full international number in digits. A number typed as
   05x-xxx-xxxx opens WhatsApp and then says it doesn't exist, which
   reads as "the app didn't send anything" — hence waNumber(). */
function waLink() {
  const digits = waNumber(cfg.phone, cfg.cc);
  const text = encodeURIComponent(bookingMessage());
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

/* navigator.clipboard needs a secure context, which a page opened
   straight off the filesystem is not. Fall back to the old way. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
    return ok;
  }
}

/* ---------------- effects ---------------- */

function shake(node) {
  node.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
     { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
    { duration: 260, easing: 'ease-in-out' }
  );
}

/* A run of bursts from alternating corners, so it actually feels
   like something happened rather than one polite puff. */
function celebrate(rounds) {
  const spots = [
    [0.5, 0.42], [0.12, 0.3], [0.88, 0.3], [0.5, 0.2], [0.2, 0.55], [0.8, 0.55],
  ];
  for (let i = 0; i < rounds; i++) {
    const s = spots[i % spots.length];
    setTimeout(() => burst(s[0], s[1], i === 0 ? 110 : 70), i * 320);
  }
}

let confettiBits = [];
let confettiRaf = 0;

function burst(ox, oy, count) {
  const canvas = el('confetti');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== innerWidth * dpr || canvas.height !== innerHeight * dpr) {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ['#dc21b8', '#4ac0fc', '#ff5fd6', '#8f5cff', '#ffffff'];
  for (let i = 0; i < (count || 90); i++) {
    confettiBits.push({
      x: innerWidth * (ox == null ? 0.5 : ox) + (Math.random() - 0.5) * 120,
      y: innerHeight * (oy == null ? 0.42 : oy),
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 14 - 4,
      r: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0],
      life: 1,
    });
  }

  if (confettiRaf) return;
  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    confettiBits = confettiBits.filter((b) => b.life > 0 && b.y < innerHeight + 40);
    confettiBits.forEach((b) => {
      b.vy += 0.32;
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vr;
      b.life -= 0.005;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.r, -b.r * 0.5, b.r * 2, b.r);
      ctx.restore();
    });
    if (confettiBits.length) {
      confettiRaf = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      confettiRaf = 0;
    }
  };
  confettiRaf = requestAnimationFrame(draw);
}

/* ---------------- boot ---------------- */

el('refOut').textContent = t('ref', { r: REF });
el('brandOut').textContent = t('resSystem');
render();
