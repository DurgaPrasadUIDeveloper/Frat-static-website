/*
 * Click-to-play YouTube player (YouTube IFrame Player API) with GSAP transitions.
 * <div class="yt-frame" data-yt="VIDEO_ID"> <img.yt-thumb> <button.yt-play> </div>
 * The API is only loaded on hover/click; the video plays inside the page, never on youtube.com.
 * Note: YouTube only plays embeds on pages served over http(s) (a real host or localhost).
 */
(function () {
  var hasGsap = typeof window.gsap !== 'undefined';
  var onDisk = location.protocol === 'file:';
  var apiState = 0; // 0 = not requested, 1 = loading, 2 = ready
  var apiQueue = [];

  function loadApi(cb) {
    if (apiState === 2) return cb && cb();
    if (cb) apiQueue.push(cb);
    if (apiState === 1) return;
    apiState = 1;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      apiState = 2;
      if (typeof prev === 'function') prev();
      apiQueue.splice(0).forEach(function (fn) { fn(); });
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  }

  // Looks for the preview server started by start-site.bat (ports 8000-8010); resolves to the page URL or ''.
  function findLocalServer() {
    var page = location.pathname.split('/').pop() || 'index.html';
    var checks = [];
    for (var port = 8000; port <= 8010; port++) {
      (function (base) {
        var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 1200);
        checks.push(fetch(base, { mode: 'no-cors', cache: 'no-store', signal: ctl ? ctl.signal : undefined })
          .then(function () { clearTimeout(timer); return base; })
          .catch(function () { clearTimeout(timer); return ''; }));
      })('http://localhost:' + port + '/' + page);
    }
    return Promise.all(checks).then(function (r) {
      for (var i = 0; i < r.length; i++) if (r[i]) return r[i];
      return '';
    });
  }

  document.querySelectorAll('[data-yt]').forEach(function (frame) {
    var id = frame.getAttribute('data-yt');
    var btn = frame.querySelector('.yt-play');
    var thumb = frame.querySelector('.yt-thumb');
    var player = null;
    var started = false;

    // maxresdefault does not exist for every video: fall back to hqdefault
    if (thumb) {
      thumb.addEventListener('error', function () {
        var fb = thumb.getAttribute('data-fallback');
        if (fb && thumb.src !== fb) thumb.src = fb;
        else thumb.style.display = 'none';
      });
      thumb.addEventListener('load', function () {
        if (thumb.naturalWidth && thumb.naturalWidth <= 120) {
          var fb = thumb.getAttribute('data-fallback');
          if (fb && thumb.src !== fb) thumb.src = fb;
        }
      });
    }
    if (!btn) return;

    function reveal() {
      var iframe = frame.querySelector('iframe');
      if (!iframe) return;
      if (hasGsap) {
        gsap.fromTo(iframe, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to([thumb, btn], { opacity: 0, duration: 0.45, ease: 'power2.out', onComplete: function () {
          if (btn) btn.style.display = 'none';
          if (thumb) thumb.style.visibility = 'hidden';
        } });
      } else {
        btn.style.display = 'none';
        if (thumb) thumb.style.visibility = 'hidden';
      }
    }

    function create() {
      var holder = document.createElement('div');
      frame.appendChild(holder);
      player = new YT.Player(holder, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, origin: location.origin },
        events: {
          onReady: function (e) {
            var f = e.target.getIframe();
            f.setAttribute('title', 'What parents should know about autism');
            f.style.opacity = '0';
            e.target.playVideo();
            reveal();
          }
        }
      });

      // pause when the video scrolls out of view
      if (typeof window.ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: frame, start: 'top bottom', end: 'bottom top',
          onLeave: pause, onLeaveBack: pause
        });
      }
    }

    function pause() {
      if (player && player.pauseVideo) { try { player.pauseVideo(); } catch (e) {} }
    }

    function note(text) {
      var n = frame.querySelector('.yt-note');
      if (n) { n.textContent = text; return; }
      n = document.createElement('div');
      n.className = 'yt-note';
      n.textContent = text;
      n.style.cssText = 'position:absolute;left:50%;bottom:7%;z-index:4;transform:translateX(-50%);max-width:88%;padding:10px 16px;border-radius:14px;background:rgba(7,40,33,.82);color:#fff;font-size:13px;line-height:1.5;text-align:center;backdrop-filter:blur(8px)';
      frame.appendChild(n);
    }

    btn.addEventListener('pointerenter', function () { if (!onDisk) loadApi(); }, { once: true });
    btn.addEventListener('click', function () {
      if (started) return;
      if (onDisk) {
        // YouTube refuses to run inside a page opened straight from a folder.
        // If the local preview server (start-site.bat) is running, jump to it; otherwise explain.
        note('Checking for the local preview server...');
        findLocalServer().then(function (base) {
          if (base) { location.href = base + '#video'; return; }
          note('To play the video here, double-click start-site.bat in the project folder (it opens the site at http://localhost:8000), then press play.');
        });
        return;
      }
      started = true;
      loadApi(create);
    });
  });
})();
