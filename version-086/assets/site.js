(function () {
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initMovieFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-movie-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-movie-search]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var filterRow = scope.querySelector('[data-filter-row]');
            var activeFilter = 'all';

            function apply() {
                var query = normalize(input ? input.value : '');
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
                    card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        var first = cards.find(function (card) {
                            return !card.classList.contains('is-hidden');
                        });
                        if (first) {
                            window.location.href = first.getAttribute('href');
                        }
                    }
                });
            }

            if (filterRow) {
                filterRow.addEventListener('click', function (event) {
                    var button = event.target.closest('[data-filter-value]');
                    if (!button) {
                        return;
                    }
                    activeFilter = button.getAttribute('data-filter-value') || 'all';
                    Array.prototype.slice.call(filterRow.querySelectorAll('[data-filter-value]')).forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            }

            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initMovieFilters();
    });
})();
