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
      <a href="${base}#top" class="flex items-center" aria-label="Mr. Yoda home">
        <img src="assets/images/mr-yoda-logo.svg" alt="Mr. Yoda" width="135" height="30" class="logo-dark block h-8 w-auto" />
        <img src="assets/images/mr-yoda-logo-light.svg" alt="" width="135" height="30" class="logo-light hidden h-8 w-auto" aria-hidden="true" />
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

  // Footer links: the FAQ entry opens the full FAQ page
  const FOOT = NAV.map((n) => (n.label === 'FAQ' ? { ...n, href: 'faq.html', abs: true } : n));
  const footLinks = FOOT.map(
    (n) =>
      `<li><a class="inline-flex items-center gap-2 text-[15px] text-white/75 transition-colors duration-300 hover:text-white" href="${n.abs ? '' : base}${n.href}">${n.label}</a></li>`
  ).join('');

  const footer = `
  <footer class="relative isolate overflow-hidden bg-brand-900 text-white">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute inset-0" style="background:radial-gradient(55% 70% at 8% 0%,rgba(235,112,74,.28),transparent 70%),radial-gradient(50% 60% at 100% 100%,rgba(181,66,19,.35),transparent 70%)"></div>
      <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(180deg,#000,transparent 85%);mask-image:linear-gradient(180deg,#000,transparent 85%)"></div>
    </div>

    <div class="wrap">
      <!-- Call to action -->
      <div class="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-12 md:flex-row md:items-center md:py-14">
        <div class="max-w-xl">
          <p class="text-3xl font-extrabold leading-tight md:text-4xl">Ready to book your home sample collection?</p>
          <p class="mt-3 text-lg text-white/70">Doorstep pickup, no fasting needed and clear pricing.</p>
        </div>
        <a href="${base}#book"
           class="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-900 shadow-lg transition-colors duration-300 hover:bg-glow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
          Book home collection
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10.3 3.3a1 1 0 011.4 0l6 6a1 1 0 010 1.4l-6 6a1 1 0 01-1.4-1.4L14.6 11H3a1 1 0 110-2h11.6l-4.3-4.3a1 1 0 010-1.4z" clip-rule="evenodd"/></svg>
        </a>
      </div>

      <!-- Brand, links, notice -->
      <div class="grid gap-10 py-12 md:grid-cols-[1.2fr_.7fr_1.5fr] md:gap-14">
        <div>
          <img src="assets/images/mr-yoda-logo-light.svg" alt="Mr. Yoda" width="180" height="40" class="block h-10 w-auto" loading="lazy" />
          <p class="mt-4 max-w-xs text-lg leading-snug text-white/75">When your body speaks, Mr. Yoda listens.</p>
        </div>

        <nav aria-label="Footer">
          <p class="text-sm font-bold uppercase tracking-widest text-glow">Pages</p>
          <ul class="mt-4 space-y-3">${footLinks}</ul>
        </nav>

        <div class="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
          <p class="text-sm font-bold uppercase tracking-widest text-glow">Important</p>
          <p class="mt-3 text-base leading-relaxed text-white/80">
            This website is for general information and does not replace advice from a doctor.
            Speak with a physician or autism specialist before making decisions about testing or treatment.
          </p>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-sm text-white/60 sm:flex-row">
        <p>&copy; ${new Date().getFullYear()} Mr. Yoda. All rights reserved.</p>
        <button type="button" data-to-top class="inline-flex items-center gap-2 font-semibold text-white/75 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 rounded-full px-2 py-1">
          Back to top
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 16V4M4.5 9.5L10 4l5.5 5.5"/></svg>
        </button>
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
