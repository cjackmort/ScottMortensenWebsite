/* ============================================================
   SCOTT MORTENSEN FINE ARTS — Test Website v2
   Animation overhaul inspired by:
   endlesstools.io · antlii.work · magicanimator.com · neurascapes.com
   ============================================================ */

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------- MAGNETIC CURSOR (endlesstools.io) ---------- */
const cursorEl   = document.getElementById('cursor');
const followerEl = document.getElementById('cursorFollower');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let dot   = { x: mouse.x, y: mouse.y };
let ring  = { x: mouse.x, y: mouse.y };

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

(function tickCursor() {
  dot.x  = lerp(dot.x,  mouse.x, 0.25);
  dot.y  = lerp(dot.y,  mouse.y, 0.25);
  ring.x = lerp(ring.x, mouse.x, 0.07);
  ring.y = lerp(ring.y, mouse.y, 0.07);
  if (cursorEl)   { cursorEl.style.left   = dot.x  + 'px'; cursorEl.style.top   = dot.y  + 'px'; }
  if (followerEl) { followerEl.style.left = ring.x + 'px'; followerEl.style.top = ring.y + 'px'; }
  requestAnimationFrame(tickCursor);
})();

// Magnetic pull: cursor drifts slightly toward interactive elements
document.querySelectorAll('a, button, .g-item, .filter-btn, .test-card, .nav-cta').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorEl?.classList.add('hover');
    followerEl?.classList.add('hover');
  });
  el.addEventListener('mousemove', e => {
    const r  = el.getBoundingClientRect();
    const mx = r.left + r.width  / 2;
    const my = r.top  + r.height / 2;
    mouse.x = e.clientX - (e.clientX - mx) * 0.28;
    mouse.y = e.clientY - (e.clientY - my) * 0.28;
  });
  el.addEventListener('mouseleave', () => {
    cursorEl?.classList.remove('hover');
    followerEl?.classList.remove('hover');
    mouse.x = dot.x;
    mouse.y = dot.y;
  });
});

/* ---------- NAV — hide on scroll down, reveal on scroll up ---------- */
const nav = document.getElementById('nav');
let prevScrollY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  if (y > 120) {
    nav.classList.toggle('nav-hidden',  y > prevScrollY + 4);
    nav.classList.toggle('nav-visible', y < prevScrollY - 4);
  } else {
    nav.classList.remove('nav-hidden', 'nav-visible');
  }
  prevScrollY = y;
}, { passive: true });

/* ---------- MOBILE MENU ---------- */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.mobile-link').forEach(link =>
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  })
);

/* ---------- HERO: CHARACTER-BY-CHARACTER ENTRANCE (antlii.work) ---------- */
function splitIntoChars(el) {
  const text = el.textContent;
  el.textContent = '';
  return [...text].map(ch => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.className = 'char-outer';
    inner.className = 'char-inner';
    inner.textContent = ch === ' ' ? ' ' : ch;
    outer.appendChild(inner);
    el.appendChild(outer);
    return inner;
  });
}

window.addEventListener('load', () => {
  // Split "Scott" and "Mortensen" into chars and animate each
  document.querySelectorAll('.ht-line em, .ht-line strong').forEach((wordEl, wi) => {
    const chars = splitIntoChars(wordEl);
    chars.forEach((ch, ci) => {
      setTimeout(() => ch.classList.add('in'), 450 + wi * 200 + ci * 38);
    });
  });
  // Fade in supporting hero elements
  document.querySelectorAll('[data-hero-anim]').forEach(el => {
    if (el.classList.contains('hero-title')) return;
    const idx = parseFloat(el.getAttribute('data-hero-anim'));
    setTimeout(() => el.classList.add('visible'), idx * 200 + 350);
  });
});

/* ---------- TEXT SCRAMBLE on eyebrows (endlesstools.io) ---------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789◆·—';
function scrambleText(el) {
  const target = el.dataset.scramble || el.textContent.trim();
  el.dataset.scramble = target;
  let frame = 0;
  const total = target.length * 3.5;
  const tick = () => {
    el.textContent = [...target].map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i < frame / 3.5) return ch;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }).join('');
    if (++frame <= total) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  tick();
}
const scrambleObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { scrambleText(e.target); scrambleObs.unobserve(e.target); }});
}, { threshold: 0.7 });
document.querySelectorAll('.eyebrow').forEach(el => scrambleObs.observe(el));

/* ---------- HERO PARALLAX ---------- */
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.5)
      heroImg.style.transform = `translateY(${y * 0.28}px)`;
  }, { passive: true });
}

