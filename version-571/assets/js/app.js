(function () {
  function each(list, handler) {
    Array.prototype.forEach.call(list, handler);
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = root.querySelectorAll('[data-hero-slide]');
    var dots = root.querySelectorAll('[data-hero-dot]');
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      each(slides, function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      each(dots, function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    each(dots, function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var text = panel.querySelector('[data-filter-text]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = document.querySelectorAll('[data-movie-card]');
    var empty = document.querySelector('[data-filter-empty]');

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function update() {
      var keyword = normalize(text && text.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;
      each(cards, function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var typeOk = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
        var yearOk = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var textOk = !keyword || haystack.indexOf(keyword) !== -1;
        var ok = typeOk && yearOk && textOk;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (text) {
      text.addEventListener('input', update);
    }
    if (type) {
      type.addEventListener('change', update);
    }
    if (year) {
      year.addEventListener('change', update);
    }
    update();
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var empty = document.querySelector('[data-search-empty]');
    var title = document.querySelector('[data-search-title]');
    var input = document.querySelector('[data-search-input]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function render(keyword) {
      var q = normalize(keyword);
      var pool = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' '));
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = pool.map(function (movie) {
        return [
          '<article class="movie-card compact">',
          '<a class="poster-frame" href="' + movie.url + '">',
          '<img data-cover src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\');if(this.parentElement){this.parentElement.classList.add(\'image-missing\');}">',
          '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
          '<span class="poster-play">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
      if (empty) {
        empty.classList.toggle('is-visible', pool.length === 0);
      }
      if (title) {
        title.textContent = q ? '搜索结果：' + keyword : '精选影片';
      }
    }

    function escapeHtml(value) {
      return (value || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    render(query);
  }

  window.initializeMoviePlayer = function (mediaUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-button]');
    var status = document.querySelector('[data-player-status]');
    var started = false;
    var hls = null;

    if (!video || !overlay || !button || !mediaUrl) {
      return;
    }

    function setStatus(value) {
      if (status) {
        status.textContent = value || '';
      }
    }

    function tryPlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('点击播放器继续观看');
        });
      }
    }

    function begin() {
      overlay.classList.add('hidden');
      if (started) {
        tryPlay();
        return;
      }
      started = true;
      setStatus('正在加载，请稍候');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          tryPlay();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放失败，请刷新页面重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
          tryPlay();
        }, { once: true });
      } else {
        setStatus('浏览器暂不支持播放此视频');
      }
    }

    overlay.addEventListener('click', begin);
    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
