(function () {
  var navButton = document.querySelector("[data-nav-toggle]");
  var navPanel = document.querySelector("[data-nav-panel]");

  if (navButton && navPanel) {
    navButton.addEventListener("click", function () {
      navPanel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === active);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchYear = document.querySelector("[data-search-year]");
  var searchItems = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function applySearch() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var y = searchYear ? searchYear.value : "";
    var visible = 0;

    searchItems.forEach(function (item) {
      var text = [
        item.getAttribute("data-title") || "",
        item.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
      var year = item.getAttribute("data-year") || "";
      var ok = (!q || text.indexOf(q) !== -1) && (!y || year === y);

      item.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }

  if (searchYear) {
    searchYear.addEventListener("change", applySearch);
  }

  function startPlayer(stage, button) {
    var video = stage.querySelector("video");
    var u = button.getAttribute("data-stream");

    if (!video || !u) {
      return;
    }

    stage.classList.add("is-playing");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== u) {
        video.src = u;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(u);
        hls.attachMedia(video);
        video._hlsReady = true;
      }
      video.play().catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (stage) {
    var button = stage.querySelector("[data-stream]");

    if (!button) {
      return;
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlayer(stage, button);
    });

    stage.addEventListener("click", function () {
      if (!stage.classList.contains("is-playing")) {
        startPlayer(stage, button);
      }
    });
  });
})();
