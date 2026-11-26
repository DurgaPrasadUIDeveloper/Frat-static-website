/*
 * Booking form shown directly in the homepage hero (#hero-book).
 *   - Same fields and checks as the "Book home collection" popup.
 *   - The submit is a demo (no backend yet): replace submitForm() with a real request.
 *   - While the hero form is on screen, any "#book" link focuses it instead of opening the popup;
 *     further down the page those links still open the popup (assets/js/booking-modal.js).
 * Include this file BEFORE booking-modal.js so it can handle the click first.
 */
(function () {
  const card = document.getElementById('hero-book');
  if (!card) return;
  const form = card.querySelector('[data-hb-form]');
  const submitBtn = card.querySelector('[data-hb-submit]');
  const formView = card.querySelector('[data-hb-view="form"]');
  const doneView = card.querySelector('[data-hb-view="done"]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;

  /* ---------- Validation ---------- */
  const errorFor = (name) => card.querySelector('[data-err="' + name + '"]');

  function setError(name, message) {
    const el = errorFor(name);
    const input = form.elements[name];
    if (el) { el.textContent = message || ''; el.hidden = !message; }
    if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  const clearErrors = () => ['name', 'phone', 'city', 'consent'].forEach((n) => setError(n, ''));

  function validate() {
    clearErrors();
    let firstBad = null;
    const bad = (name, msg) => { setError(name, msg); if (!firstBad) firstBad = form.elements[name]; };
    if (form.elements.name.value.trim().length < 2) bad('name', 'Please enter your name.');
    const digits = form.elements.phone.value.replace(/\D/g, '');
    const okPhone = digits.length === 10 || (digits.length === 11 && digits[0] === '0') || (digits.length === 12 && digits.startsWith('91'));
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

  /* ---------- Submit (demo) ---------- */
  // Replace this with a real request (fetch to your endpoint) when the backend is ready.
  function submitForm() { return new Promise((resolve) => setTimeout(resolve, 800)); }

  function showDone() {
    formView.hidden = true;
    doneView.hidden = false;
    const ring = doneView.querySelector('[data-hb-ring]');
    const tick = doneView.querySelector('[data-hb-tick]');
    if (window.gsap && !reduce) {
      const rl = ring.getTotalLength(), tl = tick.getTotalLength();
      gsap.fromTo(doneView, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
      gsap.fromTo(ring, { strokeDasharray: rl, strokeDashoffset: rl }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' });
      gsap.fromTo(tick, { strokeDasharray: tl, strokeDashoffset: tl }, { strokeDashoffset: 0, duration: 0.45, delay: 0.5, ease: 'power2.out' });
    }
    doneView.focus({ preventScroll: true });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy || !validate()) return;
    busy = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    await submitForm();
    showDone();
  });

  card.querySelector('[data-hb-again]').addEventListener('click', () => {
    form.reset();
    clearErrors();
    busy = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
    doneView.hidden = true;
    formView.hidden = false;
    form.elements.name.focus({ preventScroll: true });
  });

  /* ---------- "#book" links: focus this form while it is on screen ---------- */
  function formIsOnScreen() {
    const r = card.getBoundingClientRect();
    const vis = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    return vis > r.height * 0.5;
  }
  function focusForm() {
    const target = doneView.hidden ? form.elements.name : doneView;
    target.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href$="#book"]');
    if (!link || !formIsOnScreen()) return;
    e.preventDefault();
    e.stopImmediatePropagation(); // keep the popup closed
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.classList.contains('hidden')) document.getElementById('menu-toggle').click();
    focusForm();
  }, true);

  // index.html#book (for example from another page): land on the hero form, no popup
  if (location.hash === '#book') {
    history.replaceState(null, '', location.pathname + location.search);
    window.addEventListener('load', () => setTimeout(() => {
      window.scrollTo(0, 0);
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
      focusForm();
    }, 1800));
  }
})();
