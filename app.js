(function () {
  "use strict";

  var root = document.documentElement;
  var tiles = document.querySelectorAll("[data-reveal]");
  var themeButton = document.querySelector("[data-theme-toggle]");
  var date = document.querySelector("#today");

  if (date) {
    date.textContent = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric"
    }).format(new Date());
  }

  if (localStorage.getItem("beckett-theme") === "warm") {
    root.dataset.theme = "warm";
  }

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var isWarm = root.dataset.theme === "warm";
      root.dataset.theme = isWarm ? "cool" : "warm";
      localStorage.setItem("beckett-theme", isWarm ? "cool" : "warm");
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    tiles.forEach(function (tile) { observer.observe(tile); });
  } else {
    tiles.forEach(function (tile) { tile.classList.add("is-visible"); });
  }

  if (window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    tiles.forEach(function (tile) {
      tile.addEventListener("pointermove", function (event) {
        var bounds = tile.getBoundingClientRect();
        var x = (event.clientX - bounds.left) / bounds.width - 0.5;
        var y = (event.clientY - bounds.top) / bounds.height - 0.5;
        tile.style.setProperty("--rotate-x", (y * -3).toFixed(2) + "deg");
        tile.style.setProperty("--rotate-y", (x * 3).toFixed(2) + "deg");
        tile.style.setProperty("--spot-x", (x * 100 + 50).toFixed(1) + "%");
        tile.style.setProperty("--spot-y", (y * 100 + 50).toFixed(1) + "%");
      });
      tile.addEventListener("pointerleave", function () {
        tile.style.removeProperty("--rotate-x");
        tile.style.removeProperty("--rotate-y");
      });
    });
  }
})();
