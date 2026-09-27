(function () {
  "use strict";

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
  // The pause button stops all hero motion (video and word swap); the same
  // happens when the hero is off screen or the visitor prefers reduced motion.
  var heroMotion = { paused: window.matchMedia("(prefers-reduced-motion: reduce)").matches, inView: true };
  var hero = document.querySelector(".hero");
  var video = document.querySelector(".hero__video");
  var videoToggle = document.querySelector(".hero__video-toggle");

  if (hero && video && videoToggle) {
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
      heroMotion.paused = pausedByUser;
      heroMotion.inView = inView;
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

  // Hero word swap ---------------------------------------------------------
  // "Welcome to the main act." The first accent word changes (main → next →
  // star → grand → final act) while "act." stays, each word showing for
  // about a second. Screen readers always get the original sentence. The
  // word list lives in index.html (data-swap="word|word|…"); several
  // data-swap elements can change together if needed.
  var swapTargets = Array.prototype.slice.call(document.querySelectorAll("[data-swap]"));

  if (swapTargets.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var SWAP_EVERY = 1500; // ms per word, including the 0.6 s slide
    var SWAP_STAGGER = 120; // ms between words when several change together
    var swapIndex = 0;
    var swapFrom = Date.now() + 2500; // let the title's intro finish first

    var swapSets = swapTargets.map(function (target) {
      var words = target.getAttribute("data-swap").split("|");
      var label = document.createElement("span");
      var stack = document.createElement("span");

      label.className = "visually-hidden";
      label.textContent = target.textContent;
      stack.className = "swap";
      stack.setAttribute("aria-hidden", "true");

      var items = words.map(function (word, i) {
        var item = document.createElement("span");
        item.className = "swap__word" + (i === 0 ? " is-current" : "");
        item.textContent = word;
        stack.appendChild(item);
        return item;
      });

      target.textContent = "";
      target.appendChild(label);
      target.appendChild(stack);
      return items;
    });

    var swapWord = function (items, from, to) {
      var leaving = items[from];
      leaving.classList.remove("is-current");
      leaving.classList.add("is-leaving");
      items[to].classList.add("is-current");

      // Once it has slid out, park the old word below again, without
      // animating, so it can slide in from the bottom next time.
      window.setTimeout(function () {
        leaving.style.transition = "none";
        leaving.classList.remove("is-leaving");
        void leaving.offsetWidth;
        leaving.style.transition = "";
      }, 700);
    };

    window.setInterval(function () {
      if (heroMotion.paused || !heroMotion.inView || document.hidden || Date.now() < swapFrom) return;
      var from = swapIndex;
      var to = (swapIndex + 1) % swapSets[0].length;
      swapIndex = to;
      swapSets.forEach(function (items, n) {
        window.setTimeout(function () {
          swapWord(items, from, to);
        }, n * SWAP_STAGGER);
      });
    }, SWAP_EVERY);
  }

  // Hero parallax ----------------------------------------------------------
  // The video layer scrolls slower than the page (and eases in slightly),
  // while the copy drifts up a little faster and fades out.
  var backdrop = document.querySelector(".hero__backdrop");
  var copy = document.querySelector(".hero__copy");

  if (hero && backdrop && copy) {
    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ticking = false;
    var heroVisible = true;

    var reset = function () {
      backdrop.style.transform = "";
      copy.style.transform = "";
      copy.style.opacity = "";
    };

    var update = function () {
      ticking = false;
      if (motionQuery.matches) return reset();

      var rect = hero.getBoundingClientRect();
      var travel = Math.min(Math.max(-rect.top, 0), rect.height);
      var progress = rect.height ? travel / rect.height : 0;

      backdrop.style.transform =
        "translate3d(0," + (travel * 0.45).toFixed(1) + "px,0) scale(" + (1 + progress * 0.08).toFixed(4) + ")";
      copy.style.transform = "translate3d(0," + (travel * -0.18).toFixed(1) + "px,0)";
      copy.style.opacity = (1 - Math.min(Math.max((progress - 0.1) / 0.75, 0), 1)).toFixed(3);
    };

    var requestUpdate = function () {
      if (!ticking && heroVisible) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) requestUpdate();
      }).observe(hero);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    motionQuery.addEventListener("change", update);
    update();
  }

  // Project image trail ----------------------------------------------------
  // Based on the Codrops "Intro Image Trail Animation": when a marked photo
  // (the first project on the homepage) scrolls into view, a small version of
  // it appears (position and size come from data-trail-from="centerX centerY
  // scale", as fractions of the frame), then flies into place with a trail of
  // copies behind it. The copies are removed once it lands. Plays once.
  var trailMedia = document.querySelectorAll("[data-trail-from]");

  if (
    trailMedia.length &&
    "IntersectionObserver" in window &&
    typeof document.body.animate === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    var TRAIL_IMAGES = 8; // including the image itself
    var TRAIL_APPEAR = 450; // ms for the small image to fade in
    var TRAIL_HOLD = 150; // ms pause before it flies
    var TRAIL_FLIGHT = 1400; // ms for each image to land
    var TRAIL_STAGGER = 30; // ms between consecutive copies
    var TRAIL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    var LANDED = "translate(0%, 0%) scale(1)";

    var reveal = function (lead) {
      lead.style.opacity = "";
    };

    var runTrail = function (media, lead) {
      var from = media.getAttribute("data-trail-from").split(" ").map(Number);
      var move = "translate(" + (from[0] - 0.5) * 100 + "%, " + (from[1] - 0.5) * 100 + "%) ";
      var start = move + "scale(" + from[2] + ")";
      var enter = move + "scale(" + from[2] * 0.85 + ")";
      var copies = [];
      var animations = [];

      for (var i = 0; i < TRAIL_IMAGES; i++) {
        var el = lead;
        if (i > 0) {
          // Later copies go underneath, so the image itself stays on top.
          el = document.createElement("img");
          el.className = "trail-copy";
          el.src = lead.currentSrc || lead.src;
          el.alt = "";
          el.setAttribute("aria-hidden", "true");
          media.insertBefore(el, media.firstChild);
          copies.push(el);
        }
        var opacity = i === 0 ? 1 : 0.8;
        var wait = TRAIL_APPEAR + TRAIL_HOLD + i * TRAIL_STAGGER;
        var total = wait + TRAIL_FLIGHT;
        animations.push(
          el.animate(
            [
              { offset: 0, transform: enter, opacity: 0, easing: "ease-out" },
              { offset: TRAIL_APPEAR / total, transform: start, opacity: opacity, easing: "linear" },
              { offset: wait / total, transform: start, opacity: opacity, easing: TRAIL_EASE },
              { offset: 1, transform: LANDED, opacity: opacity }
            ],
            { duration: total, fill: "both" }
          )
        );
      }

      var cleanup = function () {
        reveal(lead);
        animations.forEach(function (animation) {
          animation.cancel();
        });
        copies.forEach(function (copy) {
          copy.remove();
        });
      };

      Promise.all(
        animations.map(function (animation) {
          return animation.finished;
        })
      ).then(cleanup, cleanup);
    };

    var trailObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var media = entry.target;
          var lead = media.querySelector("img");

          if (entry.intersectionRatio >= 0.3) {
            trailObserver.unobserve(media);
            var play = function () {
              runTrail(media, lead);
            };
            if (typeof lead.decode === "function") {
              lead.decode().then(play, function () {
                reveal(lead);
              });
            } else {
              play();
            }
          } else if (entry.boundingClientRect.bottom < 0) {
            // Already scrolled past (e.g. page reloaded further down).
            trailObserver.unobserve(media);
            reveal(lead);
          }
        });
      },
      { threshold: [0, 0.3] }
    );

    Array.prototype.forEach.call(trailMedia, function (media) {
      var lead = media.querySelector("img");
      if (!lead) return;
      lead.style.opacity = "0";
      trailObserver.observe(media);
    });
  }

  // Selected works pinned panels -------------------------------------------
  // Adapted from "On-scroll clipped sections": the project panels are pinned
  // while the section scrolls, and each one is wiped upwards to reveal the
  // next. The photos follow the background with a short lag. Each wipe moves a
  // layer up while its content moves down by the same amount, so only
  // transforms change. With "reduce motion" the panels simply stack.
  var showcase = document.querySelector("[data-showcase]");

  if (showcase && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var sticky = showcase.querySelector(".showcase__sticky");
    var panels = Array.prototype.map.call(showcase.querySelectorAll(".showcase__panel"), function (panel) {
      return {
        surface: panel.querySelector(".showcase__layer--surface"),
        media: panel.querySelector(".showcase__layer--media")
      };
    });
    var HOLD = 0.15; // share of a screen to scroll before the first wipe
    var LAG = 160; // ms for the photos to catch up (time constant)
    var target = 0;
    var lagged = 0;
    var lastFrame = 0;
    var pinRunning = false;

    showcase.style.setProperty("--panels", panels.length);
    showcase.classList.add("is-pinned");

    var wipe = function (layer, amount) {
      var shift = Math.min(Math.max(amount, 0), 1) * 100;
      layer.style.transform = shift ? "translate3d(0," + -shift.toFixed(3) + "%,0)" : "";
      layer.firstElementChild.style.transform = shift ? "translate3d(0," + shift.toFixed(3) + "%,0)" : "";
    };

    var pinTick = function (now) {
      var height = sticky.offsetHeight;
      var travel = -showcase.getBoundingClientRect().top - HOLD * height;
      target = Math.min(Math.max(travel / height, 0), panels.length - 1);

      var dt = lastFrame ? Math.min(now - lastFrame, 64) : 16;
      lastFrame = now;
      lagged += (target - lagged) * (1 - Math.exp(-dt / LAG));
      if (Math.abs(target - lagged) < 0.0005) lagged = target;

      // The last panel is never wiped away.
      for (var i = 0; i < panels.length - 1; i++) {
        wipe(panels[i].surface, target - i);
        wipe(panels[i].media, lagged - i);
      }

      if (lagged !== target) {
        window.requestAnimationFrame(pinTick);
      } else {
        pinRunning = false;
        lastFrame = 0;
      }
    };

    var requestPin = function () {
      if (!pinRunning) {
        pinRunning = true;
        window.requestAnimationFrame(pinTick);
      }
    };

    var showcaseVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        showcaseVisible = entries[0].isIntersecting;
        requestPin();
      }).observe(showcase);
    }

    window.addEventListener(
      "scroll",
      function () {
        if (showcaseVisible) requestPin();
      },
      { passive: true }
    );
    window.addEventListener("resize", requestPin);
    requestPin();
  }

  // Portfolio grid ---------------------------------------------------------
  // Filters the projects by service and lists them in batches, so the page
  // stays manageable as the portfolio grows. Counts are taken from the cards
  // themselves. Without JavaScript every project is listed.
  var portfolio = document.querySelector("[data-portfolio]");

  if (portfolio) {
    var PAGE_SIZE = 6;
    var projectCards = Array.prototype.slice.call(portfolio.querySelectorAll(".project-card"));
    var projectGrid = portfolio.querySelector("[data-projects]");
    var filterBar = portfolio.querySelector("[data-filters]");
    var filterButtons = Array.prototype.slice.call(portfolio.querySelectorAll("[data-filter]"));
    var moreButton = portfolio.querySelector("[data-show-more]");
    var portfolioStatus = portfolio.querySelector("[data-portfolio-status]");
    var activeFilter = "all";
    var limit = PAGE_SIZE;

    var refreshMotion = function () {}; // set by the column motion below

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
      refreshMotion();
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

    // Column motion ----------------------------------------------------------
    // Adapted from the Codrops demo "On-Scroll Column & Row Animations"
    // (demo 1): while the grid scrolls by, each column travels a little faster
    // than the one to its left, and every photo drifts inside its frame. The
    // motion follows an eased copy of the scroll position, which gives it the
    // demo's glide without taking over the page scroll. On phones (one
    // column) only the photo drift remains. Off with "reduce motion".
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var COLUMN_SPEED = 0.06; // extra speed per column, as a share of the scroll
      var PHOTO_DRIFT = 0.04; // photo travel either way, as a share of its height
      var GLIDE = 90; // ms for the motion to catch up with the scroll

      var motionLayout = null;
      var easedY = window.scrollY;
      var lastMotionFrame = 0;
      var motionRunning = false;

      var measureMotion = function () {
        var gridTop = projectGrid.getBoundingClientRect().top + window.scrollY;
        var shownCards = projectCards.filter(function (card) {
          return !card.hidden;
        });
        var columnLefts = [];
        shownCards.forEach(function (card) {
          if (columnLefts.indexOf(card.offsetLeft) === -1) columnLefts.push(card.offsetLeft);
        });
        columnLefts.sort(function (x, y) {
          return x - y;
        });
        motionLayout = {
          start: Math.max(0, gridTop - window.innerHeight),
          end: Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, gridTop + projectGrid.offsetHeight)),
          cards: shownCards.map(function (card) {
            var image = card.querySelector(".project-card__image");
            return {
              card: card,
              image: image,
              column: columnLefts.indexOf(card.offsetLeft),
              top: gridTop + card.offsetTop,
              height: card.offsetHeight,
              imageHeight: image.offsetHeight
            };
          })
        };
      };

      var motionFrame = function (now) {
        var dt = lastMotionFrame ? Math.min(now - lastMotionFrame, 64) : 16;
        var scrollY = window.scrollY;
        var viewHeight = window.innerHeight;
        lastMotionFrame = now;
        easedY += (scrollY - easedY) * (1 - Math.exp(-dt / GLIDE));
        if (Math.abs(scrollY - easedY) < 0.5) easedY = scrollY;

        var travel = Math.min(Math.max(easedY - motionLayout.start, 0), Math.max(motionLayout.end - motionLayout.start, 0));
        motionLayout.cards.forEach(function (item) {
          var shift = -item.column * COLUMN_SPEED * travel;
          var viewTop = item.top + shift - easedY;
          if (viewTop > viewHeight + 300 || viewTop + item.height < -300) return;
          // 0 as the card enters at the bottom, 1 as it leaves at the top.
          var pass = Math.min(Math.max((viewHeight - viewTop) / (viewHeight + item.height), 0), 1);
          item.card.style.transform = shift ? "translate3d(0," + shift.toFixed(1) + "px,0)" : "";
          item.image.style.setProperty("--drift", ((0.5 - pass) * 2 * PHOTO_DRIFT * item.imageHeight).toFixed(1) + "px");
        });

        if (easedY !== scrollY) {
          window.requestAnimationFrame(motionFrame);
        } else {
          motionRunning = false;
          lastMotionFrame = 0;
        }
      };

      var requestMotion = function () {
        if (!motionRunning && motionLayout) {
          motionRunning = true;
          window.requestAnimationFrame(motionFrame);
        }
      };

      refreshMotion = function () {
        measureMotion();
        requestMotion();
      };

      projectGrid.classList.add("has-motion");
      refreshMotion();
      window.addEventListener("scroll", requestMotion, { passive: true });
      window.addEventListener("resize", refreshMotion);
      // Photos load after the first measurement and change the card heights.
      Array.prototype.forEach.call(projectGrid.querySelectorAll("img"), function (image) {
        if (!image.complete) image.addEventListener("load", refreshMotion);
      });
    }
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
  // The footer is revealed like a curtain at the end of the page (main.css,
  // "Footer"). While the page content slides off the big "HICIRCUS STUDIO",
  // its letters rise into place one after another and the word brightens;
  // scrolling back up reverses it. The motion is finished exactly when the
  // word is fully uncovered.
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
      // passed above it. (Without the sticky footer the word simply scrolls
      // in, and the same measure still applies.)
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

  // Reveal on scroll ---------------------------------------------------------
  // Headings rise line by line (or word by word) and text, quotes and images
  // ease in as they reach the screen (the looks are in main.css, "Reveal on
  // scroll"). The inline script in <head> hides them before the first paint
  // by adding .js-reveal to <html>, so content already on screen animates in
  // on load without flickering. Without that class (JavaScript off, "reduce
  // motion", or main.js too slow) everything is simply shown. Elements that
  // arrive together are staggered slightly.
  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var revealing = document.documentElement.classList.contains("js-reveal");
  window.hicircusReveal = true;

  if (revealItems.length && revealing && !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-revealed");
    });
  } else if (revealItems.length && revealing) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        var order = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.setProperty("--reveal-delay", order++ * 90 + "ms");
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    // Headings that wrap freely are split into words so they can rise one
    // word at a time. Screen readers keep reading the original sentence.
    var splitWords = function (heading) {
      var label = document.createElement("span");
      var words = document.createElement("span");
      var count = 0;
      var addWord = function (content) {
        var word = document.createElement("span");
        var inner = document.createElement("span");
        word.className = "word";
        inner.className = "word__inner";
        inner.style.setProperty("--w", count++);
        inner.appendChild(content);
        word.appendChild(inner);
        words.appendChild(word);
      };

      label.className = "visually-hidden";
      label.textContent = heading.textContent;
      words.setAttribute("aria-hidden", "true");
      Array.prototype.slice.call(heading.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) {
          addWord(node.cloneNode(true));
          return;
        }
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) words.appendChild(document.createTextNode(" "));
          else addWord(document.createTextNode(part));
        });
      });
      heading.textContent = "";
      heading.appendChild(label);
      heading.appendChild(words);
      heading.classList.add("is-split");
    };

    var onLoad = 0;
    revealItems.forEach(function (item) {
      if (item.getAttribute("data-reveal") === "words") splitWords(item);
      var box = item.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        // Already on screen: play right away, after the page's intro.
        item.style.setProperty("--reveal-delay", 250 + onLoad++ * 90 + "ms");
        item.classList.add("is-revealed");
      } else {
        revealObserver.observe(item);
      }
    });
  }

  // About image band -------------------------------------------------------
  // The full-width photo opens out from an inset, rounded frame as it
  // scrolls into view (main.css, "About image band") and drifts a little
  // slower than the page.
  var band = document.querySelector("[data-band]");

  if (band && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var bandImage = band.querySelector("img");
    var bandTicking = false;

    var updateBand = function () {
      bandTicking = false;
      var box = band.getBoundingClientRect();
      var viewHeight = window.innerHeight;
      if (box.bottom < -100 || box.top > viewHeight + 100) return;
      // Fully open once its top edge is a quarter of the way down the screen.
      var open = Math.min(Math.max((viewHeight - box.top) / (viewHeight * 0.75), 0), 1);
      var pass = Math.min(Math.max((viewHeight - box.top) / (viewHeight + box.height), 0), 1);
      band.style.setProperty("--open", open.toFixed(3));
      bandImage.style.translate = "0 " + ((0.5 - pass) * 16).toFixed(2) + "%";
    };

    var requestBand = function () {
      if (!bandTicking) {
        bandTicking = true;
        window.requestAnimationFrame(updateBand);
      }
    };

    band.classList.add("is-animated");
    window.addEventListener("scroll", requestBand, { passive: true });
    window.addEventListener("resize", requestBand);
    updateBand();
  }

  // Testimonials watermark -------------------------------------------------
  // The large "VOICES" word drifts sideways while the section scrolls by.
  var voicesMark = document.querySelector(".voices__watermark");

  if (voicesMark && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var voicesSection = voicesMark.closest(".voices");
    var voicesTicking = false;

    var driftVoices = function () {
      voicesTicking = false;
      var box = voicesSection.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      var pass = (window.innerHeight - box.top) / (window.innerHeight + box.height);
      voicesMark.style.translate = ((0.5 - pass) * 14).toFixed(2) + "% 0";
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!voicesTicking) {
          voicesTicking = true;
          window.requestAnimationFrame(driftVoices);
        }
      },
      { passive: true }
    );
    driftVoices();
  }

  // Expertise previous / next ----------------------------------------------
  var services = Array.prototype.slice.call(document.querySelectorAll(".service"));
  var stepButtons = document.querySelectorAll("[data-service-step]");

  if (services.length && stepButtons.length) {
    var current = -1;

    var show = function (index) {
      current = (index + services.length) % services.length;
      services.forEach(function (service, i) {
        service.classList.toggle("is-active", i === current);
      });
      services[current].scrollIntoView({ behavior: "smooth", block: "center" });
    };

    Array.prototype.forEach.call(stepButtons, function (button) {
      button.addEventListener("click", function () {
        var step = Number(button.getAttribute("data-service-step")) || 1;
        show(current === -1 ? (step > 0 ? 0 : services.length - 1) : current + step);
      });
    });
  }
})();
