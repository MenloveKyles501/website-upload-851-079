(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      show(0);
      restart();
    });
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = normalize(params.get('q'));
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    inputs.forEach(function (input) {
      if (initialQuery) {
        input.value = initialQuery;
      }
      input.addEventListener('input', apply);
    });

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var panel = button.closest('[data-filter-buttons]');
        if (panel) {
          panel.querySelectorAll('[data-filter]').forEach(function (item) {
            item.classList.remove('active');
          });
        }
        button.classList.add('active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        apply();
      });
    });

    function matchesFilter(card) {
      if (activeFilter === 'all') {
        return true;
      }
      var parts = activeFilter.split(':');
      var key = parts[0];
      var value = normalize(parts.slice(1).join(':'));
      if (key === 'year') {
        return normalize(card.getAttribute('data-year')) === value;
      }
      if (key === 'type') {
        return normalize(card.getAttribute('data-type')).indexOf(value) !== -1;
      }
      if (key === 'category') {
        return normalize(card.getAttribute('data-category')) === value;
      }
      return true;
    }

    function apply() {
      var query = normalize(inputs.map(function (input) { return input.value; }).filter(Boolean).join(' '));
      var terms = query ? query.split(/\s+/).filter(Boolean) : [];
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var found = terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
        var show = found && matchesFilter(card);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      document.querySelectorAll('[data-empty-state]').forEach(function (empty) {
        empty.classList.toggle('show', visible === 0 && cards.length > 0);
      });
    }

    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();

window.startMoviePlayer = function (settings) {
  var video = document.getElementById(settings.videoId);
  var overlay = document.getElementById(settings.overlayId);
  var playButton = document.getElementById(settings.playId);
  var hls = null;
  var loaded = false;

  if (!video || !overlay || !playButton || !settings.src) {
    return;
  }

  function showOverlay() {
    overlay.classList.remove('is-hidden');
  }

  function hideOverlay() {
    overlay.classList.add('is-hidden');
  }

  function playVideo() {
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        showOverlay();
      });
    }
  }

  function loadAndPlay() {
    hideOverlay();
    if (loaded) {
      playVideo();
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = settings.src;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(settings.src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showOverlay();
        }
      });
      return;
    }
    video.src = settings.src;
    video.addEventListener('loadedmetadata', playVideo, { once: true });
    video.load();
  }

  overlay.addEventListener('click', loadAndPlay);
  playButton.addEventListener('click', function (event) {
    event.stopPropagation();
    loadAndPlay();
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      loadAndPlay();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      showOverlay();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
};
