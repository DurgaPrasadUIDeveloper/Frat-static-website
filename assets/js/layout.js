/*
 * Shared header + footer. Edit the nav list once here and every page updates.
 * Each page needs <div id="site-header"></div> and <div id="site-footer"></div>.
 */
(function () {
  // On the home page links are in-page anchors; on inner pages they point back to index.html
  const base = document.getElementById('top') ? '' : 'index.html';
  const NAV = [
    { href: '#frat', label: 'FRAT Test' },
    { href: '#home-collection', label: 'Home Collection' },
    { href: '#packages', label: 'Packages' },
    { href: '#faq', label: 'FAQ' },
  ];

  const links = (cls) =>
    NAV.map((n) => `<a href="${base}${n.href}" class="${cls}">${n.label}</a>`).join('');

  const header = `
  <header id="site-header-bar" class="site-header fixed inset-x-0 top-0 z-50" data-over="true" data-tone="light">
    <div class="site-pill flex h-[60px] items-center justify-between gap-4 rounded-full py-1.5 pl-5 pr-1.5 md:pl-6">
      <a href="${base}#top" class="brand-lockup flex shrink-0 items-center" aria-label="Yodaara by Yoda Diagnostics, home">
        <img src="assets/img/logo.svg" alt="Yodaara" width="123" height="32" class="logo-dark block h-8 w-auto" />
        <img src="assets/img/logo-light.svg" alt="" width="123" height="32" class="logo-light hidden h-8 w-auto" aria-hidden="true" />
        <span class="brand-by">by Yoda Diagnostics</span>
      </a>
      <nav class="nav-pill hidden items-center gap-1 md:flex" aria-label="Main">${links('nav-link')}</nav>
      <a href="${base}#book"
         class="hidden rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-600 md:inline-block">
        Book home collection
      </a>
      <button id="menu-toggle" class="nav-pill grid h-11 w-11 place-items-center rounded-full text-brand-900 md:hidden" aria-label="Open menu" aria-expanded="false">
        <span class="text-xl leading-none">&#9776;</span>
      </button>
    </div>
    <div id="mobile-menu" class="mx-auto hidden max-w-[1240px] pb-4 pt-2 md:hidden">
      <nav class="glass glass-strong flex flex-col gap-1 rounded-3xl p-3" aria-label="Mobile">${links('nav-link nav-link--block')}
        <a href="${base}#book" class="mt-1 rounded-full bg-brand-900 px-5 py-3 text-center font-semibold text-white">Book home collection</a>
      </nav>
    </div>
  </header>`;

  // Footer content. A link with no href renders as plain text until the page exists;
  // add a url to a social entry and it becomes a link.
  const FT_SOCIAL = [
    { label: 'Facebook', url: '' },
    { label: 'Instagram', url: '' },
    { label: 'LinkedIn', url: '' },
    { label: 'YouTube', url: '' },
  ];
  const FT_TESTS = [
    { label: 'Autism / Neuropsychiatric Panel - Advanced', href: '#packages' },
    { label: 'RBC Folate', href: '#packages' },
    { label: 'Active Vitamin B12 (Holotranscobalamin)', href: '#packages' },
  ];
  const FT_COMPANY = [
    { label: 'About Us' },
    { label: 'Contact Us' },
    { label: 'Customer Queries' },
    { label: 'Blog' },
    { label: 'FAQs', href: 'faq.html', abs: true },
  ];
  const FT_LEGAL = [
    { label: 'Privacy Policy' },
    { label: 'Terms and Conditions' },
    { label: 'Refund Policy' },
    { label: 'Cancellation Policy' },
    { label: 'Cookie Policy' },
  ];
  const ftList = (items) =>
    items
      .map((i) => {
        const href = i.href ? (i.abs ? '' : base) + i.href : '';
        return `<li>${href ? `<a class="ft-link" href="${href}">${i.label}</a>` : `<span class="ft-link">${i.label}</span>`}</li>`;
      })
      .join('');
  const ftSocial = FT_SOCIAL.map((i) =>
    `<li>${i.url ? `<a class="ft-link" href="${i.url}" target="_blank" rel="noopener noreferrer">${i.label}</a>` : `<span class="ft-link">${i.label}</span>`}</li>`
  ).join('');
  // Footer images: a local copy in assets/images/ is used when present, otherwise the live file on mryoda.com,
  // otherwise a labelled placeholder.
  const FT_REMOTE = 'https://www.mryoda.com';
  const ftImg = (file, remote, alt, label, cls) =>
    `<img class="${cls}" src="assets/images/${file}" data-remote="${FT_REMOTE}${remote}" alt="${alt}" loading="lazy" decoding="async" onerror="if(!this.dataset.tried){this.dataset.tried=1;this.src=this.dataset.remote}else{this.replaceWith(Object.assign(document.createElement('span'),{className:'ft-ph ${cls}',textContent:'${label}'}))}" />`;

  // Footer: grass photo (assets/images/footer-bg.jpg) with a cream panel on top.
  const footer = `
  <footer class="ft">
    <img class="ft-photo" src="assets/images/footer-bg.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async"  />
    <div class="ft-fade" aria-hidden="true"></div>

    <div class="wrap ft-wrap">
      <div class="ft-panel">
        <!-- Call to action -->
        <div class="ft-cta">
          <div>
            <p class="ft-cta-title">Ready to book your home sample collection?</p>
            <p class="ft-cta-sub">Doorstep pickup, no fasting needed and clear pricing.</p>
          </div>
          <a href="${base}#book" class="ft-btn">
            Book home collection
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
          </a>
        </div>

        <!-- About, link columns -->
        <div class="ft-main">
          <div class="ft-brand">
            <span class="brand-lockup flex items-center"><img src="assets/img/logo.svg" alt="Yodaara" width="123" height="32" class="logo-dark block h-9 w-auto" loading="lazy" /><span class="brand-by">by Yoda Diagnostics</span></span>
            <h5 class="ft-head ft-head--first">About FRAT India</h5>
            <p class="ft-tagline">FRAT India helps you understand folate receptor antibodies and access specialized testing through Mr. Yoda.</p>
            <h5 class="ft-head">Follow Us</h5>
            <ul class="ft-social" aria-label="Social media">${ftSocial}</ul>
          </div>

          <nav class="ft-col" aria-label="Tests and packages">
            <h5 class="ft-head">Tests &amp; Packages</h5>
            <ul class="ft-list">${ftList(FT_TESTS)}</ul>
          </nav>

          <nav class="ft-col" aria-label="Company">
            <h5 class="ft-head">Company</h5>
            <ul class="ft-list">${ftList(FT_COMPANY)}</ul>
          </nav>

          <nav class="ft-col" aria-label="Legal">
            <h5 class="ft-head">Legal</h5>
            <ul class="ft-list">${ftList(FT_LEGAL)}</ul>
          </nav>
        </div>

        <!-- App download + accreditations -->
        <div class="ft-extras">
          <section class="ft-card ft-app" aria-labelledby="ft-app-title">
            <div class="ft-app-copy">
              <h5 id="ft-app-title" class="ft-card-title">Download the Mr. Yoda App</h5>
              <p class="ft-app-lead">Your Tests. Your Reports. One App.</p>
              <p class="ft-app-text">Book tests, access your reports, and manage your bookings through Mr. Yoda.</p>
            </div>
            <figure class="ft-qr">
              ${ftImg('mr-yoda-app-qr.svg', '/appstore-qr.svg', 'QR code to download the Mr. Yoda app', 'QR code', 'ft-qr-img')}
              <figcaption>Scan to Download</figcaption>
            </figure>
          </section>

          <section class="ft-card ft-accred" aria-labelledby="ft-accred-title">
            <h5 id="ft-accred-title" class="ft-card-title">Accreditations &amp; Institutional Information</h5>
            <div class="ft-logos">
              ${ftImg('nabl.svg', '/accreditations/nabl.svg', 'NABL accreditation symbol', 'NABL accreditation symbol', 'ft-logo')}
              ${ftImg('icmr.svg', '/accreditations/icmr.svg', 'ICMR logo', 'ICMR logo', 'ft-logo')}
            </div>
          </section>
        </div>

        <!-- Medical disclaimer -->
        <div class="ft-notice">
          <p class="ft-note"><strong>Medical Disclaimer:</strong> FRAT testing identifies folate receptor autoantibodies. It is not a standalone diagnostic test for autism or cerebral folate deficiency. Information on this website is educational and should not replace evaluation or advice from a qualified healthcare professional.</p>
        </div>

        <!-- Bottom bar -->
        <div class="ft-bottom">
          <p>&copy; ${new Date().getFullYear()} FRAT India. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  </footer>`;

  document.getElementById('site-header').outerHTML = header;
  document.getElementById('site-footer').outerHTML = footer;

  // Header state: transparent over the hero, frosted bar once the hero has scrolled away
  const bar = document.getElementById('site-header-bar');
  const hero = document.querySelector('[data-hero]');
  if (bar) {
    bar.dataset.tone = (hero && hero.dataset.hero) || 'light';
    bar.classList.toggle('site-header--landscape', !!document.querySelector('.hero-landscape'));
    const sync = () => {
      const over = hero ? hero.getBoundingClientRect().bottom > 90 : false;
      bar.dataset.over = String(over);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
  }

  // Back to top
  const toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    toTop.addEventListener('click', () => {
      if (window.lenis) window.lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile menu toggle
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.firstElementChild.innerHTML = open ? '&times;' : '&#9776;';
  });
})();
