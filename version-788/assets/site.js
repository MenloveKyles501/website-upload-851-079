(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

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

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function collectOptions(cards, attribute) {
    var values = [];
    cards.forEach(function (card) {
      var raw = card.getAttribute(attribute) || '';
      raw.split(/[，,、/\s]+/).forEach(function (value) {
        var normalized = value.trim();
        if (normalized && values.indexOf(normalized) === -1) {
          values.push(normalized);
        }
      });
    });
    return values.sort(function (a, b) {
      return a.localeCompare(b, 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    var search = document.querySelector('[data-filter-search]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var genre = document.querySelector('[data-filter-genre]');
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    fillSelect(region, collectOptions(cards, 'data-region'));
    fillSelect(type, collectOptions(cards, 'data-type'));
    fillSelect(genre, collectOptions(cards, 'data-genre'));

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var genreValue = genre ? genre.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var visible = true;
        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (regionValue && (card.getAttribute('data-region') || '').indexOf(regionValue) === -1) {
          visible = false;
        }
        if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
          visible = false;
        }
        if (genreValue && (card.getAttribute('data-genre') || '').indexOf(genreValue) === -1) {
          visible = false;
        }
        card.classList.toggle('is-hidden', !visible);
      });
    }

    [search, region, type, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initHomeSearch() {
    var form = document.querySelector('[data-local-search]');
    var input = document.querySelector('[data-home-search]');
    if (!form || !input) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.classList.toggle('is-hidden', Boolean(keyword) && text.indexOf(keyword) === -1);
      });
    });
  }

  function requestPlay(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function playWithNative(video, source) {
    video.src = source;
    requestPlay(video);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-overlay');
      var source = player.getAttribute('data-video-src');
      var started = false;

      function start() {
        if (!video || !source || started) {
          return;
        }
        started = true;
        player.classList.add('is-playing');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playWithNative(video, source);
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            requestPlay(video);
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              playWithNative(video, source);
            }
          });
          return;
        }
        playWithNative(video, source);
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          start();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        start();
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initHomeSearch();
    initPlayers();
  });
})();
