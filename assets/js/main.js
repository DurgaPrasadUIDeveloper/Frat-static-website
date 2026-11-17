/*
 * Motion: Lenis (smooth scroll) driven by GSAP's ticker, plus GSAP + ScrollTrigger reveals.
 * Markup hooks:
 *   [data-hero-in]   intro animation on page load
 *   [data-reveal]    fades/slides in when scrolled into view
 *   [data-stagger]   animates its direct children in sequence
 *   form[data-booking] demo submit handler (no backend yet)
 */
(function () {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Smooth scrolling with Lenis, synced to GSAP's ticker
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.lenis = lenis; // used by sliders that scroll the page to a position
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // 2) In-page anchor links scroll through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      const off = target.hasAttribute('data-fit-view') ? -76 : -90; // fit-to-screen sections sit right under the header
      if (lenis) lenis.scrollTo(target, { offset: off });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  if (reduceMotion) return;

  // 3) Hero intro
  if (document.querySelector('[data-hero-in]')) {
    gsap.from('[data-hero-in]', {
      y: 30,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
    });
  }

  // 4) Scroll reveals
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // 5) Staggered groups
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    gsap.from(group.children, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });

  // 6) Booking form demo handler (replace with a real endpoint)
  document.querySelectorAll('form[data-booking]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('[data-msg]');
      if (msg) msg.textContent = 'Thanks! We will contact you to confirm your home sample pickup.';
      form.reset();
    });
  });
})();
