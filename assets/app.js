(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var next = document.querySelector('[data-hero-next]');
        var prev = document.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        forms.forEach(function (form) {
            var scope = document.querySelector(form.getAttribute('data-filter-target')) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = document.querySelector(form.getAttribute('data-empty-target'));
            var q = form.querySelector('[name="q"]');
            var type = form.querySelector('[name="type"]');
            var year = form.querySelector('[name="year"]');

            function filter() {
                var query = normalize(q && q.value);
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var count = 0;
                cards.forEach(function (card) {
                    var search = normalize(card.getAttribute('data-search-index'));
                    var matchesQuery = !query || search.indexOf(query) !== -1;
                    var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var visible = matchesQuery && matchesType && matchesYear;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        count += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', count === 0);
                }
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                filter();
            });
            Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            });
            filter();
        });
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-page-form]');
        if (!form) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = form.querySelector('[name="q"]');
        if (input && params.get('q')) {
            input.value = params.get('q');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function setupImages() {
        Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (img) {
            img.addEventListener('error', function () {
                var box = img.closest('.image-box, .hero-poster, .category-covers, .detail-cover, .player-cover, .ranking-feature');
                if (!box || box.querySelector('.fallback-title')) {
                    return;
                }
                box.classList.add('has-image-error');
                var fallback = document.createElement('span');
                fallback.className = 'fallback-title';
                fallback.textContent = img.alt || '';
                box.appendChild(fallback);
            }, { once: true });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupImages();
    });
})();
