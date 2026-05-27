const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const previousButton = hero.querySelector('[data-hero-prev]');
  const nextButton = hero.querySelector('[data-hero-next]');
  let currentIndex = 0;
  let timer = null;

  function activate(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === currentIndex);
    });
  }

  function restartTimer() {
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(() => {
      activate(currentIndex + 1);
    }, 5200);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      activate(index);
      restartTimer();
    });
  });

  if (previousButton) {
    previousButton.addEventListener('click', () => {
      activate(currentIndex - 1);
      restartTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      activate(currentIndex + 1);
      restartTimer();
    });
  }

  activate(0);
  restartTimer();
}

function setupFilters() {
  const filterRoots = Array.from(document.querySelectorAll('[data-filter-root]'));

  filterRoots.forEach((root) => {
    const scope = root.parentElement || document;
    const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
    const input = root.querySelector('[data-filter-input]');
    const region = root.querySelector('[data-region-filter]');
    const type = root.querySelector('[data-type-filter]');
    const year = root.querySelector('[data-year-filter]');
    const count = root.querySelector('[data-filter-count]');
    const empty = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const queryValue = normalize(input ? input.value : '');
      const regionValue = normalize(region ? region.value : '');
      const typeValue = normalize(type ? type.value : '');
      const yearValue = normalize(year ? year.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const searchText = normalize(card.dataset.search);
        const cardRegion = normalize(card.dataset.region);
        const cardType = normalize(card.dataset.type);
        const cardYear = normalize(card.dataset.year);
        const matchesQuery = !queryValue || searchText.includes(queryValue);
        const matchesRegion = !regionValue || cardRegion === regionValue;
        const matchesType = !typeValue || cardType === typeValue;
        const matchesYear = !yearValue || cardYear === yearValue;
        const shouldShow = matchesQuery && matchesRegion && matchesType && matchesYear;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, type, year].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
}

setupHero();
setupFilters();
