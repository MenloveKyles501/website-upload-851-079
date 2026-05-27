(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');

    if (!toggle || !mobile) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initFilters() {
    var searchBox = document.querySelector('[data-search-box]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var grids = queryAll('[data-card-grid]');
    var noResult = document.querySelector('[data-no-result]');

    if (!searchBox && !yearFilter) {
      return;
    }

    function apply() {
      var keyword = searchBox ? searchBox.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      grids.forEach(function (grid) {
        queryAll('[data-movie-card], .ranking-item', grid).forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var cardYear = card.getAttribute('data-year') || card.textContent || '';
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || cardYear.indexOf(year) !== -1;
          var isVisible = matchKeyword && matchYear;

          card.style.display = isVisible ? '' : 'none';

          if (isVisible) {
            visible += 1;
          }
        });
      });

      if (noResult) {
        noResult.classList.toggle('show', visible === 0);
      }
    }

    if (searchBox) {
      searchBox.addEventListener('input', apply);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }

    apply();
  }

  function initPlayers() {
    queryAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var startButton = player.querySelector('.player-start');

      if (!video || !startButton) {
        return;
      }

      function loadAndPlay() {
        var source = video.getAttribute('data-hls');

        if (!source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video.hlsReady) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsReady = true;
            video.hlsInstance = hls;
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', source);
          }
        }

        video.setAttribute('controls', 'controls');
        startButton.classList.add('hidden');

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            startButton.classList.remove('hidden');
          });
        }
      }

      startButton.addEventListener('click', loadAndPlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
