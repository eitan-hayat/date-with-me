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

const BASE_QUEUE = ['envelope', 'ask', 'celebrate', 'activity', '__flow__', 'recs',
                    'dress', 'date', 'time', 'terms', 'confirming', 'party',
                    'contact', 'ticket', 'receipt'];

const state = {
  stage: 0,
  queue: BASE_QUEUE.slice(),
  activity: null,
  answers: {},       // follow-up answers, keyed by step id
  other: {},         // free text she typed, keyed by question
  spot: null,        // chosen recommendation
  dress: null,
  date: null,        // Date at local midnight
  time: null,
  contact: { phone: '', email: '' },
  terms: [],
  noAttempts: 0,
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
  el('step').textContent = shown ? `Step ${state.stage} of ${state.queue.length - 1}` : '';
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
    ? `<button class="btn ghost" id="backBtn" style="margin-top:6px">← back</button>`
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
  const placeholder = opts.placeholder || 'Type it here…';
  const inputType = opts.inputType || 'text';
  const isOther = selected === OTHER;

  const tiles = [...options, {
    id: OTHER, emoji: '✏️', label: 'Something else', note: opts.otherNote || 'your idea',
  }];

  stageEl().innerHTML = `
    ${head(eyebrow, title, sub)}
    <div class="grid ${opts.oneCol ? 'one' : ''}">${tiles.map((o) => `
      <button class="opt ${selected === o.id ? 'selected' : ''}" data-id="${esc(o.id)}">
        ${o.emoji ? `<span class="emoji">${o.emoji}</span>` : ''}
        <span>${esc(o.label)}</span>
        ${o.note ? `<span class="note">${esc(o.note)}</span>` : ''}
      </button>`).join('')}</div>
    <div class="other-box ${isOther ? '' : 'hide'}" id="otherBox">
      <input id="otherInput" type="${inputType}" placeholder="${esc(placeholder)}"
             value="${esc(state.other[key] || '')}" autocomplete="off">
      <button class="btn primary" id="otherGo">That's the one</button>
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
  if (value === OTHER) return state.other[key] || 'Her idea';
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
      <div class="eyebrow" style="margin-bottom:10px">Reservation system · ${esc(REF)}</div>
      <h1>You have one<br>unopened invitation.</h1>
      <p class="sub" style="margin:0 auto 26px">For ${esc(cfg.to)}. From ${esc(cfg.from)}.</p>
      <button class="btn primary" id="openBtn">Open it</button>
      <div class="tiny" style="margin-top:14px">Tap the envelope. Nothing bad happens.</div>
    </div>`;
  el('openBtn').addEventListener('click', next);
  el('env').addEventListener('click', next);
};

VIEWS.ask = function () {
  stageEl().innerHTML = `
    <div class="eyebrow">Question 01 · required</div>
    <h1>${esc(cfg.to)}, do you want<br>to go on a date<br>with me?</h1>
    <p class="sub">Please select one option. Both are equally valid.</p>
    <div class="duel" id="duel">
      <button class="btn primary" id="yesBtn">Yes</button>
      <button class="btn" id="noBtn">No</button>
      <div class="taunt" id="taunt"></div>
    </div>`;

  el('yesBtn').addEventListener('click', () => next());
  setupImpossibleNo();
};

VIEWS.celebrate = function () {
  const photo = cfg.photoHer || cfg.photoUs;
  stageEl().innerHTML = `
    <div class="party">
      ${photo ? `<div class="polaroid pop pop-1"><img src="${esc(photo)}" alt=""><div class="cap">she said yes</div></div>` : ''}
      <div class="big-emoji pop pop-1">🎉</div>
      <div class="eyebrow pop pop-2" style="margin-bottom:10px">Answer recorded</div>
      <h1 class="pop pop-2" style="font-size:clamp(38px,12vw,58px)">I knew it.</h1>
      <p class="sub pop pop-3" style="margin:0 auto 28px">
        ${state.noAttempts > 0
          ? `You went for the other button ${state.noAttempts} time${state.noAttempts > 1 ? 's' : ''}. It was never going to work.`
          : 'No hesitation. Respect.'}
      </p>
      <button class="btn primary pop pop-4" id="go">Now let's plan it →</button>
    </div>`;
  el('go').addEventListener('click', next);
  celebrate(3);
};

