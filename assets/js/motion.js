/*
 * Scroll motion layer (GSAP + ScrollTrigger, scrolled by Lenis from main.js).
 * It only animates transform / opacity / clip-path, so nothing in the layout moves.
 *
 *   1. Section headings: words rise out of a mask
 *   2. Eyebrows and short paragraphs: fade + rise
 *   3. Images: wipe open with a slow zoom-out (soft fade for images that carry a shadow)
 *   4. Cards: staggered entrance, with the number badges popping in
 *   5. Video frame: scales up as it scrolls into view
 *   6. Hero: copy and stats drift away as you scroll past, photo settles in
 *   7. FAQ answers: open and close smoothly
 *
 * Skipped completely for visitors who prefer reduced motion.
 */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Parts of the page that already have their own animation
  const OWN = '[data-fx],[data-hero-in],[data-frat-intro],[data-reveal],[data-stagger]';
  const own = (el) => !!el.closest(OWN);
  const inHero = (el) => !!el.closest('#top');

  /* 1. Headings: masked word rise */
  function splitWords(root) {
    const inners = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const mask = document.createElement('span');
        mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.14em;margin-bottom:-.14em';
        mask.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.style.cssText = 'display:inline-block;will-change:transform';
        inner.textContent = part;
        mask.appendChild(inner);
        frag.appendChild(mask);
        inners.push(inner);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return inners;
  }

  const headings = document.querySelectorAll('main h2, #frat-evaluation-title');
  headings.forEach((h) => {
    if (inHero(h) || h.closest('[data-frat-intro]') || h.hasAttribute('data-frat-heading')) return;
    if (h.closest('.pkg-head, .home-pickup-card')) return;
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    const words = splitWords(h);
    if (!words.length) return;
    gsap.from(words, {
      yPercent: 115,
      duration: 0.95,
      stagger: 0.055,
      ease: 'power4.out',
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
    });
  });

  /* 2. Eyebrows and short paragraphs */
  document.querySelectorAll('.eyebrow, .frat-evaluation-eyebrow, .home-pickup-description, .home-pickup-copy .eyebrow').forEach((el) => {
    if (inHero(el) || own(el)) return;
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  /* 3. Image reveal */
  document.querySelectorAll('main img').forEach((img) => {
    if (inHero(img) || img.closest('[data-frat-image]') || img.hasAttribute('data-frat-img')) return;
    if (img.classList.contains('yt-thumb')) return;
    const r = img.getBoundingClientRect();
    if (r.width < 120 || r.height < 80) return;
    const cs = getComputedStyle(img);
    const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
    const trigger = { trigger: img, start: 'top 90%', once: true };
    if (hasShadow) {
      // a clip would cut the shadow, so use a soft rise-and-settle instead
      gsap.from(img, { opacity: 0, y: -36, scale: 0.93, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: trigger });
    } else {
      const radius = cs.borderRadius || '0px';
      gsap.fromTo(img,
        { clipPath: 'inset(0% 0% 100% 0% round ' + radius + ')', scale: 1.18, transformOrigin: '50% 0%' },
        { clipPath: 'inset(0% 0% 0% 0% round ' + radius + ')', scale: 1, duration: 1.25, ease: 'power3.out',
          clearProps: 'clipPath,transform,transformOrigin', scrollTrigger: trigger });
    }
  });

  /* 4. Cards: staggered entrance + popping number badges */
  const cardSel = '.frat-evaluation-card, .home-pickup-card, .frat-mechanism-step';
  const cards = gsap.utils.toArray(cardSel).filter((c) => !own(c));
  if (cards.length) {
    gsap.set(cards, { y: 46, opacity: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity' });
        batch.forEach((c, i) => {
          const badge = c.querySelector('.frat-mechanism-number');
          if (badge) gsap.from(badge, { scale: 0, duration: 0.6, delay: 0.35 + i * 0.12, ease: 'back.out(2.4)', clearProps: 'transform' });
        });
      },
    });
  }
  gsap.utils.toArray('.pkg-num').forEach((n) => {
    gsap.from(n, { scale: 0, duration: 0.6, ease: 'back.out(2.4)', clearProps: 'transform', scrollTrigger: { trigger: n, start: 'top 92%', once: true } });
  });

  /* 5. Video frame scales up as it enters */
  document.querySelectorAll('.yt-frame').forEach((frame) => {
    gsap.fromTo(frame,
      { scale: 0.9, transformOrigin: '50% 60%' },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top 98%', end: 'top 45%', scrub: 0.6 } });
  });

  /* 6. Hero: photo settles, copy drifts away on scroll */
  (function hero() {
    const sec = document.getElementById('top');
    if (!sec) return;
    const photo = sec.querySelector('.hero-landscape-photo');
    if (photo) gsap.fromTo(photo, { scale: 1.12, transformOrigin: '50% 50%' }, { scale: 1, duration: 2.4, ease: 'power2.out', clearProps: 'transform' });
    const out = { ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom 20%', scrub: true } };
    const copy = sec.querySelector('.hero-landscape-copy');
    if (copy) gsap.to(copy, Object.assign({ yPercent: -6, opacity: 0.2 }, out));
    sec.querySelectorAll('.hero-landscape-stat').forEach((s, i) => {
      gsap.to(s, Object.assign({ y: i ? -50 : -80, opacity: 0.1 }, out));
    });
  })();

  /* 7. FAQ: smooth open / close */
  document.querySelectorAll('details[data-faq]').forEach((d) => {
    const summary = d.querySelector('summary');
    if (!summary) return;
    const body = () => Array.from(d.children).filter((c) => c !== summary);
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const kids = body();
      gsap.killTweensOf(kids);
      if (!d.open) {
        d.open = true;
        kids.forEach((k) => {
          const mt = getComputedStyle(k).marginTop;
          gsap.fromTo(k,
            { height: 0, opacity: 0, marginTop: 0, overflow: 'hidden' },
            { height: 'auto', opacity: 1, marginTop: mt, duration: 0.5, ease: 'power3.out', clearProps: 'height,opacity,marginTop,overflow' });
        });
      } else {
        gsap.to(kids, {
          height: 0, opacity: 0, marginTop: 0, overflow: 'hidden', duration: 0.35, ease: 'power2.inOut',
          onComplete: () => { d.open = false; gsap.set(kids, { clearProps: 'height,opacity,marginTop,overflow' }); },
        });
      }
    });
  });

  /* Late-loading images and fonts move trigger points: recalculate */
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})();
