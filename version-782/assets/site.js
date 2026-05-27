document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }
  });

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var empty = scope.querySelector("[data-empty-state]");
    var currentFilter = "all";

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var kind = card.getAttribute("data-kind") || "";
        var matchText = !keyword || text.indexOf(keyword) !== -1;
        var matchKind = currentFilter === "all" || kind === currentFilter;
        var visible = matchText && matchKind;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  });

  document.querySelectorAll(".player-card").forEach(function (card) {
    var video = card.querySelector("video");
    var layer = card.querySelector(".play-layer");
    var mediaUrl = card.getAttribute("data-video");
    var initialized = false;

    function setup() {
      if (!video || !mediaUrl || initialized) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = mediaUrl;
      }

      initialized = true;
    }

    function start() {
      setup();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!initialized || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
    }
  });
});
