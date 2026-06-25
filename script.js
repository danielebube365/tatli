(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* nav turns solid once the curtain starts covering the hero */
  const nav = $('#nav');
  const hero = $('.hero');
  const onScroll = () => {
    const h = hero ? hero.offsetHeight : window.innerHeight;
    nav.classList.toggle('solid', window.scrollY > h * 0.6);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const toggle = $('#navToggle'), mobile = $('#navMobile');
  if (toggle && mobile) {
    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      mobile.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', mobile).forEach(a => a.addEventListener('click', () => set(false)));
  }

  /* year */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* video autoplay kick */
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('video[autoplay]').forEach(v => {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    v.muted = true;
    const play = () => v.play().catch(() => {});
    if (v.readyState >= 2) play(); else v.addEventListener('loadeddata', play, { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && v.paused) play(); });
  });

  /* scroll reveal — scroll-position check (primary) + observer (backup) */
  const reveals = new Set($$('.reveal'));
  if (reduce) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const reveal = (el) => { if (!el.classList.contains('in')) { el.classList.add('in'); reveals.delete(el); } };
    const check = () => {
      const vh = window.innerHeight;
      reveals.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) reveal(el);
      });
    };
    requestAnimationFrame(check);
    document.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach(e => e.isIntersecting && reveal(e.target)), { threshold: 0.05 });
      reveals.forEach(el => io.observe(el));
    }
  }
})();
