/* Portfolio interactions. No dependencies. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- footer year ----- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----- mobile menu ----- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ----- highlight the section in view ----- */
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  var linkFor = {};
  var sections = [];
  Array.prototype.forEach.call(navLinks, function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) {
      linkFor[id] = a;
      sections.push(el);
    }
  });

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Array.prototype.forEach.call(navLinks, function (a) {
            a.classList.remove("is-current");
            a.removeAttribute("aria-current");
          });
          var link = linkFor[entry.target.id];
          link.classList.add("is-current");
          link.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ----- conference photo slideshow ----- */
  Array.prototype.forEach.call(document.querySelectorAll(".slideshow"), initSlideshow);

  function initSlideshow(root) {
    var slides = root.querySelectorAll(".slide");
    var caption = root.querySelector(".slide-caption");
    var dotsBox = root.querySelector(".slide-dots");
    var toggleBtn = root.querySelector('[data-action="toggle"]');
    if (slides.length < 2 || !caption || !dotsBox || !toggleBtn) return;

    var INTERVAL_MS = 6000;
    var index = 0;
    var timer = null;
    var userPaused = reduceMotion; // no auto-advance when the visitor prefers reduced motion
    var hovering = false;
    var inView = true;
    var dots = [];

    Array.prototype.forEach.call(slides, function (slide, i) {
      var img = slide.querySelector("img");
      if (img) img.loading = "eager";
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slide-dot";
      dot.setAttribute("aria-label", "Show photo " + (i + 1) + " of " + slides.length);
      dot.addEventListener("click", function () {
        show(i, true);
      });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });

    function show(next, byUser) {
      index = (next + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        dots[i].setAttribute("aria-current", active ? "true" : "false");
      });
      var cap = slides[index].querySelector("figcaption");
      caption.textContent = cap ? cap.textContent.replace(/\s+/g, " ").trim() : "";
      caption.setAttribute("aria-live", byUser ? "polite" : "off");
      if (byUser) schedule();
    }

    function schedule() {
      window.clearTimeout(timer);
      if (userPaused || hovering || !inView || document.hidden) return;
      timer = window.setTimeout(function () {
        show(index + 1, false);
        schedule();
      }, INTERVAL_MS);
    }

    function setPaused(paused) {
      userPaused = paused;
      toggleBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      toggleBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
      schedule();
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var action = btn.getAttribute("data-action");
      if (action === "prev") show(index - 1, true);
      if (action === "next") show(index + 1, true);
      if (action === "toggle") setPaused(!userPaused);
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(index - 1, true);
      if (e.key === "ArrowRight") show(index + 1, true);
    });
    root.addEventListener("mouseenter", function () {
      hovering = true;
      schedule();
    });
    root.addEventListener("mouseleave", function () {
      hovering = false;
      schedule();
    });
    root.addEventListener("focusin", function () {
      hovering = true;
      schedule();
    });
    root.addEventListener("focusout", function () {
      hovering = false;
      schedule();
    });
    document.addEventListener("visibilitychange", schedule);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          inView = entries[0].isIntersecting;
          schedule();
        },
        { threshold: 0.25 }
      ).observe(root);
    }

    root.classList.add("is-ready");
    show(0, false);
    setPaused(userPaused);
  }

  /* ----- hero signal: free-vibration response of three damped modes -----
     x(t) = sum_i A_i * exp(-zeta_i * w_i * t) * cos(w_d,i * t + phi_i),
     with w_d,i = w_i * sqrt(1 - zeta_i^2).
     A read head sweeps left to right like a live sensor trace, holds the
     full response, then starts again. */
  var canvas = document.getElementById("signal");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var modes = [
    { A: 0.62, w: 5.2, z: 0.03, p: 0.0 },
    { A: 0.3, w: 13.7, z: 0.055, p: 1.1 },
    { A: 0.14, w: 27.3, z: 0.08, p: 2.4 }
  ];
  var DURATION_S = 9; // seconds of signal across the full width
  var SWEEP_MS = 6500; // time for the read head to cross the canvas
  var HOLD_MS = 2500; // pause on the finished trace before the next sweep
  var W = 0;
  var H = 0;
  var colors = { line: "", accent: "" };

  function signal(t) {
    var x = 0;
    for (var i = 0; i < modes.length; i++) {
      var m = modes[i];
      var wd = m.w * Math.sqrt(1 - m.z * m.z);
      x += m.A * Math.exp(-m.z * m.w * t) * Math.cos(wd * t + m.p);
    }
    return x;
  }

  function readColors() {
    var css = getComputedStyle(document.documentElement);
    colors.line = css.getPropertyValue("--line").trim();
    colors.accent = css.getPropertyValue("--accent").trim();
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(fraction) {
    var mid = H / 2;
    var amp = H * 0.42; // |x(t)| <= sum of A_i = 1.06, so the trace stays inside the canvas
    var yAt = function (px) {
      return mid - signal((px / W) * DURATION_S) * amp;
    };
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();

    var end = Math.max(1, W * fraction);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, yAt(0));
    for (var px = 1; px < end; px++) ctx.lineTo(px, yAt(px));
    ctx.lineTo(end, yAt(end));
    ctx.stroke();

    if (fraction < 1) {
      // read head: a faint cursor line and a dot riding on the trace
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(end, 4);
      ctx.lineTo(end, H - 4);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(end, yAt(end), 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var elapsed = 0; // animation clock in ms; it only advances while the canvas is on screen
  var lastTs = null;
  var running = false;

  function currentFraction() {
    if (reduceMotion) return 1;
    return Math.min((elapsed % (SWEEP_MS + HOLD_MS)) / SWEEP_MS, 1);
  }

  function frame(ts) {
    if (!running) return;
    if (lastTs !== null) elapsed += Math.min(ts - lastTs, 100);
    lastTs = ts;
    draw(currentFraction());
    window.requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (reduceMotion || on === running) return;
    running = on;
    lastTs = null;
    if (on) window.requestAnimationFrame(frame);
  }

  readColors();
  resize();
  draw(currentFraction());

  if (!reduceMotion) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        setRunning(entries[0].isIntersecting);
      }).observe(canvas);
    } else {
      setRunning(true);
    }
  }

  window.addEventListener("resize", function () {
    resize();
    draw(currentFraction());
  });
  var scheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (scheme.addEventListener) {
    scheme.addEventListener("change", function () {
      readColors();
      draw(currentFraction());
    });
  }
})();