VIEWS.activity = function () {
  askQuestion({
    key: 'activity',
    eyebrow: 'Question 02',
    title: 'What do you want<br>to do?',
    sub: 'Pick one. You can change your mind later, unlike with the last question.',
    options: ACTIVITIES.filter((a) => cfg.activities.includes(a.id)),
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
    ${head('Suggestions', 'I did some homework.', anyPlace
      ? 'Tap a place to lock it in, or skip it and we improvise. Every card opens in Maps.'
      : 'Nothing to decide here, just things to look at. Every card opens in Maps.')}
    <div id="recList">${recs.map((r, i) => `
      <div class="rec ${r.place && state.spot === r.name ? 'selected' : ''}" data-i="${i}">
        <div class="rec-main">
          <div class="rec-name">${esc(r.name)}</div>
          <div class="rec-note">${esc(r.note)}</div>
        </div>
        <a class="maps" href="${esc(r.url)}" target="_blank" rel="noopener">Open ↗</a>
      </div>`).join('')}
    </div>
    <div class="other-box" style="margin-top:14px">
      <input id="ownSpot" type="text" placeholder="Somewhere else? Name it…"
             value="${esc(state.spot && !recs.some((r) => r.name === state.spot) ? state.spot : '')}">
      <button class="btn primary" id="ownGo">Use this</button>
    </div>
    <button class="btn primary" id="cont" style="margin-top:16px">Continue</button>
    <div class="btn-row">
      ${state.stage > 3 ? `<button class="btn ghost" id="backBtn">← back</button>` : ''}
      ${anyPlace ? `<button class="btn ghost" id="skip">Surprise me instead</button>` : ''}
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
    eyebrow: 'Dress code',
    title: 'How are we<br>showing up?',
    options: DRESS,
    selected: state.dress,
    placeholder: 'Describe the outfit…',
    onPick: (id) => { state.dress = id; next(); },
  });
};