/* ---------- SCROLL REVEAL — clip-path wipe (neurascapes.com) ---------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(
      entry.target.parentElement?.querySelectorAll('[data-reveal]') || []
    );
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('revealed'), clamp(idx * 110, 0, 500));
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

/* ---------- COUNTERS — spring physics (magicanimator.com) ---------- */
function springCount(el) {
  const target = parseInt(el.getAttribute('data-count'));
  let val = 0, vel = 0;
  const tick = () => {
    vel  += (target - val) * 0.09;
    vel  *= 0.70;
    val  += vel;
    el.textContent = Math.round(val);
    if (Math.abs(target - val) > 0.3) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { springCount(e.target); countObs.unobserve(e.target); }});
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

/* ---------- 3D CARD TILT (endlesstools.io + magicanimator.com) ---------- */
function addTilt(selector, maxDeg = 8, hoverScale = 1.025, tz = 8) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) scale(${hoverScale}) translateZ(${tz}px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1) translateZ(0)';
    });
  });
}
addTilt('.test-card', 6, 1.025, 8);
addTilt('.process-step', 5, 1.02, 6);

/* Gallery: expand card + uncrop image on hover */
document.querySelectorAll('.g-item').forEach(card => {
  const img = card.querySelector('.g-img');
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width  - 0.5;
    const ny = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform =
      `perspective(1000px) rotateY(${nx * 3}deg) rotateX(${-ny * 3}deg) scale(1.1) translateZ(20px)`;
    card.style.zIndex = '20';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.zIndex    = '';
    if (img) img.style.transform = '';
  });
});

/* ---------- GALLERY FILTER ---------- */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.g-item').forEach(item => {
      item.classList.toggle('hidden', filter !== 'all' && item.getAttribute('data-cat') !== filter);
    });
  });
});

/* ---------- MARQUEE ----------
   Runs at one constant speed, fully decoupled from scrolling.

   The previous version drove animationDuration from scroll velocity, which had
   two problems: fast scrolling cut the duration from 30s to 5s (a 6x speed-up),
   and rewriting animationDuration every frame makes the browser re-map elapsed
   time onto the new duration, so the band jumped position on each change.
   Speed now lives entirely in CSS (--marquee-duration); JS touches nothing. */

/* ---------- PULL QUOTE LINE DRAW ---------- */
const pqObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); pqObs.unobserve(e.target); }});
}, { threshold: 0.45 });
const pqInner = document.querySelector('.pq-inner');
if (pqInner) pqObs.observe(pqInner);

/* ---------- PROCESS STEPS — alternate slide-in (neurascapes.com) ---------- */
const psObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ps-in'); psObs.unobserve(e.target); }});
}, { threshold: 0.2 });
document.querySelectorAll('.process-step').forEach((el, i) => {
  el.classList.add(i % 2 === 0 ? 'ps-left' : 'ps-right');
  psObs.observe(el);
});

/* ---------- RADIAL GLOW FOLLOWS MOUSE (neurascapes.com) ---------- */
['.about', '.contact', '.testimonials'].forEach(sel => {
  const el = document.querySelector(sel);
  if (!el) return;
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
  });
});

/* ---------- GALLERY ITEMS CLIP-PATH STAGGER ---------- */
const galleryObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const all  = Array.from(document.querySelectorAll('.g-item:not(.hidden)'));
    const idx  = all.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('g-revealed'), (idx % 4) * 90);
    galleryObs.unobserve(entry.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.g-item').forEach(el => galleryObs.observe(el));

/* ---------- CONTACT FORM ---------- */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const orig = btn.textContent; btn.textContent = 'Sending…'; btn.disabled = true;
    try {
      const res = await fetch('https://formspree.io/f/xaewbako', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      if (res.ok) { contactForm.style.display = 'none'; formSuccess.classList.add('show'); }
      else throw new Error();
    } catch { btn.textContent = orig; btn.disabled = false;
      alert('Something went wrong. Please email scottmortensenfinearts@gmail.com directly.'); }
  });
}

