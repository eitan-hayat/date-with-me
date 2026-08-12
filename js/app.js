/* ============================================================
   The flow engine.
   ============================================================ */

const cfg = readConfig();

const state = {
  stage: 0,
  queue: ['envelope', 'ask', 'celebrate', 'activity', '__flow__', 'recs',
          'dress', 'date', 'time', 'contact', 'terms', 'confirming', 'ticket', 'receipt'],
  activity: null,
  answers: {},       // follow-up answers, keyed by step id
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
  const base = ['envelope', 'ask', 'celebrate', 'activity'];
  const tail = ['dress', 'date', 'time', 'contact', 'terms', 'confirming', 'ticket', 'receipt'];
  const steps = flow.map((s) => 'f:' + s.id);
  const recs = buildRecs(state.activity, state.answers, cfg.city);
  state.queue = [...base, ...steps, ...(recs.length ? ['recs'] : []), ...tail];
}

function setProgress() {
  const shown = state.stage > 0 && currentId() !== 'receipt';
  const pct = shown ? ((state.stage) / (state.queue.length - 1)) * 100 : 0;
  el('bar').style.width = pct + '%';
  el('step').textContent = shown
    ? `Step ${state.stage} of ${state.queue.length - 1}`
    : '';
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

/* ---------------- shared bits ---------------- */

function head(eyebrow, title, sub) {
  return `
    ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}
    <h2>${title}</h2>
    ${sub ? `<p class="sub">${sub}</p>` : ''}`;
}

function optionGrid(options, selectedId, oneCol) {
  return `<div class="grid ${oneCol ? 'one' : ''}">${options.map((o) => `
    <button class="opt ${selectedId === o.id ? 'selected' : ''}" data-id="${esc(o.id)}">
      ${o.emoji ? `<span class="emoji">${o.emoji}</span>` : ''}
      <span>${esc(o.label)}</span>
      ${o.note ? `<span class="note">${esc(o.note)}</span>` : ''}
    </button>`).join('')}</div>`;
}

function wireOptions(onPick) {
  stageEl().querySelectorAll('.opt').forEach((b) => {
    b.addEventListener('click', () => onPick(b.dataset.id, b));
  });
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

  el('yesBtn').addEventListener('click', () => { burst(); next(); });
  setupImpossibleNo();
};

VIEWS.celebrate = function () {
  const photo = cfg.photoHer || cfg.photoUs;
  stageEl().innerHTML = `
    <div style="text-align:center">
      ${photo ? `<div class="polaroid"><img src="${esc(photo)}" alt=""><div class="cap">she said yes</div></div>` : ''}
      <div class="eyebrow" style="margin-bottom:12px">Answer recorded</div>
      <h1>I knew it.</h1>
      <p class="sub" style="margin:0 auto 26px">
        ${state.noAttempts > 0
          ? `You tried the other button ${state.noAttempts} time${state.noAttempts > 1 ? 's' : ''}. That is noted and forgiven.`
          : 'No hesitation. Respect.'}
      </p>
      <button class="btn primary" id="go">Now let's plan it →</button>
    </div>`;
  el('go').addEventListener('click', next);
  burst();
};

VIEWS.activity = function () {
  const list = ACTIVITIES.filter((a) => cfg.activities.includes(a.id));
  stageEl().innerHTML = `
    ${head('Question 02', 'What do you want<br>to do?', 'Pick one. You can change your mind later, unlike with the last question.')}
    ${optionGrid(list, state.activity)}
    ${backLink()}`;
  wireOptions((id) => {
    state.activity = id;
    state.answers = {};
    state.spot = null;
    rebuildQueue();
    next();
  });
  wireBack();
};

function renderFollowUp(stepId) {
  const flow = FLOWS[state.activity] || [];
  const step = flow.find((s) => s.id === stepId);
  if (!step) { next(); return; }

  stageEl().innerHTML = `
    ${head(labelFor(state.activity), step.q, step.sub || '')}
    ${optionGrid(step.options, state.answers[step.id])}
    ${backLink()}`;

  wireOptions((id) => {
    state.answers[step.id] = id;
    // Recommendations depend on these answers, so recompute the tail.
    const pos = state.stage;
    rebuildQueue();
    state.stage = pos;
    next();
  });
  wireBack();
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
      : 'Nothing to decide here — just things to look at. Every card opens in Maps.')}
    <div id="recList">${recs.map((r, i) => `
      <div class="rec ${r.place && state.spot === r.name ? 'selected' : ''}" data-i="${i}">
        <div class="rec-main">
          <div class="rec-name">${esc(r.name)}</div>
          <div class="rec-note">${esc(r.note)}</div>
        </div>
        <a class="maps" href="${esc(r.url)}" target="_blank" rel="noopener">Open ↗</a>
      </div>`).join('')}
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
  el('cont').addEventListener('click', next);
  const skip = el('skip');
  if (skip) skip.addEventListener('click', () => { state.spot = null; next(); });
  wireBack();
};