VIEWS.date = function () {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (!state.calMonth) state.calMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const last = new Date(today);
  last.setDate(last.getDate() + (cfg.horizon || 60));

  stageEl().innerHTML = `
    ${head('Availability', 'Pick the day.',
      `Greyed-out days are ones ${esc(cfg.from)} genuinely cannot do. Everything else is yours.`)}
    <div class="cal" id="cal"></div>
    <button class="btn primary" id="cont" ${state.date ? '' : 'disabled'}>
      ${state.date ? esc(fmtLong(state.date)) + ' →' : 'Choose a day'}
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
    const off = date < today || date > last || (cfg.blockedDays || []).includes(dow);
    const sel = state.date && date.getTime() === state.date.getTime();
    cells += `<button class="day ${off ? 'off' : ''} ${dow === 5 || dow === 6 ? 'weekend' : ''} ${sel ? 'selected' : ''}"
                data-d="${d}">${d}</button>`;
  }

  el('cal').innerHTML = `
    <div class="cal-head">
      <button class="cal-nav" id="prevM" ${prevOk ? '' : 'disabled'}>‹</button>
      <div class="month">${m.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
      <button class="cal-nav" id="nextM" ${nextOk ? '' : 'disabled'}>›</button>
    </div>
    <div class="cal-grid">
      ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="cal-dow">${d}</div>`).join('')}
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
    let emoji = '🌇', note;
    if (d <= -40) { emoji = '☀️'; note = 'early, while it is still bright'; }
    else if (d <= -10) { emoji = '🌅'; note = 'just before it drops. this one.'; }
    else if (d <= 10) { emoji = '🌇'; note = 'right as it goes down'; }
    else if (d <= 40) { emoji = '🌆'; note = 'just after, when the sky goes blue'; }
    else { emoji = '🌙'; note = 'after dark, straight to dinner'; }
    return { id, emoji, label: id, note };
  });
}

VIEWS.time = function () {
  const sunset = wantsSunset() ? sunsetToday() : null;
  const options = sunset ? sunsetTimes(sunset) : TIMES;

  askQuestion({
    key: 'time',
    eyebrow: sunset ? `Sunset is around ${hhmm(sunset)}` : fmtLong(state.date),
    title: sunset ? 'So what time do<br>we meet?' : 'And what time?',
    sub: sunset
      ? `You asked for sunset, so these are built around it. On ${fmtShort(state.date)} the sun goes down at about ${hhmm(sunset)} in ${esc(cfg.city)}.`
      : '',
    options,
    selected: state.time,
    inputType: 'time',
    placeholder: 'Pick a time',
    otherNote: 'a different hour',
    onPick: (id) => { state.time = id; next(); },
  });
};

VIEWS.terms = function () {
  if (!state.terms.length) state.terms = TERMS.map((t) => !!t.locked);

  stageEl().innerHTML = `
    ${head('Terms & conditions', 'The fine print.', 'Standard stuff. Please read carefully.')}
    <div class="terms">
      ${TERMS.map((t, i) => `
        <div class="term ${state.terms[i] ? 'on' : ''} ${t.locked ? 'locked' : ''}" data-i="${i}">
          <div class="box">✓</div>
          <div>${esc(t.text)}${t.note ? `<div class="tiny" style="margin-top:3px">${esc(t.note)}</div>` : ''}</div>
        </div>`).join('')}
    </div>
    <button class="btn primary" id="cont">I accept</button>
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
  const photo = cfg.photoUs || cfg.photoHer;
  stageEl().innerHTML = `
    <div class="party">
      <div class="big-emoji pop pop-1">🎊</div>
      <div class="eyebrow pop pop-1">Booking confirmed · ${esc(REF)}</div>
      <h1 class="party-title pop pop-2">IT'S<br>OFFICIAL.</h1>
      <div class="party-lines">
        <div class="party-line pop pop-3">${esc(fmtLong(state.date))} · ${esc(state.time)}</div>
        <div class="party-line pop pop-4">${esc(summaryTitle())}</div>
        <div class="party-line pop pop-5">${esc(state.spot || cityFallback())}</div>
      </div>
      ${photo ? `<div class="polaroid pop pop-5" style="transform:rotate(2.5deg);margin-top:26px"><img src="${esc(photo)}" alt=""><div class="cap">${esc(fmtShort(state.date))}</div></div>` : ''}
      <p class="sub pop pop-6" style="margin:26px auto 26px">
        ${esc(cfg.to)} said yes to ${esc(cfg.from)}, picked the plan, and put it in the diary.
        There is no undo button. There was never even a no button.
      </p>
      ${igRow('pop pop-6')}
      <button class="btn primary pop pop-7" id="go">One last thing →</button>
    </div>`;

  el('go').addEventListener('click', next);
  celebrate(6);
};

VIEWS.contact = function () {
  stageEl().innerHTML = `
    ${head('Almost done', 'Where do I send<br>the invite?',
      `It's booked. Now I just need somewhere to send it so it lands in your calendar
       and I stop asking whether you remembered.`)}
    <div class="field">
      <label>Your phone</label>
      <input id="ph" type="tel" inputmode="tel" placeholder="05x-xxx-xxxx" value="${esc(state.contact.phone)}">
    </div>
    <div class="field">
      <label>Your email, for the calendar invite</label>
      <input id="em" type="email" inputmode="email" placeholder="you@email.com" value="${esc(state.contact.email)}">
      <div class="hint">Optional. Nothing is stored anywhere, it goes straight to ${esc(cfg.from)}.</div>
    </div>
    <button class="btn primary" id="cont">Show me the ticket →</button>
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
        <div class="ticket-brand"><span>Confirmed reservation</span><span>${esc(REF)}</span></div>
        <h2>It's a date.</h2>
        <div class="who">${esc(cfg.from)} &nbsp;+&nbsp; ${esc(cfg.to)}</div>
        ${igRow('', true)}
        <div class="ticket-rows">
          <div class="trow"><div class="k">Date</div><div class="v">${esc(fmtShort(state.date))}</div></div>
          <div class="trow"><div class="k">Time</div><div class="v">${esc(state.time)}</div></div>
          <div class="trow wide"><div class="k">Plan</div><div class="v">${esc(what)}</div></div>
          <div class="trow"><div class="k">Where</div><div class="v">${esc(where)}</div></div>
          <div class="trow"><div class="k">Dress code</div><div class="v">${esc(dressLabel())}</div></div>
          ${cfg.note ? `<div class="trow wide"><div class="k">Note</div><div class="v" style="font-weight:400">${esc(cfg.note)}</div></div>` : ''}
        </div>
      </div>
      <div class="perf"></div>
      <div class="ticket-bottom">
        <div class="barcode"></div>
        <div class="ref-no">NO&nbsp;REFUNDS</div>
      </div>
    </div>

    <button class="btn primary" id="tellHim">Send it to ${esc(cfg.from)}</button>
    <div class="btn-row">
      <button class="btn ghost" id="ics">Add to calendar</button>
      <a class="btn ghost" style="text-decoration:none;text-align:center" target="_blank" rel="noopener"
         href="${esc(gcalLink())}">Google Calendar</a>
    </div>
    <div class="tiny" style="text-align:center;margin-top:14px">
      Countdown: <span id="cd">—</span>
    </div>
    <button class="btn ghost" id="cont" style="margin-top:18px">One more thing →</button>`;

  el('tellHim').addEventListener('click', notifyHim);
  el('ics').addEventListener('click', downloadIcs);
  el('cont').addEventListener('click', next);

  const cd = el('cd');
  const tickCd = () => {
    if (!document.body.contains(cd)) return;
    const ms = start - new Date();
    if (ms <= 0) { cd.textContent = "it's happening"; return; }
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const mn = Math.floor(ms / 60000) % 60;
    cd.textContent = `${d}d ${h}h ${mn}m`;
    setTimeout(tickCd, 30000);
  };
  tickCd();
};

VIEWS.receipt = function () {
  const rows = [
    ['Attempts to say no', state.noAttempts],
    ['Successful escapes', 0],
    ['Questions answered', 4 + Object.keys(state.answers).length],
    ['Chance of cancellation', '0%'],
    ['Booking reference', REF],
  ];

  stageEl().innerHTML = `
    ${head('Receipt', 'For the record.', 'The system logs everything. Sorry.')}
    <div style="background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:6px 16px;margin-bottom:22px;box-shadow:var(--sh-sm)">
      ${rows.map(([k, v]) => `<div class="stat"><span>${esc(k)}</span><span class="val">${esc(v)}</span></div>`).join('')}
    </div>
    <p class="sub">See you ${esc(fmtShort(state.date))} at ${esc(state.time)}. Don't be late — I will be, but don't be.</p>
    <div class="btn-row">
      <button class="btn ghost" id="againBtn">Back to the ticket</button>
      <button class="btn ghost" id="restart">Start over</button>
    </div>`;

  el('againBtn').addEventListener('click', back);
  el('restart').addEventListener('click', () => {
    Object.assign(state, {
      stage: 0, queue: BASE_QUEUE.slice(), activity: null, answers: {}, other: {},
      spot: null, dress: null, date: null, time: null, terms: [], noAttempts: 0, calMonth: null,
    });
    render();
  });
};

/* ---------------- instagram ---------------- */

function igHandle(raw) {
  return String(raw || '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '');
}

function igRow(cls, compact) {
  const me = igHandle(cfg.igMe);
  const her = igHandle(cfg.igHer);
  if (!me && !her) return '';
  const link = (h) =>
    `<a class="ig" href="https://instagram.com/${encodeURIComponent(h)}" target="_blank" rel="noopener">@${esc(h)}</a>`;
  return `<div class="ig-row ${cls || ''} ${compact ? 'compact' : ''}">
    ${me ? link(me) : ''}${me && her ? '<span class="ig-dot">·</span>' : ''}${her ? link(her) : ''}
  </div>`;
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
  switch (state.activity) {
    case 'food':     return a.vibe === 'home' ? 'Home' : cfg.city;
    case 'italy':    return { rome: 'Rome', florence: 'Florence', venice: 'Venice',
                              amalfi: 'Amalfi Coast', milan: 'Milan' }[a.city] || 'Italy';
    case 'cook':     return a.who === 'order' ? 'The sofa' : 'The kitchen';
    case 'surprise': return "You'll find out";
    case 'nothing':  return { mine: 'My place', yours: 'Your place',
                              beach: 'The beach', bed: 'Bed' }[a.where] || 'Somewhere soft';
    case 'movie':    return { fort: 'The blanket fort', roof: 'The roof',
                              car: 'The car' }[a.where] || cfg.city;
    case 'trip':     return { north: 'North', desert: 'The desert',
                              coast: 'Up the coast', jlm: 'Jerusalem' }[a.direction] || cfg.city;
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
  return d ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
}

function fmtShort(d) {
  return d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
}

function eventTitle() { return `Date with ${cfg.from} 🌹`; }

function eventDetails() {
  return [
    summaryTitle(),
    state.spot ? `Where: ${state.spot}` : `Where: ${cityFallback()}`,
    `Dress code: ${dressLabel()}`,
    cfg.note || '',
    `Booking ref ${REF}. No refunds.`,
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
    `DESCRIPTION:${escIcs('Date with ' + cfg.from + ' in 2 hours')}`,
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

function notifyHim() {
  const msg = [
    `✅ ${cfg.to} said yes.`,
    ``,
    `📅 ${fmtLong(state.date)} at ${state.time}`,
    `🎯 ${summaryTitle()}`,
    `📍 ${state.spot || cityFallback()}`,
    `👗 ${dressLabel()}`,
    state.contact.phone ? `📱 ${state.contact.phone}` : '',
    state.contact.email ? `✉️ ${state.contact.email}` : '',
    ``,
    `She tried to press "no" ${state.noAttempts} times. Ref ${REF}.`,
  ].filter((l) => l !== undefined).join('\n');

  const digits = (cfg.phone || '').replace(/\D/g, '');
  const url = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener');
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

  const colors = ['#c4705a', '#e8b4a0', '#8fa089', '#d9a441', '#f0cbba'];
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

el('refOut').textContent = 'REF ' + REF;
render();
