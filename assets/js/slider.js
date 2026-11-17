/*
 * Puzzle-piece card slider ("Where it helps"), GSAP + ScrollTrigger.
 *   [data-pslider]           root (arrow keys work when focused)
 *   [data-pslider-viewport]  clipping window and drag/swipe target
 *   [data-pslider-track]     moving row; each child is [data-card]
 *   [data-pslider-dots]      dots are generated here
 *   [data-prev] [data-next]  arrow buttons (inside the same section)
 *
 * Cards keep the puzzle's own proportions: 3 show at once on wide screens, 2 on tablets, 1 on phones.
 *
 * Scroll mode (tablet and desktop): the cards half of the panel pins under the header and each
 * stretch of scrolling slides the row along by exactly one card. Arrows, dots,
 * keys and drag scroll the page to the matching spot.
 * Fallback (phones, reduced motion, or a panel taller than the screen): no
 * pinning; swipe, arrows, dots and autoplay move the cards instead.
 */
(function () {
  const root = document.querySelector('[data-pslider]');
  if (!root || !window.gsap) return;

  const scope = root.parentElement; // holds the arrows too
  const panel = root.closest('.evaluation-panel') || scope;
  const pinTarget = root.closest('[data-pin]') || panel; // the part that stays pinned
  const viewport = root.querySelector('[data-pslider-viewport]');
  const track = root.querySelector('[data-pslider-track]');
  const cards = Array.from(root.querySelectorAll('[data-card]'));
  const dotsWrap = root.querySelector('[data-pslider-dots]');
  const prevBtn = scope.querySelector('[data-prev]');
  const nextBtn = scope.querySelector('[data-next]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasST = !!window.ScrollTrigger;
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  const CARD_GAP = 16;
  const SCROLL_PER_CARD = 420; // px of page scroll for each card move
  const HEADER_OFFSET = 88;    // keeps the pinned panel clear of the fixed header
  const AUTOPLAY_DELAY = 4.5;

  let perView = 3;
  let step = 0;
  let maxIndex = 0;
  let index = 0;
  let dots = [];
  let dragging = false;
  let startX = 0;
  let dx = 0;
  let autoplay = null;
  let st = null;
  let scrollMode = false;

  /* ---------- Layout ---------- */
  function layout() {
    const vw = viewport.clientWidth;
    perView = vw >= 1100 ? 3 : vw >= 720 ? 2 : 1;
    const gap = vw < 600 ? 12 : CARD_GAP;
    const cw = (vw - (perView - 1) * gap) / perView;
    step = cw + gap;
    cards.forEach((c, i) => {
      c.style.width = cw + 'px';
      c.style.marginLeft = i === 0 ? '0' : gap + 'px';
    });
    // Narrow cards switch to the tall puzzle so the shape keeps its proportions
    root.classList.toggle('evaluation-tall', perView === 1 && cw < 460);
    panel.classList.add('is-stacked');

    maxIndex = Math.max(0, cards.length - perView);
    index = Math.min(index, maxIndex);
    buildDots();
    gsap.set(track, { x: -index * step });
    paint();
    setupScroll();
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = [];
    if (maxIndex === 0) return;
    for (let i = 0; i <= maxIndex; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to position ${i + 1}`);
      b.className = 'evaluation-dot';
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
      dots.push(b);
    }
  }

  function paint() {
    dots.forEach((d, i) => {
      const active = i === index;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-current', active ? 'true' : 'false');
    });
    cards.forEach((c, i) => {
      const visible = i >= index && i < index + perView;
      c.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
  }

  /* ---------- Moving the row ---------- */
  function setIndex(i) {
    index = i;
    const x = -index * step;
    if (reduce) gsap.set(track, { x });
    else gsap.to(track, { x, duration: 0.8, ease: 'power3.inOut', overwrite: 'auto' });
    paint();
  }

  // Direct move (used when the page is not pinned)
  function go(i) {
    if (maxIndex === 0) return;
    setIndex(i > maxIndex ? 0 : i < 0 ? maxIndex : i);
    restartAutoplay();
  }

  // Scroll the page to the stretch that shows card position i
  function scrollToIndex(i) {
    const seg = (st.end - st.start) / (maxIndex + 1);
    const target = st.start + seg * i + seg / 2;
    if (window.lenis) window.lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }

  // Works in both modes
  function goTo(i) {
    if (maxIndex === 0) return;
    const wrapped = i > maxIndex ? 0 : i < 0 ? maxIndex : i;
    if (scrollMode && st) scrollToIndex(wrapped);
    else go(wrapped);
  }

  /* ---------- Scroll-driven mode ---------- */
  function setupScroll() {
    if (st) { st.kill(); st = null; }
    scrollMode = false;
    root.setAttribute('data-lenis-prevent', '');

    const wide = window.matchMedia('(min-width: 768px)').matches;
    const fits = pinTarget.offsetHeight <= window.innerHeight - HEADER_OFFSET - 16;
    if (reduce || !hasST || !wide || maxIndex === 0 || !fits) {
      restartAutoplay();
      return;
    }

    scrollMode = true;
    if (autoplay) autoplay.kill();
    root.removeAttribute('data-lenis-prevent'); // let smooth scrolling work over the cards

    st = ScrollTrigger.create({
      trigger: pinTarget,
      // keep the pinned block roughly centred under the header when the screen is tall
      start: () => `top ${Math.min(180, Math.max(HEADER_OFFSET, Math.round((window.innerHeight + HEADER_OFFSET - pinTarget.offsetHeight) / 2 - 20)))}px`,
      end: () => '+=' + (maxIndex + 1) * SCROLL_PER_CARD,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const i = Math.min(maxIndex, Math.floor(self.progress * (maxIndex + 1)));
        if (i !== index && !dragging) setIndex(i);
      },
    });
  }

  /* ---------- Autoplay (fallback mode only) ---------- */
  function restartAutoplay() {
    if (reduce || maxIndex === 0 || scrollMode) return;
    if (autoplay) autoplay.kill();
    autoplay = gsap.delayedCall(AUTOPLAY_DELAY, () => go(index + 1));
    if (root.matches(':hover') || root.contains(document.activeElement)) autoplay.pause();
  }

  root.addEventListener('mouseenter', () => autoplay && autoplay.pause());
  root.addEventListener('mouseleave', () => {
    if (!root.contains(document.activeElement)) autoplay && autoplay.resume();
  });
  root.addEventListener('focusin', () => autoplay && autoplay.pause());
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) autoplay && autoplay.resume();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
  });

  /* ---------- Drag and swipe ---------- */
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    dx = 0;
    gsap.killTweensOf(track);
    if (autoplay) autoplay.pause();
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    const atEdge = (index === 0 && dx > 0) || (index === maxIndex && dx < 0);
    gsap.set(track, { x: -index * step + (atEdge ? dx * 0.3 : dx) });
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dx) > 50) {
      const moved = Math.max(1, Math.round(Math.abs(dx) / step));
      const target = Math.max(0, Math.min(maxIndex, dx < 0 ? index + moved : index - moved));
      if (scrollMode && st) {
        setIndex(index); // settle, then let the page scroll bring it to the new card
        scrollToIndex(target);
      } else {
        go(target);
      }
    } else {
      setIndex(index);
      restartAutoplay();
    }
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  /* ---------- Entrance: pieces drop in when scrolled into view ---------- */
  if (!reduce && hasST) {
    gsap.from(cards, {
      y: 70,
      opacity: 0,
      rotation: -5,
      duration: 0.9,
      stagger: 0.12,
      ease: 'back.out(1.5)',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: root, start: 'top 90%', once: true },
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });
  window.addEventListener('load', () => hasST && ScrollTrigger.refresh());

  layout();
})();
