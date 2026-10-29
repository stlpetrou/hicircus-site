(function () {
  "use strict";

  // Motion on this site answers an action (a click, a tap, a hover on a
  // control), plays once on page load, or follows the reader's scroll in one
  // place: the manifesto, which lights the line being read — and at the very
  // end of a page, where the footer is revealed like a curtain.

  // Mobile navigation ------------------------------------------------------
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".site-header__toggle");
  var nav = document.getElementById("site-nav");

  if (header && toggle && nav) {
    // While the full-screen menu is open, the page behind it can't scroll
    // or take keyboard focus.
    var behindMenu = document.querySelectorAll("main, .site-footer");

    var setOpen = function (open) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("nav-open", open);
      Array.prototype.forEach.call(behindMenu, function (el) {
        el.inert = open;
      });
    };

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // The full-screen menu only exists below 1024px; close it when the
    // window grows past that so the page isn't left locked.
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (event) {
      if (event.matches) setOpen(false);
    });
  }

  // Sticky header: once the page scrolls even a little, the header needs its
  // own background so its (light-on-dark) logo and nav stay readable over
  // whatever content is now behind it.
  if (header) {
    var updateHeaderScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeaderScrolled();
    window.addEventListener("scroll", updateHeaderScrolled, { passive: true });
  }

  // Back-to-top ------------------------------------------------------------
  // The back-to-top button, the logo and the "Home" link all point at #top,
  // which sits on the fixed header. A browser can't scroll to an element that
  // never leaves the viewport, so the native jump does nothing — scroll the
  // window to the very top ourselves instead.
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#top"]'), function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (window.history && history.replaceState) {
        history.replaceState(null, "", location.pathname + location.search);
      }
    });
  });

  // Hero background video --------------------------------------------------
  // The pause button stops the video; it also pauses while the hero is off
  // screen, or when the visitor prefers reduced motion.
  var hero = document.querySelector(".hero");
  var video = document.querySelector(".hero__video");
  var videoToggle = document.querySelector(".hero__video-toggle");

  if (hero && video && videoToggle) {
    // Phones get the vertical cut of the reel, so only one file is downloaded.
    var narrow = window.matchMedia("(max-width: 767px)").matches;
    if (narrow && video.dataset.posterNarrow) video.poster = video.dataset.posterNarrow;
    video.src = narrow && video.dataset.srcNarrow ? video.dataset.srcNarrow : video.dataset.src;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var pausedByUser = reduceMotion.matches;
    var inView = true;

    var render = function () {
      var paused = video.paused;
      hero.classList.toggle("is-paused", paused);
      videoToggle.setAttribute("aria-pressed", String(paused));
      videoToggle.setAttribute("aria-label", paused ? "Play hero animation" : "Pause hero animation");
    };

    var sync = function () {
      if (!pausedByUser && inView) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(render);
      } else {
        video.pause();
      }
    };

    video.addEventListener("play", render);
    video.addEventListener("pause", render);

    videoToggle.addEventListener("click", function () {
      pausedByUser = !video.paused;
      sync();
    });

    reduceMotion.addEventListener("change", function (event) {
      pausedByUser = event.matches;
      sync();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }

    sync();
    render();
  }

  // Manifesto --------------------------------------------------------------
  // The line nearest the middle of the screen is lit, the others fade back
  // (the looks are in main.css, "Manifesto"). Without JavaScript, or with
  // "reduce motion", every line stays lit.
  var manifesto = document.querySelector(".manifesto");

  if (manifesto && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var manifestoItems = Array.prototype.slice.call(manifesto.querySelectorAll(".manifesto__item"));
    var manifestoTicking = false;

    var lightManifesto = function () {
      manifestoTicking = false;
      var middle = window.innerHeight * 0.5;
      var nearest = null;
      var nearestGap = Infinity;

      manifestoItems.forEach(function (item) {
        var box = item.getBoundingClientRect();
        var gap = box.top <= middle && box.bottom >= middle ? 0 : Math.min(Math.abs(box.top - middle), Math.abs(box.bottom - middle));
        if (gap < nearestGap) {
          nearestGap = gap;
          nearest = item;
        }
      });

      manifestoItems.forEach(function (item) {
        item.classList.toggle("is-active", item === nearest);
      });
    };

    var requestManifesto = function () {
      if (!manifestoTicking) {
        manifestoTicking = true;
        window.requestAnimationFrame(lightManifesto);
      }
    };

    manifesto.classList.add("is-live");
    window.addEventListener("scroll", requestManifesto, { passive: true });
    window.addEventListener("resize", requestManifesto);
    lightManifesto();
  }

  // Portfolio grid ---------------------------------------------------------
  // Filters the projects by service and lists them in batches, so the page
  // stays manageable as the portfolio grows. Counts are taken from the cards
  // themselves. Without JavaScript every project is listed.
  var portfolio = document.querySelector("[data-portfolio]");

  if (portfolio) {
    var PAGE_SIZE = 6;
    var projectCards = Array.prototype.slice.call(portfolio.querySelectorAll(".project-card"));
    var filterBar = portfolio.querySelector("[data-filters]");
    var filterButtons = Array.prototype.slice.call(portfolio.querySelectorAll("[data-filter]"));
    var moreButton = portfolio.querySelector("[data-show-more]");
    var portfolioStatus = portfolio.querySelector("[data-portfolio-status]");
    var activeFilter = "all";
    var limit = PAGE_SIZE;

    var inFilter = function (card, filter) {
      return filter === "all" || card.getAttribute("data-category") === filter;
    };

    var renderProjects = function () {
      var total = 0;
      var shown = 0;
      projectCards.forEach(function (card) {
        var visible = false;
        if (inFilter(card, activeFilter)) {
          visible = total < limit;
          total++;
        }
        card.hidden = !visible;
        if (visible) shown++;
      });
      moreButton.hidden = shown >= total;
      moreButton.textContent = "Show more projects (" + (total - shown) + ")";
      filterButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === activeFilter));
      });
      return "Showing " + shown + " of " + total + (total === 1 ? " project" : " projects");
    };

    filterButtons.forEach(function (button) {
      var filter = button.getAttribute("data-filter");
      var count = projectCards.filter(function (card) {
        return inFilter(card, filter);
      }).length;
      button.querySelector("[data-filter-count]").textContent = count;
      button.hidden = count === 0;

      button.addEventListener("click", function () {
        activeFilter = filter;
        limit = PAGE_SIZE;
        portfolioStatus.textContent = renderProjects();
      });
    });

    moreButton.addEventListener("click", function () {
      var hiddenBefore = projectCards.filter(function (card) {
        return card.hidden && inFilter(card, activeFilter);
      });
      limit += PAGE_SIZE;
      portfolioStatus.textContent = renderProjects();
      // Move keyboard focus to the first project that just appeared.
      var firstNew = hiddenBefore[0] && hiddenBefore[0].querySelector("article");
      if (firstNew) {
        firstNew.setAttribute("tabindex", "-1");
        firstNew.focus({ preventScroll: true });
      }
    });

    // Links such as portfolio.html#aurora-tower must work even when that
    // project is filtered out or further down the list.
    var showLinkedProject = function () {
      var target = location.hash && document.getElementById(location.hash.slice(1));
      var position = projectCards.indexOf(target);
      if (position === -1 || !target.hidden) return;
      activeFilter = "all";
      limit = Math.ceil((position + 1) / PAGE_SIZE) * PAGE_SIZE;
      renderProjects();
      target.scrollIntoView();
    };

    filterBar.hidden = false;
    renderProjects();
    showLinkedProject();
    window.addEventListener("hashchange", showLinkedProject);
  }

  // Contact form -----------------------------------------------------------
  // Sends the form in the background so visitors stay on the page. Without
  // JavaScript it posts normally and contact.php redirects back to
  // contact.html#form-sent or #form-error.
  var contactForm = document.querySelector("[data-contact-form]");

  if (contactForm && window.fetch && window.FormData) {
    var formStatus = contactForm.querySelector("[data-form-status]");
    var sendButton = contactForm.querySelector('[type="submit"]');

    var showStatus = function (type, text) {
      formStatus.className = "form-status" + (type ? " form-status--" + type : "");
      formStatus.textContent = text;
    };

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendButton.disabled = true;
      showStatus("", "Sending…");

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok && data.ok, message: data.message };
          });
        })
        .then(function (result) {
          if (result.ok) contactForm.reset();
          showStatus(result.ok ? "success" : "error", result.message);
        })
        .catch(function () {
          showStatus("error", "Your message could not be sent. Please try again in a moment.");
        })
        .then(function () {
          sendButton.disabled = false;
        });
    });

    // Clear the last result once the visitor starts on a new message.
    contactForm.addEventListener("input", function () {
      if (formStatus.textContent) showStatus("", "");
    });
  }

  // Footer curtain -----------------------------------------------------------
  // The footer waits behind the page content (main.css, "Footer"). When a
  // keyboard user tabs into it, scroll to the end so the focused link is not
  // hidden behind the content.
  var siteFooter = document.querySelector(".site-footer");

  if (siteFooter) {
    siteFooter.addEventListener("focusin", function (event) {
      // The back-to-top button lives in the footer but sends you up, not down —
      // don't drag the page to the end when it takes focus.
      if (event.target.closest(".site-footer__top-link")) return;
      var end = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < end - 1) {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: end, behavior: reduce ? "auto" : "smooth" });
      }
    });
  }

  // Footer wordmark ---------------------------------------------------------
  // The footer is revealed like a curtain at the end of the page. While the
  // page content slides off the big "HICIRCUS STUDIO", its letters rise into
  // place one after another and the word brightens; scrolling back up
  // reverses it. The motion is finished exactly when the word is fully
  // uncovered.
  var wordmark = document.querySelector(".site-footer__wordmark");
  var wordmarkText = wordmark && wordmark.querySelector("span");

  if (wordmarkText && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var letters = 0;
    var text = wordmarkText.textContent;
    wordmarkText.textContent = "";
    for (var c = 0; c < text.length; c++) {
      if (text[c] === " ") {
        wordmarkText.appendChild(document.createTextNode(" "));
        continue;
      }
      var letter = document.createElement("span");
      letter.className = "wordmark__char";
      letter.textContent = text[c];
      letter.style.setProperty("--i", letters++);
      wordmarkText.appendChild(letter);
    }
    wordmark.style.setProperty("--chars", letters);
    wordmark.classList.add("is-animated");

    var pageContent = document.querySelector("main");
    var wordmarkTicking = false;
    var updateWordmark = function () {
      wordmarkTicking = false;
      // How much of the word is no longer covered by the page content: 0
      // while the content's bottom edge is below the word, 1 once it has
      // passed above it.
      var word = wordmark.getBoundingClientRect();
      var cover = pageContent ? pageContent.getBoundingClientRect().bottom : word.top;
      var edge = Math.max(cover, 0);
      var visibleFrom = Math.min(edge, window.innerHeight);
      var progress = (word.bottom - Math.max(visibleFrom, word.top)) / word.height;
      if (word.top >= window.innerHeight) progress = 0;
      wordmark.style.setProperty("--p", Math.min(Math.max(progress, 0), 1).toFixed(4));
    };
    var requestWordmark = function () {
      if (!wordmarkTicking) {
        wordmarkTicking = true;
        window.requestAnimationFrame(updateWordmark);
      }
    };

    window.addEventListener("scroll", requestWordmark, { passive: true });
    window.addEventListener("resize", requestWordmark);
    updateWordmark();
  }
})();
