// Viraj Mankani, portfolio interactions

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDocsDialog();
  initProjectFilters();
  initReveal();
  initLimiter();
  initDrift();
  initFitName();
});

function initNav() {
  const nav = document.getElementById('nav');
  const menu = document.getElementById('navMenu');
  const links = document.getElementById('navLinks');
  if (!nav || !menu) return;

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menu.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

function initDocsDialog() {
  const dialog = document.getElementById('docsDialog');
  const openers = document.querySelectorAll('[data-open-docs]');
  if (!dialog || typeof dialog.showModal !== 'function') {
    openers.forEach((btn) => btn.addEventListener('click', () => window.open('virajMankaniResume.pdf', '_blank')));
    return;
  }
  openers.forEach((btn) => btn.addEventListener('click', () => dialog.showModal()));
  dialog.querySelectorAll('[data-close-docs]').forEach((btn) => btn.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });
}

function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter');
  const items = document.querySelectorAll('#projects [data-category]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      items.forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
        if (!item.hidden) item.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
      });
    });
  });
}

// Heading, then text, then picture: each part of a block rises in turn.
function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  const show = (el) => el.classList.add('is-in');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(show);
    runCounters(document);
    return;
  }

  // stagger siblings that share a parent
  const groups = new Map();
  items.forEach((el) => {
    const key = el.parentElement;
    const i = groups.get(key) || 0;
    el.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`);
    groups.set(key, i + 1);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      show(entry.target);
      runCounters(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  items.forEach((el) => io.observe(el));

  // Anything already on screen at load shows straight away.
  requestAnimationFrame(() => {
    items.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) { show(el); runCounters(el); }
    });
  });
}

// 180 -> 25 ms, in step with the shrinking bar
function runCounters(root) {
  root.querySelectorAll('[data-count-from]').forEach((el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const from = Number(el.dataset.countFrom);
    const to = Number(el.dataset.countTo);
    if (reduceMotion) { el.textContent = to; return; }
    const delay = 500;
    const dur = 1600;
    const start = performance.now() + delay;
    el.textContent = from;
    const tick = (now) => {
      const t = Math.min(Math.max((now - start) / dur, 0), 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      el.textContent = Math.round(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// The token bucket from NginZ, small enough to hit with a thumb.
function initLimiter() {
  const root = document.getElementById('limiter');
  if (!root) return;

  const CAPACITY = 8;
  const REFILL_PER_SEC = 2;
  const bucket = root.querySelector('.bucket');
  const tokensEl = root.querySelector('[data-tokens]');
  const okEl = root.querySelector('[data-ok]');
  const noEl = root.querySelector('[data-no]');
  const log = root.querySelector('[data-log]');

  const cells = Array.from({ length: CAPACITY }, () => {
    const i = document.createElement('i');
    i.className = 'on';
    bucket.appendChild(i);
    return i;
  });

  let tokens = CAPACITY;
  let last = performance.now();
  let reqId = 0;
  let ok = 0;
  let rejected = 0;

  const refill = () => {
    const now = performance.now();
    tokens = Math.min(CAPACITY, tokens + ((now - last) / 1000) * REFILL_PER_SEC);
    last = now;
  };

  const render = () => {
    const whole = Math.floor(tokens);
    cells.forEach((c, i) => {
      c.classList.toggle('on', i < whole);
      c.classList.toggle('spent', i >= whole);
    });
    tokensEl.textContent = whole;
    okEl.textContent = ok;
    noEl.textContent = rejected;
  };

  const addLog = (id, allowed) => {
    const li = document.createElement('li');
    li.className = allowed ? 'allowed' : 'rejected';
    li.innerHTML = `<span>Request ${id}</span><span>${allowed ? '200 OK' : '429 Too Many Requests'}</span>`;
    log.prepend(li);
    while (log.children.length > 6) log.lastChild.remove();
  };

  const send = (n) => {
    refill();
    for (let k = 0; k < n; k++) {
      reqId += 1;
      const allowed = tokens >= 1;
      if (allowed) { tokens -= 1; ok += 1; } else { rejected += 1; }
      addLog(reqId, allowed);
    }
    render();
  };

  root.querySelectorAll('[data-send]').forEach((btn) =>
    btn.addEventListener('click', () => send(Number(btn.dataset.send))));

  setInterval(() => { refill(); render(); }, 150);
  render();
}

// Marine Drive drifts slowly as the contact section scrolls into view.
function initDrift() {
  const img = document.querySelector('[data-drift]');
  if (!img || reduceMotion) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = img.parentElement.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    const progress = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
    img.style.setProperty('--drift', (1.14 - progress * 0.14).toFixed(4));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

// The closing name is sized by measurement so it runs margin to margin.
function initFitName() {
  const el = document.querySelector('[data-fit]');
  if (!el) return;
  const fit = () => {
    const box = el.parentElement.clientWidth;
    el.style.fontSize = '100px';
    const w = el.getBoundingClientRect().width;
    if (w > 0) el.style.fontSize = `${(100 * box / w) * 0.995}px`;
  };
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', fit);
}
