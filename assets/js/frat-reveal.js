/*
 * Scroll reveal for the FRAT intro (GSAP ScrollTrigger, driven by Lenis).
 *   [data-frat-heading]  words rise out of a mask
 *   [data-frat-text]     words fade in one by one as you scroll (scrubbed)
 *   [data-frat-image]    wipes open on scroll
 * Visitors who prefer reduced motion see everything as normal text.
 */
(function () {
  const intro = document.querySelector('[data-frat-intro]');
  if (!intro || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const heading = intro.querySelector('[data-frat-heading]');
  const text = intro.querySelector('[data-frat-text]');
  const imageBox = intro.querySelector('[data-frat-image]');
  const img = intro.querySelector('[data-frat-img]');

  /* Heading: masked words */
  if (heading) {
    const label = heading.textContent.trim();
    heading.setAttribute('aria-label', label);
    heading.textContent = '';
    const inners = label.split(/\s+/).map((w) => {
      const mask = document.createElement('span');
      mask.className = 'inline-block overflow-hidden align-bottom';
      mask.style.cssText = 'padding-bottom:.14em;margin-bottom:-.14em';
      mask.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'inline-block will-change-transform';
      inner.textContent = w;
      mask.appendChild(inner);
      heading.appendChild(mask);
      heading.appendChild(document.createTextNode(' '));
      return inner;
    });
    gsap.from(inners, {
      yPercent: 120,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 85%' },
    });
  }

  /* Paragraph: wrap every word (keeping bold phrases bold), then reveal on scroll */
  if (text) {
    const words = [];
    const wrap = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
            } else {
              const span = document.createElement('span');
              span.textContent = part;
              frag.appendChild(span);
              words.push(span);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrap(child);
        }
      });
    };
    wrap(text);
    gsap.set(words, { opacity: 0.15 });
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: {
        trigger: text,
        start: 'top 85%',
        end: 'bottom 72%',
        scrub: 0.6,
      },
    });
  }

  /* Image: wipe open while preserving the full portrait composition. */
  if (imageBox && img) {
    gsap.set(imageBox, { clipPath: 'inset(0% 0% 100% 0% round 24px)' });
    gsap.timeline({
      scrollTrigger: { trigger: imageBox, start: 'top 82%' },
    })
      .to(imageBox, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'power3.inOut' });

  }
})();
