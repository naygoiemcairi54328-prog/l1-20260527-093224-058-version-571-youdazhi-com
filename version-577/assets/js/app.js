(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");
    var input = document.getElementById("pageSearch");
    var select = document.getElementById("typeFilter");
    if (!list || (!input && !select)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function text(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type")
      ].join(" ").toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var type = select ? select.value : "";
      cards.forEach(function (card) {
        var matchedKeyword = !keyword || text(card).indexOf(keyword) !== -1;
        var matchedType = !type || card.getAttribute("data-type") === type;
        card.style.display = matchedKeyword && matchedType ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  function createResultCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="poster-link" href="' + item.url + '">',
      '<img src="' + item.image + '" alt="' + item.title + '海报" loading="lazy">',
      '<span class="poster-badge">' + item.year + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
      '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
      '<p>' + item.desc + '</p>',
      '<div class="tag-row"><span>' + item.genre + '</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function initSearch() {
    var form = document.getElementById("siteSearch");
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    if (!form || !input || !results || typeof SEARCH_ITEMS === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(items) {
      results.innerHTML = "";
      items.slice(0, 120).forEach(function (item) {
        results.appendChild(createResultCard(item));
      });
    }

    function run(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        render(SEARCH_ITEMS.slice(0, 60));
        return;
      }
      var matches = SEARCH_ITEMS.filter(function (item) {
        return item.search.indexOf(keyword) !== -1;
      });
      render(matches);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var next = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
      window.history.replaceState(null, "", next);
      run(query);
    });

    input.addEventListener("input", function () {
      run(input.value);
    });

    run(initial);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".watch-player"));
    players.forEach(function (wrapper) {
      var video = wrapper.querySelector("video");
      var button = wrapper.querySelector(".player-start");
      var source = wrapper.getAttribute("data-m3u8");
      var started = false;
      var hlsInstance = null;

      function bind() {
        if (started || !video || !source) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        bind();
        wrapper.classList.add("started");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          wrapper.classList.add("started");
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHeroSlider();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
