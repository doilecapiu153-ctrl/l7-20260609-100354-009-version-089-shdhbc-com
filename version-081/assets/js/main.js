(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
                activate(next);
                restart();
            });
        });
        start();
    }

    function setupSorting() {
        var root = document.querySelector("[data-sort-root]");
        var grid = document.querySelector("[data-sortable-grid]");
        if (!root || !grid) {
            return;
        }
        var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-sort]"));
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        function value(card, key) {
            return parseFloat(card.getAttribute("data-" + key) || "0");
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var key = button.getAttribute("data-sort");
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.sort(function (a, b) {
                    return value(b, key) - value(a, key);
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        });
    }

    function createResultCard(item) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
            '<a class="card-cover" href="./' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="card-badge">' + escapeHtml(item.type) + '</span>',
            '<span class="card-score">' + escapeHtml(item.rating) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<a href="./' + item.file + '" class="card-title">' + escapeHtml(item.title) + '</a>',
            '<p>' + escapeHtml(item.desc) + '</p>',
            '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span class="tag-pill">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
            '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
            '</div>'
        ].join("");
        return article;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var head = document.querySelector("[data-search-head]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !head || !input || !window.SEARCH_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        input.value = query;
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var found = window.SEARCH_ITEMS.filter(function (item) {
            return [item.title, item.desc, item.region, item.type, item.genre, item.year, item.tags.join(" ")].join(" ").toLowerCase().indexOf(lower) !== -1;
        }).slice(0, 120);
        head.innerHTML = '<span class="section-kicker">Search</span><h2>搜索结果</h2><p>“' + escapeHtml(query) + '” 相关影片</p>';
        results.innerHTML = "";
        if (!found.length) {
            var empty = document.createElement("div");
            empty.className = "content-panel";
            empty.innerHTML = "<h2>未找到相关结果</h2><p>可以尝试更换影片名、地区、年份、类型或标签。</p>";
            results.appendChild(empty);
            return;
        }
        found.forEach(function (item) {
            results.appendChild(createResultCard(item));
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSorting();
        setupSearchPage();
    });
})();
