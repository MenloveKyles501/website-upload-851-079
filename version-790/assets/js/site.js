(function () {
  var toggle = document.getElementById('mobile-toggle');
  var panel = document.getElementById('mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('movie-search');
  var typeSelect = document.getElementById('filter-type');
  var regionSelect = document.getElementById('filter-region');
  var yearSelect = document.getElementById('filter-year');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var noResults = document.getElementById('no-results');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.style.display = visible ? 'none' : 'block';
    }
  }

  [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
      applyFilters();
    }
  }
})();
