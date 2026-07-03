/* Portfolio interactions — no dependencies. */

(function () {
  "use strict";

  /* ----- footer year ----- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- mobile menu ----- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("site-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ----- scroll reveal ----- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealTargets = document.querySelectorAll(".pub, .research-card, .teach-card, .timeline li, .edu-list li");
  if (!reduce && "IntersectionObserver" in window) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ----- hero signature: free-vibration decay signal -----
     x(t) = sum_i A_i * exp(-zeta_i * w_i * t) * cos(w_di * t + phi_i)
     Drawn as a slow left-to-right sweep, like a live sensor trace.   */
  var canvas = document.getElementById("vibration");
  if (!canvas) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Three damped modes: (amplitude, natural freq rad/s, damping ratio, phase)
  var modes = [
    { A: 0.62, w: 5.2,  z: 0.030, p: 0.0 },
    { A: 0.30, w: 13.7, z: 0.055, p: 1.1 },
    { A: 0.14, w: 27.3, z: 0.080, p: 2.4 }
  ];

  function signal(t) {
    var x = 0;
    for (var i = 0; i < modes.length; i++) {
      var m = modes[i];
      var wd = m.w * Math.sqrt(1 - m.z * m.z);
      x += m.A * Math.exp(-m.z * m.w * t) * Math.cos(wd * t + m.p);
    }
    return x;
  }

  var W, H;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", function () { resize(); if (reduceMotion) drawStatic(); });

  /* colors tuned for the dark hero panel */
  var inkColor = "#9FE3DC";                       // trace: pale spectral teal
  var signalColor = "#FF6A3C";                    // read head: hot signal orange
  var lineColor = "rgba(255,255,255,0.12)";       // axis

  var DURATION = 9;            // seconds of signal shown across the width
  var mid = function () { return H * 0.52; };
  var amp = function () { return H * 0.36; };

  function drawAxis() {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid());
    ctx.lineTo(W, mid());
    ctx.stroke();
  }

  function drawTrace(fraction) {
    ctx.clearRect(0, 0, W, H);
    drawAxis();

    var n = Math.max(2, Math.floor(W * fraction));
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "rgba(14,124,123,0.9)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (var px = 0; px <= n; px++) {
      var t = (px / W) * DURATION;
      var y = mid() - signal(t) * amp();
      if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.shadowBlur = 0;

    // moving "read head" marker in the signal color
    if (fraction < 1) {
      var tHead = (n / W) * DURATION;
      var yHead = mid() - signal(tHead) * amp();
      ctx.shadowColor = "rgba(255,106,60,0.8)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = signalColor;
      ctx.beginPath();
      ctx.arc(n, yHead, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = signalColor;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(n, 6);
      ctx.lineTo(n, H - 6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawStatic() { drawTrace(1); }

  if (reduceMotion) {
    drawStatic();
    return;
  }

  var start = null;
  var SWEEP_MS = 6500;
  var HOLD_MS = 2500;

  function frame(ts) {
    if (start === null) start = ts;
    var elapsed = ts - start;
    var cycle = SWEEP_MS + HOLD_MS;
    var inCycle = elapsed % cycle;
    var fraction = Math.min(inCycle / SWEEP_MS, 1);
    drawTrace(fraction);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
