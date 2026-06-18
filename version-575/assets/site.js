(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var index = 0;
            var showSlide = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
        grids.forEach(function (grid) {
            var panel = grid.parentElement.querySelector(".filter-panel");
            if (!panel) {
                return;
            }
            var input = panel.querySelector("[data-search-input]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var empty = grid.parentElement.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var normalize = function (value) {
                return (value || "").toString().trim().toLowerCase();
            };
            var apply = function () {
                var keyword = normalize(input ? input.value : "");
                var regionValue = normalize(region ? region.value : "");
                var typeValue = normalize(type ? type.value : "");
                var yearValue = normalize(year ? year.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (regionValue && normalize(card.dataset.region) !== regionValue) {
                        ok = false;
                    }
                    if (typeValue && normalize(card.dataset.type) !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && normalize(card.dataset.year) !== yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            };
            [input, region, type, year].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
        });
    });
})();

function setupMoviePlayer(url) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".play-overlay");
    if (!video || !overlay || !url) {
        return;
    }

    var initialized = false;
    var start = function () {
        if (!initialized) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = url;
            }
            initialized = true;
        }
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    };

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
