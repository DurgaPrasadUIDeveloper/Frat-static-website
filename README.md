# Mr. Yoda FRAT Test Website (static)

Built with HTML, Tailwind CSS 4 (local browser build), GSAP + ScrollTrigger, and Lenis. All libraries are in assets/vendor, so it works offline. No build step.

## Run it
Double-click `index.html` to open it in a browser, or upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel). Keep the `assets` folder next to the HTML files.

## Page
Everything is on one page, `index.html`, in this order:
`#top` hero, `#frat` what is the FRAT test, `#home-collection`, `#book` booking form, `#video`, `#packages`, `#faq`.
The header and footer links jump to these sections.

## Shared files
- `assets/js/layout.js`: header and footer. Edit the nav list here once (it links to the sections on `index.html`).
- Tailwind colours (`brand`, `accent`) and font are in the `@theme` block in each page `<head>`.
- `assets/js/main.js`: Lenis smooth scroll and GSAP animations. Hooks: `data-hero-in`, `data-reveal`, `data-stagger`.
- `assets/css/styles.css`: Lenis overrides, FAQ accordion, anchor offset.

## Before going live
- Video: replace `href="#"` in `index.html` (the "Watch the full video" button) with the YouTube link.
- Booking form: the form only shows a confirmation message. Connect it to your backend or form service.
- Medical copy: this was edited to describe the FRAT test as supportive, not diagnostic. A physician must review all health wording, and advertising rules for diagnostic claims should be checked.
- Decisions to confirm (the source doc contradicted itself):
  - Turnaround: the site now says "7-10 days" for standard reports and "some tests report faster". Confirm the real timelines.
  - Lab name: the doc mentioned "Altus Lab" once; the site uses "Mr. Yoda" throughout.
  - Packages: the doc does not say which price is the regular price and which is the member price. Confirm the labels.
  - The video title was changed from "Before It's Too Late" to "What parents should know about autism".
- Images: realistic AI-generated healthcare photos are stored locally in `assets/images/`, with responsive WebP sizes. Placement and generation prompts are documented in `assets/images/README.md`.
- Footer disclaimer and the "Mr. Yoda" name are not from the doc. Edit as needed.
- Delete these leftover files, which are no longer used: `frat-test.html`, `home-collection.html`, `packages.html`, `faq.html`, `assets/js/config.js`.
