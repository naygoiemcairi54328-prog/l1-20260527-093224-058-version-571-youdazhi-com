(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function openMenu() {
    var nav = qs(".main-nav");
    if (nav) {
      nav.classList.toggle("is-open");
    }
  }

  function bindForms() {
    qsa(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input[name='q']", form);
        var value = input ? input.value.trim() : "";
        window.location.href = "./search.html" + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    });
  }

  function bindListFilter() {
    qsa(".list-filter-input").forEach(function (input) {
      input.addEventListener("input", function () {
        var value = text(input.value);
        qsa(".movie-card").forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          card.style.display = haystack.indexOf(value) > -1 ? "" : "none";
        });
      });
    });
  }

  function bindHero() {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function renderSearch() {
    var box = qs("#search-results");
    if (!box || !window.SEARCH_MOVIES) {
      return;
    }
    var input = qs("#search-q");
    var select = qs("#search-type");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function card(item) {
      return '<article class="search-result">' +
        '<a href="' + item.href + '"><img src="' + item.poster + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy"></a>' +
        '<div><a class="movie-title" href="' + item.href + '">' + item.title + '</a>' +
        '<p class="movie-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + '</p>' +
        '<p class="movie-desc">' + item.desc + '</p>' +
        '<div class="tag-row"><span>' + item.category + '</span><span>' + item.genre + '</span></div></div>' +
        '</article>';
    }
    function update() {
      var keyword = text(input ? input.value : "");
      var type = select ? select.value : "";
      var found = window.SEARCH_MOVIES.filter(function (item) {
        var matchKeyword = !keyword || text(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags + " " + item.desc).indexOf(keyword) > -1;
        var matchType = !type || item.type === type || item.category === type;
        return matchKeyword && matchType;
      }).slice(0, 160);
      box.innerHTML = found.length ? found.map(card).join("") : '<div class="empty-state">没有找到匹配的影片，请更换关键词。</div>';
    }
    if (input) {
      input.addEventListener("input", update);
    }
    if (select) {
      select.addEventListener("change", update);
    }
    update();
  }

  window.setupMoviePlayer = function (videoId, overlayId, messageId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var message = document.getElementById(messageId);
    var hls = null;
    var ready = false;
    if (!video || !overlay || !url) {
      return;
    }
    function showMessage(value) {
      if (message) {
        message.textContent = value;
        message.classList.add("show");
      }
    }
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showMessage("播放暂时无法加载，请稍后重试");
            if (hls) {
              hls.destroy();
            }
          }
        });
      } else {
        showMessage("当前设备暂无法播放");
      }
    }
    function start() {
      overlay.classList.add("is-hidden");
      attach();
      video.play().catch(function () {});
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = qs(".menu-toggle");
    if (toggle) {
      toggle.addEventListener("click", openMenu);
    }
    bindForms();
    bindListFilter();
    bindHero();
    renderSearch();
  });
})();
