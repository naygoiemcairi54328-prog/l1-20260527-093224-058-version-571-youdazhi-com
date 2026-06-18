(() => {
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(() => {
    const menuButton = document.querySelector("[data-menu-button]");
    if (menuButton) {
      menuButton.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
      });
    }

    initHero();
    initFilters();
    initPlayer();
    restoreQuery();
  });

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle("active", current === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function restoreQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    const input = document.querySelector("[data-search-input]");
    if (query && input) {
      input.value = query;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function initFilters() {
    const input = document.querySelector("[data-search-input]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    if (!input || cards.length === 0) {
      return;
    }

    const region = document.querySelector("[data-filter-region]");
    const type = document.querySelector("[data-filter-type]");
    const year = document.querySelector("[data-filter-year]");
    const grid = document.querySelector(".searchable-grid") || cards[0].parentElement;
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "没有匹配的影片";

    const run = () => {
      const q = input.value.trim().toLowerCase();
      const regionValue = region ? region.value : "";
      const typeValue = type ? type.value : "";
      const yearValue = year ? year.value : "";
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        const matchedQuery = !q || text.includes(q);
        const matchedRegion = !regionValue || (card.dataset.region || "").includes(regionValue) || text.includes(regionValue.toLowerCase());
        const matchedType = !typeValue || (card.dataset.type || "").includes(typeValue) || text.includes(typeValue.toLowerCase());
        const matchedYear = !yearValue || (card.dataset.year || "").includes(yearValue);
        const ok = matchedQuery && matchedRegion && matchedType && matchedYear;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (visible === 0 && grid && !empty.parentElement) {
        grid.appendChild(empty);
      }

      if (visible > 0 && empty.parentElement) {
        empty.remove();
      }
    };

    [input, region, type, year].filter(Boolean).forEach((el) => {
      el.addEventListener("input", run);
      el.addEventListener("change", run);
    });

    run();
  }

  function initPlayer() {
    const stage = document.querySelector("[data-video-stage]");
    const video = document.querySelector(".movie-video");
    const button = document.querySelector("[data-play-button]");
    if (!stage || !video || !button) {
      return;
    }

    let attached = false;

    const play = () => {
      const stream = video.dataset.stream;
      if (!stream) {
        return;
      }

      stage.classList.add("playing");

      if (!attached) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else {
          video.src = stream;
        }
        attached = true;
      }

      video.play().catch(() => {});
    };

    button.addEventListener("click", play);
    stage.addEventListener("click", (event) => {
      if (!stage.classList.contains("playing") && event.target !== video) {
        play();
      }
    });
  }
})();
