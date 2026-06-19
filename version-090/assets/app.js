(function () {
  function get(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function getAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = get('[data-menu-button]');
    var panel = get('[data-nav-panel]');
    var search = get('.nav-search');
    if (!button || !panel || !search) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      search.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    getAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = get('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (!query) {
          return;
        }
        event.preventDefault();
        var base = form.getAttribute('data-search-base') || './';
        window.location.href = base + 'search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupLocalFilter() {
    var input = get('[data-library-search]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      input.value = initial;
    }
    var cards = getAll('[data-card]');
    function filter() {
      var q = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        card.classList.toggle('is-hidden', q && haystack.indexOf(q) === -1);
      });
    }
    input.addEventListener('input', filter);
    filter();
  }

  function setupHero() {
    var hero = get('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = getAll('[data-hero-slide]', hero);
    var dots = getAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function setupPlayer() {
    var stage = get('[data-player-stage]');
    var video = get('[data-video-element]');
    var button = get('[data-play-button]');
    var cover = get('[data-player-cover]');
    if (!stage || !video || !button) {
      return;
    }
    var source = stage.getAttribute('data-m3u8');
    var started = false;
    var hls = null;

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function start() {
      if (!source) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = source;
      playVideo();
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
    stage.addEventListener('click', function (event) {
      if (!started || event.target === cover || event.target === stage) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHeaderSearch();
    setupLocalFilter();
    setupHero();
    setupPlayer();
  });
})();
