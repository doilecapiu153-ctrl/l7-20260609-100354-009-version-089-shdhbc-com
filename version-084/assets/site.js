(function() {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('[data-nav-toggle]');
  var drawer = document.querySelector('[data-mobile-drawer]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && drawer && header) {
    toggle.addEventListener('click', function() {
      drawer.classList.toggle('is-open');
      header.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      setSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.site-search');
  var kindFilter = document.querySelector('[data-kind-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : '');
    var kind = kindFilter ? kindFilter.value : 'all';
    var year = yearFilter ? yearFilter.value : 'all';
    var visible = 0;

    cards.forEach(function(card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardKind = card.getAttribute('data-kind') || '';
      var cardYear = Number(card.getAttribute('data-year') || 0);
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchKind = kind === 'all' || cardKind === kind || cardKind === '全部';
      var matchYear = year === 'all' || cardYear >= Number(year);
      var show = matchQuery && matchKind && matchYear;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
      applyFilters();
    }
  }

  if (kindFilter) {
    kindFilter.addEventListener('change', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }
})();
