(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var localFilter = document.querySelector('.js-local-filter');
  if (localFilter) {
    localFilter.addEventListener('input', function () {
      var keyword = localFilter.value.trim().toLowerCase();
      document.querySelectorAll('.js-filter-card').forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('hidden-card', keyword.length > 0 && text.indexOf(keyword) === -1);
      });
    });
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function renderSearch() {
    var target = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    if (!target || !input || !window.SEARCH_INDEX) {
      return;
    }
    var q = params().get('q') || '';
    input.value = q;
    var keyword = q.trim().toLowerCase();
    var list = window.SEARCH_INDEX;
    if (keyword) {
      list = list.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.summary].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      });
    } else {
      list = list.slice(0, 80);
    }
    list = list.slice(0, 160);
    if (!list.length) {
      target.innerHTML = '<div class="empty-result">暂无匹配影片</div>';
      return;
    }
    target.innerHTML = list.map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<img src="./' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-year">' + item.year + '</span>' +
        '</a>' +
        '<div class="card-content">' +
        '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
        '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<p>' + escapeHtml(item.summary) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  renderSearch();

  document.querySelectorAll('.player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var src = player.getAttribute('data-play');
    var loaded = false;
    var hlsInstance = null;
    function attach() {
      if (!video || !src || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function play() {
      attach();
      player.classList.add('playing');
      var start = video.play();
      if (start && typeof start.catch === 'function') {
        start.catch(function () {
          player.classList.remove('playing');
        });
      }
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('playing');
        }
      });
    }
  });
})();
