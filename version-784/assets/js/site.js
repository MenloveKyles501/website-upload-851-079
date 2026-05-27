function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var next = document.querySelector("[data-hero-next]");
  var prev = document.querySelector("[data-hero-prev]");
  var active = 0;

  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  if (slides.length) {
    showSlide(0);
    if (next) next.addEventListener("click", function () { showSlide(active + 1); });
    if (prev) prev.addEventListener("click", function () { showSlide(active - 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { showSlide(i); });
    });
    setInterval(function () { showSlide(active + 1); }, 5200);
  }

  var filterInput = document.querySelector("[data-inline-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
  var countNode = document.querySelector("[data-result-count]");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  function applyFilter(value) {
    var keyword = String(value || "").trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle("hidden-by-filter", !matched);
      if (matched) visible += 1;
    });
    if (countNode) {
      countNode.textContent = keyword ? "匹配影片：" + visible : "精选影片";
    }
  }

  if (filterInput) {
    if (query) filterInput.value = query;
    applyFilter(filterInput.value);
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }
});
