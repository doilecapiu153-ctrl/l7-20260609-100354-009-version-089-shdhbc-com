(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function handleScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var year = panel.querySelector('[data-year-filter]');
        var category = panel.querySelector('[data-category-filter]');
        var clear = panel.querySelector('[data-clear-filter]');
        var empty = panel.querySelector('[data-empty-result]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var selectedYear = year ? year.value : '';
            var selectedCategory = category ? category.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
                var matchedYear = !selectedYear || cardYear === selectedYear;
                var matchedCategory = !selectedCategory || cardCategory === selectedCategory;
                var show = matchedKeyword && matchedYear && matchedCategory;

                card.classList.toggle('hidden-card', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
        if (category) {
            category.addEventListener('change', applyFilter);
        }
        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (category) {
                    category.value = '';
                }
                applyFilter();
            });
        }
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var backgrounds = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-bg]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.hidden = slideIndex !== current;
            });
            backgrounds.forEach(function (bg, bgIndex) {
                bg.classList.toggle('is-active', bgIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            });
        });

        showSlide(0);
        start();
    }
})();

function initPlayer(videoId, source) {
    var video = document.getElementById(videoId);
    var trigger = document.querySelector('[data-player-trigger="' + videoId + '"]');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function begin() {
        if (loaded) {
            video.play().catch(function () {});
            return;
        }

        loaded = true;
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            return;
        }

        video.src = source;
        video.load();
        video.play().catch(function () {});
    }

    if (trigger) {
        trigger.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            begin();
        }
    });
}
