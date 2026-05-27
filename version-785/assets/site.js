(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        searchInput.value = q;
      }
    }

    var filterControls = [
      searchInput,
      document.querySelector("[data-filter-region]"),
      document.querySelector("[data-filter-type]"),
      document.querySelector("[data-filter-year]"),
      document.querySelector("[data-filter-category]")
    ].filter(Boolean);

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilters() {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      if (!cards.length) {
        return;
      }
      var keyword = normalize(searchInput && searchInput.value);
      var region = normalize(document.querySelector("[data-filter-region]") && document.querySelector("[data-filter-region]").value);
      var type = normalize(document.querySelector("[data-filter-type]") && document.querySelector("[data-filter-type]").value);
      var year = normalize(document.querySelector("[data-filter-year]") && document.querySelector("[data-filter-year]").value);
      var category = normalize(document.querySelector("[data-filter-category]") && document.querySelector("[data-filter-category]").value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(" "));
        var match = true;
        if (keyword && text.indexOf(keyword) === -1) {
          match = false;
        }
        if (region && normalize(card.dataset.region) !== region) {
          match = false;
        }
        if (type && normalize(card.dataset.type) !== type) {
          match = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          match = false;
        }
        if (category && text.indexOf(category) === -1) {
          match = false;
        }
        card.classList.toggle("is-hidden-card", !match);
        if (match) {
          visible += 1;
        }
      });

      document.querySelectorAll("[data-empty-state]").forEach(function (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      });
    }

    filterControls.forEach(function (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });
    if (filterControls.length) {
      applyFilters();
    }

    var player = document.querySelector("[data-player]");
    if (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var stream = player.getAttribute("data-video");
      var connected = false;
      var hls = null;

      function connect() {
        return new Promise(function (resolve) {
          if (connected) {
            resolve();
            return;
          }
          connected = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            resolve();
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function () {
              resolve();
            });
            return;
          }
          video.src = stream;
          resolve();
        });
      }

      function start() {
        if (button) {
          button.classList.add("is-hidden");
        }
        connect().then(function () {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function () {
              if (button) {
                button.classList.remove("is-hidden");
              }
            });
          }
        });
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest(".player-start")) {
          return;
        }
        start();
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
    }
  });
})();
