(function() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }
})();

(function() {
    const root = document.querySelector('[data-hero]');
    if (!root) {
        return;
    }
    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function() {
            show(index + 1);
        }, 5200);
    }

    if (slides.length > 1) {
        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')));
                play();
            });
        });
        play();
    }
})();

(function() {
    const forms = Array.from(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.location.href = target;
        });
    });
})();

(function() {
    const panel = document.querySelector('[data-category-tools]');
    const list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
        return;
    }
    const keyword = panel.querySelector('[data-filter-keyword]');
    const year = panel.querySelector('[data-filter-year]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(list.querySelectorAll('.movie-card'));

    function match(card) {
        const q = keyword.value.trim().toLowerCase();
        const text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        const qMatch = !q || text.includes(q);
        const yearMatch = !year.value || card.getAttribute('data-year') === year.value;
        const regionMatch = !region.value || card.getAttribute('data-region') === region.value;
        const typeMatch = !type.value || card.getAttribute('data-type') === type.value;
        return qMatch && yearMatch && regionMatch && typeMatch;
    }

    function apply() {
        cards.forEach(function(card) {
            card.hidden = !match(card);
        });
    }

    [keyword, year, region, type].forEach(function(control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
    });
})();

(function() {
    const page = document.querySelector('[data-search-page]');
    if (!page || !window.SEARCH_MOVIES) {
        return;
    }
    const form = page.querySelector('[data-search-form-inline]');
    const input = form.querySelector('input[name="q"]');
    const results = page.querySelector('[data-search-results]');
    const title = page.querySelector('[data-search-title]');
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function card(movie) {
        const tags = movie.tags.slice(0, 3).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-cover" href="' + movie.url + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="cover-gradient"></span>' +
            '<span class="movie-type">' + escapeHtml(movie.type) + '</span>' +
            '</a>' +
            '<div class="movie-info">' +
            '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
            '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.category) + '</p>' +
            '<p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="movie-tags">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function run() {
        const q = input.value.trim().toLowerCase();
        const items = window.SEARCH_MOVIES.filter(function(movie) {
            if (!q) {
                return true;
            }
            return movie.searchText.toLowerCase().includes(q);
        }).slice(0, 160);
        title.textContent = q ? '搜索结果：' + input.value.trim() : '精选结果';
        results.innerHTML = items.map(card).join('');
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const value = input.value.trim();
        const nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        run();
    });

    run();
})();