/* ---------- PRELOADER (Lando-inspired intro) ---------- */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 1650);
});

/* ---------- CANVAS: Animated Brown Flowing Lines ---------- */
(function () {
  const canvas = document.getElementById('hcCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Line definitions: y(0-1), amplitude, wave-freq, phase, speed, color, lineWidth
  const lines = [
    { y: 0.04, amp: 0.055, freq: 0.7,  ph: 0.0,  spd: 0.18, col: 'rgba(120,72,40,0.55)',  lw: 1.1 },
    { y: 0.11, amp: 0.035, freq: 1.3,  ph: 1.2,  spd: 0.12, col: 'rgba(96,58,30,0.42)',   lw: 0.7 },
    { y: 0.19, amp: 0.08,  freq: 0.55, ph: 2.5,  spd: 0.22, col: 'rgba(170,104,56,0.38)', lw: 1.7 },
    { y: 0.27, amp: 0.03,  freq: 1.7,  ph: 0.8,  spd: 0.10, col: 'rgba(134,82,44,0.28)',  lw: 0.8 },
    { y: 0.35, amp: 0.07,  freq: 0.9,  ph: 3.7,  spd: 0.20, col: 'rgba(212,137,78,0.32)', lw: 2.1 },
    { y: 0.43, amp: 0.045, freq: 1.15, ph: 1.9,  spd: 0.15, col: 'rgba(118,72,38,0.48)',  lw: 1.0 },
    { y: 0.51, amp: 0.09,  freq: 0.65, ph: 4.2,  spd: 0.24, col: 'rgba(158,98,52,0.35)',  lw: 1.9 },
    { y: 0.59, amp: 0.038, freq: 1.45, ph: 2.1,  spd: 0.11, col: 'rgba(100,60,32,0.40)',  lw: 0.9 },
    { y: 0.67, amp: 0.062, freq: 0.8,  ph: 0.5,  spd: 0.19, col: 'rgba(188,116,64,0.30)', lw: 1.4 },
    { y: 0.75, amp: 0.05,  freq: 1.25, ph: 3.1,  spd: 0.14, col: 'rgba(126,77,41,0.44)',  lw: 1.1 },
    { y: 0.83, amp: 0.068, freq: 0.88, ph: 1.6,  spd: 0.21, col: 'rgba(92,55,28,0.36)',   lw: 1.5 },
    { y: 0.91, amp: 0.042, freq: 1.1,  ph: 4.8,  spd: 0.16, col: 'rgba(112,68,36,0.28)',  lw: 0.7 },
    { y: 0.15, amp: 0.058, freq: 0.48, ph: 2.9,  spd: 0.17, col: 'rgba(166,102,55,0.22)', lw: 2.6 },
    { y: 0.47, amp: 0.078, freq: 1.0,  ph: 0.3,  spd: 0.23, col: 'rgba(200,128,72,0.18)', lw: 3.1 },
  ];

  const t0 = performance.now();

  // Adjust alpha channel in rgba() string
  function withAlpha(col, factor) {
    return col.replace(/,([\d.]+)\)$/, (_, a) => `,${Math.min(1, parseFloat(a) * factor).toFixed(3)})`);
  }

  // Build path points for a line
  function buildPath(l, t) {
    const pts = 110, path = [];
    for (let i = 0; i <= pts; i++) {
      const nx = i / pts;
      path.push({
        x: nx * W,
        y: l.y * H
          + Math.sin(nx * Math.PI * 2 * l.freq + l.ph + t * l.spd)           * l.amp * H
          + Math.sin(nx * Math.PI * l.freq * 0.45 + t * l.spd * 0.65) * l.amp * 0.38 * H,
      });
    }
    return path;
  }

  // This loop strokes 14 lines x 4 glow passes x 110 points every frame, which
  // is far too much work to keep doing once the hero has scrolled away. Pause
  // when the canvas leaves the viewport and restart when it returns.
  let running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning) requestAnimationFrame(draw);
    }, { threshold: 0 }).observe(canvas);
  }

  function draw(now) {
    if (!running) return;   // observer above restarts the loop
    const t = (now - t0) * 0.001;
    ctx.clearRect(0, 0, W, H);

    // Each line: 4 passes — wide soft glow → narrow bright core
    // Overlapping glows compound, making dense areas visually richer/darker
    const passes = [
      { wm: 22, om: 0.025 },
      { wm: 10, om: 0.07  },
      { wm:  4, om: 0.20  },
      { wm:  1, om: 1.0   },
    ];

    lines.forEach(l => {
      const path = buildPath(l, t);
      passes.forEach(({ wm, om }) => {
        ctx.beginPath();
        ctx.strokeStyle = withAlpha(l.col, om);
        ctx.lineWidth   = l.lw * wm;
        ctx.lineJoin    = 'round';
        path.forEach(({ x, y }, i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.stroke();
      });
    });

    // (No vignette fill — the streaks layer sits on top of the sculpture, so
    // it must stay transparent except for the lines themselves.)

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ---------- HERO SCROLL PARALLAX (title fades up, sculpture zooms) ---------- */
(function () {
  const titleWrap  = document.querySelector('.hc-title-wrap');
  const sculpture  = document.getElementById('hcSculpture');

  window.addEventListener('scroll', () => {
    const p = clamp(window.scrollY / (window.innerHeight * 0.75), 0, 1);
    if (titleWrap) {
      titleWrap.style.opacity   = (1 - p * 1.6).toFixed(3);
      titleWrap.style.transform = `translateY(${-p * 70}px)`;
    }
    if (sculpture) {
      sculpture.style.transform = `translateY(-50%) scale(${1 + p * 0.07})`;
    }
  }, { passive: true });
})();

/* ---------- SCULPTURE REVEAL on load ---------- */
window.addEventListener('load', () => {
  // Reveal sculpture after preloader clears + title chars settle (~1.85s)
  setTimeout(() => document.getElementById('hcSculpture')?.classList.add('revealed'), 1850);
});

/* ---------- SMOOTH ANCHORS ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener('click', e => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
  })
);

/* ---------- REVEAL FAIL-SAFE ----------
   IntersectionObserver reveals can stall (background/non-composited tabs,
   throttling), leaving [data-reveal]/.g-item content permanently clipped.
   This sweep reveals anything in (or above) the viewport on load + scroll,
   so content is never stuck hidden. It only ADDS classes, so it composes
   safely with the observers above. */
(function revealFailsafe() {
  const inView = el => el.getBoundingClientRect().top < window.innerHeight * 0.92;
  function sweep(all) {
    document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => { if (all || inView(el)) el.classList.add('revealed'); });
    document.querySelectorAll('.g-item:not(.g-revealed)').forEach(el => { if (all || inView(el)) el.classList.add('g-revealed'); });
    document.querySelectorAll('.process-step:not(.ps-in)').forEach(el => { if (all || inView(el)) el.classList.add('ps-in'); });
    document.querySelectorAll('.pq-inner:not(.revealed)').forEach(el => { if (all || inView(el)) el.classList.add('revealed'); });
    document.querySelectorAll('[data-count]').forEach(el => { if ((all || inView(el)) && el.textContent.trim() === '0') el.textContent = el.getAttribute('data-count'); });
  }
  const showAll = () => sweep(true);
  sweep(false);
  window.addEventListener('load', () => { sweep(false); setTimeout(() => sweep(false), 300); });
  window.addEventListener('scroll', () => sweep(false), { passive: true });
  window.addEventListener('resize', () => sweep(false), { passive: true });
  window.addEventListener('visibilitychange', () => { if (!document.hidden) sweep(false); });
  // Hard fallback: hidden/throttled tabs (or missing IntersectionObserver) freeze
  // the observers, leaving content clipped. In that case just show everything so
  // content is never stuck hidden. (Visible tabs keep the scroll-reveal animation.)
  if (document.hidden || !('IntersectionObserver' in window)) showAll();
})();

/* ---------- CTA BAND PARALLAX ---------- */
const ctabBg   = document.querySelector('.ctab-bg');
const ctaBand  = ctabBg?.closest('.cta-band');
if (ctabBg && ctaBand) {
  window.addEventListener('scroll', () => {
    const r = ctaBand.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) {
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      ctabBg.style.transform = `scale(1.1) translateY(${(p - 0.5) * -55}px)`;
    }
  }, { passive: true });
}
