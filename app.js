// Viraj Mankani — portfolio interactions

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDocsDialog();
  initProjectFilters();
  initReveal();
  initTrack();
  initSectionSpy();
  initTalkButton();
});

function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

function initDocsDialog() {
  const dialog = document.getElementById('docsDialog');
  if (!dialog || typeof dialog.showModal !== 'function') {
    // Very old browsers: just open the resume directly.
    document.querySelectorAll('[data-open-docs]').forEach((btn) =>
      btn.addEventListener('click', () => window.open('virajMankaniResume.pdf', '_blank')));
    return;
  }

  document.querySelectorAll('[data-open-docs]').forEach((btn) =>
    btn.addEventListener('click', () => dialog.showModal()));
  dialog.querySelectorAll('[data-close-docs]').forEach((btn) =>
    btn.addEventListener('click', () => dialog.close()));

  // Click on the backdrop closes it
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });
}

function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      projects.forEach((p) => {
        p.hidden = filter !== 'all' && p.dataset.category !== filter;
        if (!p.hidden) p.classList.add('is-in');
      });
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}

// Fill each numbered circle as it scrolls past the middle of the screen
function initTrack() {
  const items = document.querySelectorAll('.track-item');
  if (!items.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-on', entry.isIntersecting || entry.boundingClientRect.top < 0));
  }, { rootMargin: '0px 0px -45% 0px' });
  items.forEach((el) => io.observe(el));
}

function initSectionSpy() {
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const map = new Map();
  links.forEach((a) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target && target.tagName !== 'FOOTER') map.set(target, a);
  });
  if (!map.size || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-current'));
      map.get(entry.target).classList.add('is-current');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, section) => io.observe(section));
}

// The "Let's talk" circle leans toward the cursor a little
function initTalkButton() {
  const btn = document.getElementById('talkBtn');
  if (!btn || window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;

  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
    btn.style.setProperty('--y', `${(e.clientY - r.top - r.height / 2) * 0.25}px`);
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.setProperty('--x', '0px');
    btn.style.setProperty('--y', '0px');
  });
}
