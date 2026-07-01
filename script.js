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

  /* video autoplay + on-screen-only reel playback (saves CPU) */
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allVids = $$('video[autoplay]');
  const reelVids = new Set($$('.reel__item video'));
  const kick = (v) => { const p = () => v.play().catch(() => {}); if (v.readyState >= 2) p(); else v.addEventListener('loadeddata', p, { once: true }); };
  allVids.forEach(v => { v.muted = true; v.setAttribute('muted', ''); });
  if (reduce) {
    allVids.forEach(v => { v.pause(); v.removeAttribute('autoplay'); });
  } else {
    allVids.forEach(v => { if (!reelVids.has(v)) kick(v); });
    if ('IntersectionObserver' in window && reelVids.size) {
      reelVids.forEach(v => v.removeAttribute('autoplay'));
      const vio = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) kick(e.target); else e.target.pause(); }), { rootMargin: '120px' });
      reelVids.forEach(v => vio.observe(v));
    } else { reelVids.forEach(kick); }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) allVids.forEach(v => { if (!reelVids.has(v) && v.paused) kick(v); }); });
  }

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

  /* ---------- GSAP hero (mask reveal + scroll parallax) ---------- */
  const root = document.documentElement;
  if (!reduce && window.gsap) {
    const g = window.gsap;
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);

    const tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero__eyebrow', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .6 })
      .fromTo('.hero__title .line__in', { yPercent: 115 }, { yPercent: 0, duration: .9, stagger: .1, clearProps: 'transform' }, '-=.3')
      .fromTo('.hero__sub', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .6 }, '-=.55')
      .fromTo('.hero__cta', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .6 }, '-=.45')
      .fromTo('.hero__figure', { autoAlpha: 0, scale: .92 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power4.out' }, '-=.8')
      .fromTo('.hero__stamp', { autoAlpha: 0, scale: 0, rotate: -60 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: .7, ease: 'back.out(1.7)' }, '-=.45');

    // scroll-scrubbed parallax so the hero peeks as the curtain rises
    if (window.ScrollTrigger) {
      const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      g.to('.hero__title', { yPercent: -16, ease: 'none', scrollTrigger: st });
      g.to('.hero__figure', { yPercent: -30, ease: 'none', scrollTrigger: st });
      g.to('.hero__foot', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '35% top', scrub: true } });
    }

    // gentle mouse parallax on the figure (desktop pointers only)
    if (window.matchMedia('(hover:hover) and (min-width:900px)').matches) {
      const fig = document.querySelector('.hero__figure');
      const heroEl = document.querySelector('.hero');
      if (fig && heroEl) heroEl.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
        g.to(fig, { x: x * 26, y: y * 20, duration: .8, ease: 'power2.out', overwrite: 'auto' });
      });
    }

    // safety: never leave hero content hidden
    setTimeout(() => root.classList.remove('anim'), 4000);
  } else {
    // reduced motion or GSAP unavailable: reveal hero immediately
    root.classList.remove('anim');
  }
})();
