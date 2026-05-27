(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' '));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
      card.classList.toggle('is-hidden-card', !(matchesQuery && matchesFilter));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });
})();
