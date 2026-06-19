(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupBackTop() {
    document.querySelectorAll("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === current);
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
      }
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
      var container = bar.parentElement;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
      var search = bar.querySelector("[data-filter-search]");
      var year = bar.querySelector("[data-filter-year]");
      var type = bar.querySelector("[data-filter-type]");
      var empty = container.querySelector("[data-empty-state]");
      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var match = true;
          if (keyword && text.indexOf(keyword) === -1) {
            match = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            match = false;
          }
          if (selectedType && cardType !== selectedType) {
            match = false;
          }
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [search, year, type].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"poster-link\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-overlay\"><span>▶</span></span>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.type) + "</span><a href=\"" + escapeHtml(movie.categoryUrl) + "\">" + escapeHtml(movie.category) + "</a></div>" +
      "<div class=\"detail-tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchPage() {
    var target = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    var input = document.getElementById("search-page-input");
    if (!target || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        target.innerHTML = "";
        if (empty) {
          empty.textContent = "输入关键词查找影片";
          empty.hidden = false;
        }
        return;
      }
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 120);
      target.innerHTML = matches.map(movieCard).join("");
      if (empty) {
        empty.textContent = matches.length ? "" : "没有找到匹配影片";
        empty.hidden = matches.length !== 0;
      }
    }
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(initial);
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !cover || !source) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }
    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
