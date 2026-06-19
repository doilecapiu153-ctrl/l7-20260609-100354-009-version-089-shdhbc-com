(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var regionSelect = scope.querySelector('[data-region-filter]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var list = scope.parentElement.querySelector('[data-card-list]');
    var cards = list ? Array.prototype.slice.call(list.children) : [];

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
        var matchesRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
        var matchesYear = !year || normalize(card.dataset.year) === year;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesRegion && matchesYear));
      });
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !streamUrl) {
        return;
      }

      if (!video.dataset.ready) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.dataset.ready = '1';
      }

      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      if (!shell.classList.contains('is-playing')) {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
