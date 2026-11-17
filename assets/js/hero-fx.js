/*
 * Hero motion and interactions (GSAP).
 * Markup hooks inside #top:
 *   [data-fx]            fades/slides in on load (hidden by CSS until this script runs)
 *   [data-split]         headline, revealed word by word
 *   [data-rotator]       children swap in turn (rotating benefit line)
 *   [data-count]         number that counts down from the old price to its value
 *   [data-tilt]          card that tilts with the pointer
 *   [data-parallax=N]    background piece that follows the pointer (N = strength)
 *   [data-float]         piece that drifts slowly on its own
 *   [data-glow]          soft light that follows the pointer
 *   [data-magnetic]      button that leans toward the pointer
 *   [data-city-chip]     fills the city field        [data-date-chip=N] fills date N days ahead
 *   [data-focus-form]    scrolls to the form and focuses the first field
 * Everything stays visible and static when the visitor prefers reduced motion.
 */
(function () {
  const hero = document.getElementById('top');
  const root = document.documentElement;
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Form helpers (work with or without animation) ---------- */
  const form = hero.querySelector('form[data-hero-form]');
  function fire(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  hero.querySelectorAll('[data-city-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const city = form && form.elements.namedItem('city');
      if (!city) return;
      city.value = chip.getAttribute('data-city-chip');
      fire(city);
      city.dispatchEvent(new Event('blur'));
    });
  });

  hero.querySelectorAll('[data-date-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const dateEl = form && form.elements.namedItem('date');
      if (!dateEl) return;
      const d = new Date();
      d.setDate(d.getDate() + Number(chip.getAttribute('data-date-chip')));
      dateEl.value = d.toLocaleDateString('en-CA');
      fire(dateEl);
    });
  });

  const focusLink = hero.querySelector('[data-focus-form]');
  if (focusLink && form) {
    focusLink.addEventListener('click', () => {
      setTimeout(() => {
        const first = form.elements.namedItem('name');
        if (first && form.offsetParent !== null) first.focus({ preventScroll: true });
      }, 800);
    });
  }

  /* ---------- Reduced motion or no GSAP: show everything and stop ---------- */
  if (reduce || !window.gsap) {
    root.classList.remove('fx-ready');
    return;
  }

  /* ---------- Headline: split into masked words ---------- */
  const h1 = hero.querySelector('[data-split]');
  let words = [];
  if (h1) {
    const text = h1.textContent.trim().replace(/\s+/g, ' ');
    h1.setAttribute('aria-label', text);
    h1.textContent = '';
    words = text.split(' ').map((w) => {
      const mask = document.createElement('span');
      mask.className = 'inline-block overflow-hidden align-bottom';
      mask.style.cssText = 'padding-bottom:.14em;margin-bottom:-.14em';
      mask.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'inline-block will-change-transform' + (w.startsWith('(') ? ' text-glow' : '');
      inner.textContent = w;
      mask.appendChild(inner);
      h1.appendChild(mask);
      h1.appendChild(document.createTextNode(' '));
      return inner;
    });
    gsap.set(words, { yPercent: 120 });
    gsap.set(h1, { autoAlpha: 1 });
  }

  /* ---------- Entrance timeline ---------- */
  const fxItems = Array.from(hero.querySelectorAll('[data-fx]')).filter((el) => !el.hasAttribute('data-split'));
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  const pill = fxItems[0];
  fxItems.forEach((el) => gsap.set(el, { autoAlpha: 0, y: 28 }));
  root.classList.remove('fx-ready'); // inline styles now hold the hidden state

  tl.to(pill, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.1);
  if (words.length) tl.to(words, { yPercent: 0, duration: 1, stagger: 0.09 }, 0.25);

  fxItems.slice(1).forEach((el, i) => {
    // the form card and scroll cue come in a little later than the left column
    const late = el.id === 'hero-book' ? 0.55 : el.matches('a[href="#frat"][aria-label]') ? 1.6 : 0.85 + i * 0.12;
    tl.to(el, { autoAlpha: 1, y: 0, duration: 0.8 }, late);
  });

  // Price counts DOWN from the old price (25,000) to the offer price (12,999); the old price shows from the start
  const countEl = hero.querySelector('[data-count]');
  const strike = hero.querySelector('[data-strike]');
  if (countEl) {
    const target = Number(countEl.getAttribute('data-count'));
    const from = strike ? Number(strike.textContent.replace(/[^\d]/g, '')) || 25000 : 25000;
    const counter = { v: from };
    countEl.textContent = from.toLocaleString('en-IN');
    tl.to(counter, {
      v: target,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => { countEl.textContent = Math.round(counter.v).toLocaleString('en-IN'); },
      onComplete: () => { countEl.textContent = target.toLocaleString('en-IN'); },
    }, 1.1);
  }
  const badge = hero.querySelector('[data-badge]');
  if (badge) tl.fromTo(badge, { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(2.2)' }, 2.6);

  // Scroll cue bobbing
  const cue = hero.querySelector('[data-cue]');
  if (cue) gsap.to(cue, { y: 10, autoAlpha: 0.2, duration: 1.1, repeat: -1, ease: 'power1.inOut', yoyo: true });

  /* ---------- Rotating benefit line ---------- */
  const rot = hero.querySelector('[data-rotator]');
  if (rot && rot.children.length > 1) {
    const items = Array.from(rot.children);
    let i = 0;
    gsap.set(items, { yPercent: 110, autoAlpha: 0 });
    gsap.set(items[0], { yPercent: 0, autoAlpha: 1 });
    const swap = () => {
      const cur = items[i];
      i = (i + 1) % items.length;
      const next = items[i];
      gsap.timeline()
        .to(cur, { yPercent: -110, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
        .fromTo(next, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, '-=0.15');
      gsap.delayedCall(2.6, swap);
    };
    gsap.delayedCall(3.4, swap);
  }

  /* ---------- Idle drift for background pieces ---------- */
  hero.querySelectorAll('[data-float]').forEach((el, idx) => {
    gsap.to(el, {
      rotation: idx % 2 ? -14 : 14,
      y: idx % 2 ? 14 : -14,
      duration: 5 + idx * 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  /* ---------- Pointer effects (mouse only, not on touch) ---------- */
  if (!finePointer) return;

  // Parallax pieces and cursor glow
  const glow = hero.querySelector('[data-glow]');
  const movers = Array.from(hero.querySelectorAll('[data-parallax]')).map((el) => ({
    strength: Number(el.getAttribute('data-parallax')) * 40,
    x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
  }));
  const glowX = glow && gsap.quickTo(glow, 'left', { duration: 0.6, ease: 'power3.out' });
  const glowY = glow && gsap.quickTo(glow, 'top', { duration: 0.6, ease: 'power3.out' });

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    movers.forEach((m) => { m.x(-nx * m.strength); m.y(-ny * m.strength); });
    if (glow) { glowX(e.clientX - r.left); glowY(e.clientY - r.top); }
  });
  hero.addEventListener('pointerenter', () => glow && gsap.to(glow, { opacity: 1, duration: 0.5 }));
  hero.addEventListener('pointerleave', () => {
    if (glow) gsap.to(glow, { opacity: 0, duration: 0.5 });
    movers.forEach((m) => { m.x(0); m.y(0); });
  });

  // Tilt card
  hero.querySelectorAll('[data-tilt]').forEach((card) => {
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotationY: px * 12, rotationX: -py * 12, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.9, ease: 'elastic.out(1,0.5)', overwrite: 'auto' });
    });
  });

  // Magnetic buttons
  hero.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const mx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const my = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.25);
      my((e.clientY - (r.top + r.height / 2)) * 0.25);
    });
    btn.addEventListener('pointerleave', () => { mx(0); my(0); });
  });
})();
