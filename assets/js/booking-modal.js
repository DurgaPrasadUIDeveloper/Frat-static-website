/*
 * "Book home collection" popup (GSAP, works with Lenis).
 *   Any link that points to #book (for example href="#book" or "index.html#book") opens the popup.
 *   Close with the X button, the Escape key, or a click on the dark backdrop.
 *   Visiting index.html#book also opens it.
 * The submit is a demo (no backend yet): replace submitForm() with a real request.
 * Include this file after gsap and layout.js on every page that has booking links.
 */
(function () {
  if (!window.gsap) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = reduce ? 0.001 : 1;

  /* ---------- Markup ---------- */
  const style = document.createElement('style');
  style.textContent =
    'html.bk-open{overflow:hidden;padding-right:var(--bk-sbw,0)}' +
    'html.bk-open header.fixed{padding-right:var(--bk-sbw,0)}' +
    '#booking-modal[hidden]{display:none}' +
    '#booking-modal .bk-input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:12px 16px;background:#fff;transition:border-color .25s,box-shadow .25s}' +
    '#booking-modal .bk-input:focus{outline:none;border-color:#9b3913;box-shadow:0 0 0 4px #efe4d1}' +
    '#booking-modal .bk-input[aria-invalid="true"]{border-color:#b3261e;box-shadow:0 0 0 4px #f9dedc}' +
    '#booking-modal .bk-err{margin-top:6px;font-size:13px;font-weight:500;color:#b3261e;min-height:0}';
  document.head.appendChild(style);

  const field = (id, label, type, ph, extra) =>
    `<div>
        <label for="bk-${id}" class="mb-1 block text-sm font-medium text-slate-700">${label}</label>
        <input id="bk-${id}" name="${id}" type="${type}" placeholder="${ph}" ${extra || ''} class="bk-input" autocomplete="${id === 'phone' ? 'tel' : id === 'name' ? 'name' : 'address-level2'}" />
        <p class="bk-err" data-err="${id}" hidden></p>
      </div>`;

  const modal = document.createElement('div');
  modal.id = 'booking-modal';
  modal.className = 'fixed inset-0 z-[60]';
  modal.hidden = true;
  modal.innerHTML = `
    <div data-bk-overlay class="absolute inset-0 bg-brand-900/70 backdrop-blur-sm"></div>
    <div data-bk-scroll data-lenis-prevent class="absolute inset-0 overflow-y-auto overscroll-contain">
      <div data-bk-backdrop class="flex min-h-full items-center justify-center p-4">
        <div data-bk-card role="dialog" aria-modal="true" aria-labelledby="bk-title" tabindex="-1"
             class="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-brand-100 outline-none sm:p-9">
          <button type="button" data-bk-close aria-label="Close booking form"
                  class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-brand-900 transition-colors duration-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>

          <div data-bk-view="form">
            <h2 id="bk-title" class="pr-10 text-2xl font-bold text-brand-900">Schedule your free home sample collection</h2>
            <p class="mt-2 text-sm text-slate-500">*Prices are subject to change as per city.</p>
            <form data-bk-form novalidate class="mt-7 space-y-5">
              ${field('name', 'Name', 'text', 'Enter your name', 'required')}
              ${field('phone', 'Phone number', 'tel', '+91 Enter phone number', 'required inputmode="tel"')}
              ${field('city', 'City', 'text', 'Enter city name', 'required')}
              <div>
                <label class="flex items-start gap-3 text-sm">
                  <input type="checkbox" name="consent" required class="mt-1 h-4 w-4 accent-brand-600" />
                  <span>You hereby affirm &amp; authorise Mr. Yoda to process personal data as per Privacy Policy.</span>
                </label>
                <p class="bk-err" data-err="consent" hidden></p>
              </div>
              <button type="submit" data-bk-submit
                      class="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors duration-300 hover:bg-brand-800 disabled:cursor-wait disabled:opacity-70">Submit</button>
            </form>
          </div>

          <div data-bk-view="done" hidden class="py-8 text-center">
            <svg class="mx-auto" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
              <circle data-bk-ring cx="36" cy="36" r="33" stroke="#9b3913" stroke-width="4" />
              <path data-bk-tick d="M21 37l10 10 20-22" stroke="#9b3913" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h2 class="mt-5 text-2xl font-bold text-brand-900">Thank you!</h2>
            <p class="mx-auto mt-2 max-w-sm leading-relaxed">We will contact you shortly to confirm your home sample pickup.</p>
            <button type="button" data-bk-close class="mt-7 rounded-full bg-brand-600 px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-brand-800">Close</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const overlay = modal.querySelector('[data-bk-overlay]');
  const backdrop = modal.querySelector('[data-bk-backdrop]');
  const card = modal.querySelector('[data-bk-card]');
  const form = modal.querySelector('[data-bk-form]');
  const submitBtn = modal.querySelector('[data-bk-submit]');
  const formView = modal.querySelector('[data-bk-view="form"]');
  const doneView = modal.querySelector('[data-bk-view="done"]');

  let isOpen = false;
  let busy = false;
  let lastTrigger = null;

  /* ---------- Scroll lock (Lenis aware) ---------- */
  function lockScroll() {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--bk-sbw', sbw + 'px');
    document.documentElement.classList.add('bk-open');
    if (window.lenis) window.lenis.stop();
  }
  function unlockScroll() {
    document.documentElement.classList.remove('bk-open');
    document.documentElement.style.removeProperty('--bk-sbw');
    if (window.lenis) window.lenis.start();
  }

  /* ---------- Open / close ---------- */
  function resetForm() {
    form.reset();
    clearErrors();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
    busy = false;
    doneView.hidden = true;
    formView.hidden = false;
    gsap.set([formView, doneView], { clearProps: 'opacity,visibility,transform' });
  }

  function open(trigger) {
    if (isOpen) return;
    isOpen = true;
    lastTrigger = trigger || document.activeElement;
    resetForm();
    lockScroll();
    modal.hidden = false;
    gsap.killTweensOf([overlay, card]);

    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
    tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 * speed, ease: 'power2.out' }, 0)
      .fromTo(
        card,
        { autoAlpha: 0, y: 36, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55 * speed, ease: 'power3.out', clearProps: 'transform' },
        0.05
      );
    if (!reduce) {
      tl.from(
        form.children,
        { y: 14, autoAlpha: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
        0.25
      );
    }
    // Focus the first field once it is visible
    gsap.delayedCall(reduce ? 0 : 0.35, () => {
      const first = form.querySelector('input');
      if (isOpen && first) first.focus({ preventScroll: true });
    });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    gsap.killTweensOf([overlay, card, formView, doneView]);
    const tl = gsap.timeline({
      onComplete: () => {
        modal.hidden = true;
        unlockScroll();
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      },
    });
    tl.to(card, { autoAlpha: 0, y: 20, scale: 0.97, duration: 0.3 * speed, ease: 'power2.in' }, 0).to(
      overlay,
      { autoAlpha: 0, duration: 0.35 * speed, ease: 'power2.inOut' },
      0.05
    );
  }

  /* ---------- Triggers ---------- */
  document.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest && e.target.closest('a[href$="#book"]');
      if (link) {
        e.preventDefault();
        // close the mobile menu if it is open
        const menu = document.getElementById('mobile-menu');
        if (menu && !menu.classList.contains('hidden')) document.getElementById('menu-toggle').click();
        open(link);
      }
    },
    true
  );

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-bk-close]')) return close();
    if (e.target === backdrop) close(); // click on the dark area around the card
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      // keep focus inside the popup
      const items = Array.from(
        card.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // index.html#book (for example from another page) opens the popup on arrival
  if (location.hash === '#book') {
    history.replaceState(null, '', location.pathname + location.search);
    window.addEventListener('load', () => setTimeout(() => open(null), 350));
  }

  /* ---------- Validation and submit (demo) ---------- */
  const errorFor = (name) => modal.querySelector(`[data-err="${name}"]`);

  function setError(name, message) {
    const el = errorFor(name);
    const input = form.elements[name];
    if (el) {
      el.textContent = message || '';
      el.hidden = !message;
    }
    if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function clearErrors() {
    ['name', 'phone', 'city', 'consent'].forEach((n) => setError(n, ''));
  }

  function validate() {
    clearErrors();
    let firstBad = null;
    const bad = (name, msg) => {
      setError(name, msg);
      if (!firstBad) firstBad = form.elements[name];
    };
    if (form.elements.name.value.trim().length < 2) bad('name', 'Please enter your name.');
    const digits = form.elements.phone.value.replace(/\D/g, '');
    const okPhone =
      digits.length === 10 || (digits.length === 11 && digits[0] === '0') || (digits.length === 12 && digits.startsWith('91'));
    if (!okPhone) bad('phone', 'Enter a valid 10-digit mobile number.');
    if (form.elements.city.value.trim().length < 2) bad('city', 'Please enter your city.');
    if (!form.elements.consent.checked) bad('consent', 'Please tick the consent box to continue.');
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  form.addEventListener('input', (e) => {
    const n = e.target.name;
    if (n && errorFor(n) && !errorFor(n).hidden) setError(n, '');
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'consent' && e.target.checked) setError('consent', '');
  });

  // Replace this with a real request (fetch to your endpoint) when the backend is ready.
  function submitForm() {
    return new Promise((resolve) => setTimeout(resolve, 800));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy || !validate()) return;
    busy = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    await submitForm();
    if (!isOpen) return;

    gsap.to(formView, {
      autoAlpha: 0,
      y: -10,
      duration: 0.25 * speed,
      ease: 'power2.in',
      onComplete: () => {
        formView.hidden = true;
        doneView.hidden = false;
        const ring = doneView.querySelector('[data-bk-ring]');
        const tick = doneView.querySelector('[data-bk-tick]');
        const rl = ring.getTotalLength();
        const tl = tick.getTotalLength();
        gsap.fromTo(doneView, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 * speed, ease: 'power3.out' });
        if (!reduce) {
          gsap.fromTo(ring, { strokeDasharray: rl, strokeDashoffset: rl }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' });
          gsap.fromTo(tick, { strokeDasharray: tl, strokeDashoffset: tl }, { strokeDashoffset: 0, duration: 0.45, delay: 0.5, ease: 'power2.out' });
        }
        const closeBtn = doneView.querySelector('[data-bk-close]');
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      },
    });
  });
})();
