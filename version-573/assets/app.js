(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var list = panel.parentElement.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    var input = panel.querySelector('.local-filter-input');
    var year = panel.querySelector('.local-filter-year');
    var genre = panel.querySelector('.local-filter-genre');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var genreValue = normalize(genre && genre.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !yearValue || haystack.indexOf(yearValue) !== -1;
        var matchGenre = !genreValue || haystack.indexOf(genreValue) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchGenre));
      });
    }

    [input, year, genre].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  });

  function renderSearchResults(query) {
    var resultsBox = document.querySelector('[data-search-results]');
    if (!resultsBox || !Array.isArray(window.MOVIE_INDEX)) {
      return;
    }

    var keyword = normalize(query);
    var items = window.MOVIE_INDEX.filter(function (movie) {
      if (!keyword) {
        return true;
      }
      return normalize([
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).indexOf(keyword) !== -1;
    }).slice(0, 120);

    resultsBox.innerHTML = items.map(function (movie) {
      return [
        '<article class="video-card movie-card">',
        '<a class="card-link" href="' + movie.url + '">',
        '<div class="card-poster">',
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '<span class="duration-badge">' + movie.duration + '</span>',
        '<span class="play-badge">▶</span>',
        '</div>',
        '<div class="card-body">',
        '<span class="card-category">' + movie.category + '</span>',
        '<h3>' + movie.title + '</h3>',
        '<p>' + movie.oneLine + '</p>',
        '<div class="tag-list">' + movie.tags.split(' ').slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  var searchForm = document.querySelector('[data-search-form]');

  if (searchForm) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = searchForm.querySelector('input[name="q"]');
    if (input) {
      input.value = q;
    }
    renderSearchResults(q);
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value.trim() : '';
      var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      history.replaceState(null, '', nextUrl);
      renderSearchResults(value);
    });
  }

  function attachPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var attached = false;

    if (!video || !button || !stream) {
      return;
    }

    var message = document.createElement('div');
    message.className = 'player-message';
    player.appendChild(message);

    function showMessage(text) {
      message.textContent = text;
      player.classList.add('has-message');
    }

    function loadStream() {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放暂时无法载入，请稍后重试');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            attached = false;
          }
        });
        return Promise.resolve();
      }

      video.src = stream;
      return Promise.resolve();
    }

    function playVideo() {
      loadStream().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showMessage('请再次点击播放');
          });
        }
      });
    }

    button.addEventListener('click', function () {
      playVideo();
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
      player.classList.remove('has-message');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });
  }

  document.querySelectorAll('.movie-player').forEach(attachPlayer);
})();
