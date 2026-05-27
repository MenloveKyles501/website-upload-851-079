(function () {
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    const toggle = select('[data-menu-toggle]');
    const menu = select('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupBackTop() {
    const button = select('[data-back-top]');
    if (!button) return;
    const sync = function () {
      button.classList.toggle('is-visible', window.scrollY > 420);
    };
    window.addEventListener('scroll', sync, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    sync();
  }

  function setupHero() {
    const hero = select('[data-hero-carousel]');
    if (!hero) return;
    const slides = selectAll('.hero-slide', hero);
    const dots = selectAll('.hero-dot', hero);
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const play = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });

    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupSearchForms() {
    selectAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = select('input[name="q"]', form);
        const value = input ? input.value.trim() : '';
        const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.location.href = target;
      });
    });
  }

  function setupLocalFilter() {
    const filter = select('[data-local-filter]');
    const genre = select('[data-genre-filter]');
    const grid = select('[data-movie-grid]');
    if (!grid) return;
    const cards = selectAll('.movie-card, .rank-item', grid);
    const empty = select('[data-empty-state]');

    const apply = function () {
      const keyword = filter ? filter.value.trim().toLowerCase() : '';
      const genreValue = genre ? genre.value : '';
      let visible = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const genreText = card.getAttribute('data-genre') || '';
        const matchKeyword = !keyword || text.includes(keyword);
        const matchGenre = !genreValue || genreText.includes(genreValue);
        const ok = matchKeyword && matchGenre;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    };

    if (filter) filter.addEventListener('input', apply);
    if (genre) genre.addEventListener('change', apply);
    apply();
  }

  function setupSearchPage() {
    const container = select('[data-search-results]');
    if (!container || !window.MOVIES) return;
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const input = select('[data-search-page-input]');
    if (input) input.value = q;
    const keyword = q.toLowerCase();
    const source = window.MOVIES;
    const results = keyword
      ? source.filter(function (movie) {
          return movie.search.toLowerCase().includes(keyword);
        }).slice(0, 80)
      : source.slice(0, 24);

    container.innerHTML = results.map(function (movie) {
      return [
        '<a class="search-result-item" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + movie.title + '">',
        '<div>',
        '<h2>' + movie.title + '</h2>',
        '<p>' + movie.oneLine + '</p>',
        '<div class="meta-chips"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>',
        '</div>',
        '<span class="primary-btn">立即观看</span>',
        '</a>'
      ].join('');
    }).join('');

    const empty = select('[data-search-empty]');
    if (empty) empty.classList.toggle('is-visible', results.length === 0);
  }

  ready(function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupSearchForms();
    setupLocalFilter();
    setupSearchPage();
  });
})();
