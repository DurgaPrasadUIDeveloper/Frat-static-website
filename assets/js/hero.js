/*
 * Hero booking form: inline validation, live progress, loading and confirmation states.
 * Markup hooks:
 *   form[data-hero-form]   the hero form (validated here, not in main.js)
 *   [data-error-for]       error text for a field (matched by field name)
 *   [data-progress-bar]    progress bar fill; [data-progress-text] its label
 *   [data-hero-success]    confirmation panel; [data-hero-form-wrap] the form panel
 *   [data-reset]           returns to a blank form after booking
 * NOTE: there is no backend yet. Replace the setTimeout block in submit with a real request.
 */
(function () {
  const form = document.querySelector('form[data-hero-form]');
  if (!form) return;

  const wrap = document.querySelector('[data-hero-form-wrap]');
  const success = document.querySelector('[data-hero-success]');
  const bar = document.querySelector('[data-progress-bar]');
  const progressText = document.querySelector('[data-progress-text]');
  const progressRoot = bar ? bar.parentElement : null;
  const submitBtn = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const dateInput = form.elements.namedItem('date');

  const FIELDS = ['name', 'phone', 'city', 'consent'];

  const rules = {
    name: (el) => (el.value.trim().length >= 2 ? '' : 'Please enter your full name.'),
    phone: (el) => (/^[6-9]\d{9}$/.test(el.value) ? '' : 'Enter a valid 10-digit mobile number, starting with 6 to 9.'),
    city: (el) => (el.value.trim().length >= 2 ? '' : 'Please enter the city you are in.'),
    consent: (el) => (el.checked ? '' : 'Please accept the Privacy Policy to continue.'),
  };

  const field = (name) => form.elements.namedItem(name);
  const errorEl = (name) => form.querySelector(`[data-error-for="${name}"]`);

  // Show or clear the message for one field.
  function showError(name, msg) {
    const el = field(name);
    const err = errorEl(name);
    if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) {
      err.textContent = msg;
      err.classList.toggle('hidden', !msg);
    }
  }

  // Check one field and update its message. Returns true when valid.
  function validate(name) {
    const el = field(name);
    if (!el) return true;
    const msg = rules[name](el);
    showError(name, msg);
    return msg === '';
  }

  // Check one field silently, for the progress count.
  function isValid(name) {
    const el = field(name);
    return !!el && rules[name](el) === '';
  }

  function updateProgress() {
    const done = FIELDS.filter(isValid).length;
    const pct = Math.round((done / FIELDS.length) * 100);
    if (bar) bar.style.width = pct + '%';
    if (progressRoot) progressRoot.setAttribute('aria-valuenow', String(done));
    if (progressText) {
      progressText.textContent = done === FIELDS.length
        ? 'All set, ready to book'
        : `${done} of ${FIELDS.length} done`;
    }
  }

  // Phone: digits only, max 10.
  const phone = field('phone');
  if (phone) {
    phone.addEventListener('input', () => {
      phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
      if (phone.getAttribute('aria-invalid') === 'true') validate('phone');
      updateProgress();
    });
    phone.addEventListener('blur', () => { if (phone.value) validate('phone'); });
  }

  // Other fields: check on leave, and clear errors as soon as the user fixes them.
  ['name', 'city'].forEach((name) => {
    const el = field(name);
    if (!el) return;
    el.addEventListener('blur', () => { if (el.value) validate(name); });
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validate(name);
      updateProgress();
    });
  });

  const consent = field('consent');
  if (consent) {
    consent.addEventListener('change', () => {
      validate('consent');
      updateProgress();
    });
  }

  // Preferred date cannot be in the past.
  if (dateInput) {
    dateInput.min = new Date().toLocaleDateString('en-CA');
  }

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstBad = null;
    FIELDS.forEach((name) => {
      const ok = validate(name);
      if (!ok && !firstBad) firstBad = field(name);
    });
    updateProgress();

    if (firstBad) {
      firstBad.focus();
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitLabel.textContent = 'Booking your visit...';

    const name = field('name').value.trim();
    const digits = field('phone').value;
    const maskedPhone = `+91 ${'*'.repeat(6)}${digits.slice(-4)}`;
    const firstName = name.split(/\s+/)[0];

    setTimeout(() => {
      // TODO: send the data to your endpoint here before going live.
      const nameEl = document.querySelector('[data-success-name]');
      const phoneEl = document.querySelector('[data-success-phone]');
      if (nameEl) nameEl.textContent = firstName;
      if (phoneEl) phoneEl.textContent = maskedPhone;

      form.reset();
      FIELDS.forEach((n) => showError(n, ''));
      updateProgress();
      submitBtn.disabled = false;
      submitLabel.textContent = 'Book my free collection';

      if (wrap) wrap.hidden = true;
      if (success) success.hidden = false;
      if (success) success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 900);
  });

  // Reset back to a blank form
  const resetBtn = document.querySelector('[data-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (success) success.hidden = true;
      if (wrap) wrap.hidden = false;
      updateProgress();
      const first = field('name');
      if (first) first.focus();
    });
  }

  updateProgress();
})();