VIEWS.dress = function () {
  stageEl().innerHTML = `
    ${head('Dress code', 'How are we<br>showing up?')}
    ${optionGrid(DRESS, state.dress)}
    ${backLink()}`;
  wireOptions((id) => { state.dress = id; next(); });
  wireBack();
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

VIEWS.time = function () {
  stageEl().innerHTML = `
    ${head(fmtLong(state.date), 'And what time?')}
    ${optionGrid(TIMES, state.time)}
    ${backLink()}`;
  wireOptions((id) => { state.time = id; next(); });
  wireBack();
};

VIEWS.contact = function () {
  stageEl().innerHTML = `
    ${head('Almost done', 'Where do I send<br>the invite?',
      'So it lands in your calendar and I stop asking you if you remembered.')}
    <div class="field">
      <label>Your phone</label>
      <input id="ph" type="tel" inputmode="tel" placeholder="05x-xxx-xxxx" value="${esc(state.contact.phone)}">
    </div>
    <div class="field">
      <label>Your email — for the calendar invite</label>
      <input id="em" type="email" inputmode="email" placeholder="you@email.com" value="${esc(state.contact.email)}">
      <div class="hint">Optional. Nothing is stored anywhere — it goes straight to ${esc(cfg.from)}.</div>
    </div>
    <button class="btn primary" id="cont">Continue</button>
    ${backLink()}`;

  el('cont').addEventListener('click', () => {
    state.contact.phone = el('ph').value.trim();
    state.contact.email = el('em').value.trim();
    next();
  });
  wireBack();
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
    if (i >= LOADING_LINES.length) { next(); return; }
    el('line').textContent = LOADING_LINES[i++];
    setTimeout(tick, i === LOADING_LINES.length ? 700 : 950);
  };
  tick();
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

    ${cfg.photoUs ? `<div class="polaroid" style="transform:rotate(2deg)"><img src="${esc(cfg.photoUs)}" alt=""><div class="cap">${esc(fmtShort(state.date))}</div></div>` : ''}

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
  burst();
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
    <div style="background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:6px 16px;margin-bottom:22px">
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
      stage: 0, activity: null, answers: {}, spot: null, dress: null,
      date: null, time: null, terms: [], noAttempts: 0, calMonth: null,
    });
    render();
  });
};

/* ---------------- the impossible No ---------------- */

function setupImpossibleNo() {
  const duel = el('duel');
  const no = el('noBtn');
  const yes = el('yesBtn');
  const taunt = el('taunt');
  let locked = false;
  let curW = 0;   // tracked by hand — the CSS width transition makes
  let curH = 0;   // getBoundingClientRect() report stale numbers mid-animation.

  const dodge = (px, py) => {
    if (locked) return;
    state.noAttempts++;
    const n = state.noAttempts;
    const box = duel.getBoundingClientRect();

    if (n === 1) {
      // Shrink it straight away so it has room to actually run around.
      const r = no.getBoundingClientRect();
      curH = r.height;
      curW = Math.min(r.width, Math.max(130, box.width * 0.42));
    }

    if (n >= NO_LABELS.length) {
      locked = true;
      no.classList.add('absorbed');
      yes.textContent = 'Yes  (the only option)';
      yes.style.transform = 'scale(1.03)';
      taunt.textContent = 'the button gave up. so should you.';
      taunt.classList.add('pop');
      return;
    }

    curW = Math.max(84, curW * 0.9);
    no.textContent = NO_LABELS[n];
    no.style.width = curW + 'px';
    no.style.padding = '13px 10px';
    no.style.fontSize = Math.max(12, 16 - n) + 'px';
    // Yes grows — but through height and weight, not width, so it never
    // pushes past the page gutter.
    yes.style.fontSize = 19 + n + 'px';
    yes.style.padding = 19 + n * 2 + 'px 22px';
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
    taunt.textContent = TAUNTS[Math.min(n - 1, TAUNTS.length - 1)];
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
    if (locked || !document.body.contains(no)) return;
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

function labelFor(id) {
  const a = ACTIVITIES.find((x) => x.id === id);
  return a ? a.label : '';
}

function optLabel(activity, stepId, valueId) {
  const step = (FLOWS[activity] || []).find((s) => s.id === stepId);
  const opt = step && step.options.find((o) => o.id === valueId);
  return opt ? opt.label : '';
}

function dressLabel() {
  const d = DRESS.find((x) => x.id === state.dress);
  return d ? d.label : 'Whatever you want';
}

function summaryTitle() {
  const base = labelFor(state.activity);
  const parts = Object.keys(state.answers)
    .map((k) => optLabel(state.activity, k, state.answers[k]))
    .filter(Boolean);
  if (state.activity === 'surprise') return 'A surprise';
  return parts.length ? `${base} — ${parts.join(' · ')}` : base;
}

/* When she didn't lock in a venue, print something better than the city. */
function cityFallback() {
  const a = state.answers;
  switch (state.activity) {
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
  const [h, mi] = (state.time || '20:00').split(':').map(Number);
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

function eventTitle() {
  return `Date with ${cfg.from} 🌹`;
}

function eventDetails() {
  const lines = [
    summaryTitle(),
    state.spot ? `Where: ${state.spot}` : '',
    `Dress code: ${dressLabel()}`,
    cfg.note ? cfg.note : '',
    `Booking ref ${REF}. No refunds.`,
  ].filter(Boolean);
  return lines.join('\n');
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
    state.spot ? `📍 ${state.spot}` : '',
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

function burst() {
  const canvas = el('confetti');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ['#ff6f61', '#ffb199', '#e8b96a', '#6ad3a1', '#f7efe9'];
  const bits = Array.from({ length: 90 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.42,
    vx: (Math.random() - 0.5) * 11,
    vy: -Math.random() * 13 - 4,
    r: 3 + Math.random() * 5,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
    life: 1,
  }));

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;
    bits.forEach((b) => {
      b.vy += 0.32;
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vr;
      b.life -= 0.006;
      if (b.life > 0 && b.y < innerHeight + 40) alive = true;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.r, -b.r * 0.5, b.r * 2, b.r);
      ctx.restore();
    });
    if (alive) raf = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  };
  cancelAnimationFrame(raf);
  draw();
}

/* ---------------- boot ---------------- */

el('refOut').textContent = 'REF ' + REF;
render();
