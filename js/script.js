/* ════════════════════════════════════════════════════════════
   SMP IT Ibnu Abbas Klaten — interaksi & motion
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────────── PRELOADER ───────────── */
  window.addEventListener("load", () => {
    const delay = reduceMotion ? 0 : 2000;
    setTimeout(() => {
      document.getElementById("preloader").classList.add("done");
      document.body.classList.add("loaded");
    }, delay);
  });
  // jaring pengaman bila 'load' terlambat (font eksternal dsb.)
  setTimeout(() => {
    document.getElementById("preloader").classList.add("done");
    document.body.classList.add("loaded");
  }, 4500);

  /* ───────────── NAVBAR: blur, hide-on-scroll ───────────── */
  const navbar = document.getElementById("navbar");
  const progress = document.getElementById("scrollProgress");
  const toTop = document.getElementById("toTop");
  const navLinks = document.getElementById("navLinks");
  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 40);
    // sembunyikan saat gulir turun, munculkan saat naik
    if (y > lastY && y > 320 && !navLinks.classList.contains("open")) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }
    lastY = y;

    // progress bar
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";

    // tombol ke atas
    toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  );

  /* ───────────── MENU MOBILE ───────────── */
  const hamburger = document.getElementById("hamburger");

  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("open");
      document.body.style.overflow = "";
    })
  );

  /* ───────────── SCROLLSPY ───────────── */
  const sections = document.querySelectorAll("main section[id]");
  const linkMap = new Map();
  document.querySelectorAll(".nav-link").forEach((l) => {
    linkMap.set(l.getAttribute("href").slice(1), l);
  });

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          linkMap.forEach((l) => l.classList.remove("active"));
          const link = linkMap.get(e.target.id);
          if (link) link.classList.add("active");
        }
      });
    },
    { rootMargin: "-42% 0px -52% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ───────────── REVEAL ON SCROLL ───────────── */
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          // stagger children
          const staggerItems = e.target.querySelectorAll(".stagger > *");
          staggerItems.forEach((child, i) => {
            child.style.transitionDelay = `${i * 80}ms`;
            child.classList.add("in-view");
          });
          // letter reveal
          const letters = e.target.querySelectorAll(".word-reveal");
          letters.forEach((l, i) => {
            l.style.transitionDelay = `${i * 40}ms`;
            l.classList.add("in-view");
          });
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ───────────── WORD ANIMATION SETUP ───────────── */
  function setupWordAnimation() {
    document.querySelectorAll("h2, h3").forEach((heading) => {
      if (heading.dataset.wordsDone) return;
      const text = heading.textContent.trim();
      if (!text) return;
      // Split by words, include trailing space in each word except last
      const words = text.match(/\S+/g) || [text];
      heading.innerHTML = words.map((word, i) =>
        `<span class="word-reveal" style="--dl:${i * 200}ms">${word}\u00A0</span>`
      ).join("");
      heading.dataset.wordsDone = "true";
    });
  }
  setupWordAnimation();

  /* ───────────── STAGGER LISTS ───────────── */
  document.querySelectorAll("ul:not(.nav-links):not(.social-list):not(.footer-nav):not(.filter-bar):not(#eksChips)").forEach((ul) => {
    if (ul.dataset.staggerDone) return;
    ul.classList.add("stagger");
    [...ul.children].forEach((li, i) => li.style.transitionDelay = `${i * 60}ms`);
    ul.dataset.staggerDone = "true";
  });

  /* ───────────── ANIMATED COUNTER ───────────── */
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const dur = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(easeOutExpo(p) * target).toLocaleString("id-ID");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".counter").forEach((c) => counterObs.observe(c));

  /* ───────────── TABS PILAR (sliding pill) ───────────── */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPill = document.getElementById("tabPill");
  const tabPanels = document.querySelectorAll(".tab-panel");

  function movePill(btn) {
    tabPill.style.left = btn.offsetLeft + "px";
    tabPill.style.width = btn.offsetWidth + "px";
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      movePill(btn);
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
    btn.addEventListener("mouseenter", () => {
      if (!btn.classList.contains("active")) movePill(btn);
    });
    btn.addEventListener("mouseleave", () => {
      const active = document.querySelector(".tab-btn.active");
      if (active) movePill(active);
    });
  });

  function initPill() {
    const active = document.querySelector(".tab-btn.active");
    if (active) movePill(active);
  }
  window.addEventListener("resize", initPill);
  // posisi pill setelah layout tab terlihat
  const tabsObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          initPill();
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  const tabsWrap = document.querySelector(".tabs");
  if (tabsWrap) tabsObs.observe(tabsWrap);

  /* ───────────── EKSKUL: switch putra/putri + filter bidang ───────────── */
  const eksSwitch = document.getElementById("eksSwitch");
  const eksGrid = document.getElementById("eksGrid");

  if (eksSwitch && eksGrid) {
    const eksPill = document.getElementById("eksPill");
    const eksTabs = eksSwitch.querySelectorAll(".eks-tab");
    const eksCards = eksGrid.querySelectorAll(".eks-card");
    const eksChips = document.querySelectorAll("#eksChips .eks-chip");

    let eksGender = "putra";
    let eksCat = "semua";
    let eksReady = false;

    function moveEksPill() {
      const active = eksSwitch.querySelector(".eks-tab.active");
      if (active) {
        eksPill.style.left = active.offsetLeft + "px";
        eksPill.style.width = active.offsetWidth + "px";
      }
    }

    // jumlah kegiatan per bidang untuk gender aktif
    function eksCount(key) {
      let n = 0;
      eksCards.forEach((c) => {
        if (c.dataset.gender === eksGender && (key === "semua" || c.dataset.cat === key)) n++;
      });
      return n;
    }

    function refreshEksChips() {
      eksChips.forEach((chip) => {
        const badge = chip.querySelector("em");
        if (badge) badge.textContent = eksCount(chip.dataset.cat);
      });
    }

    // animasi masuk bertahap untuk kartu yang tampil
    function playEks() {
      eksCards.forEach((c) => c.classList.remove("in-view"));
      void eksGrid.offsetWidth; // paksa reflow agar transisi diputar ulang
      let i = 0;
      eksCards.forEach((c) => {
        if (c.style.display === "none") return;
        c.style.setProperty("--d", reduceMotion ? "0ms" : i * 26 + "ms");
        c.classList.add("in-view");
        i++;
      });
    }

    function applyEks() {
      eksCards.forEach((c) => {
        const ok =
          c.dataset.gender === eksGender &&
          (eksCat === "semua" || c.dataset.cat === eksCat);
        c.style.display = ok ? "" : "none";
      });
      if (eksReady) playEks();
    }

    eksTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.gender === eksGender) return;
        eksGender = btn.dataset.gender;
        eksTabs.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        eksSwitch.dataset.gender = eksGender;
        moveEksPill();
        refreshEksChips();
        applyEks();
      });
    });

    eksChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        eksChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        eksCat = chip.dataset.cat;
        applyEks();
      });
    });

    // Reveal saat section masuk viewport
    const eksObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            eksReady = true;
            moveEksPill();
            playEks();
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    eksObs.observe(eksGrid);

    window.addEventListener("load", moveEksPill);
    window.addEventListener("resize", moveEksPill);

    refreshEksChips();
    applyEks();
  }

  /* ───────────── 3D TILT CARD ───────────── */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ───────────── MAGNETIC BUTTON ───────────── */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ───────────── GALERI: switch fasilitas/kegiatan ───────────── */
  const galSwitch = document.getElementById("galSwitch");
  const galGrid = document.getElementById("galGrid");

  if (galSwitch && galGrid) {
    const galPill = document.getElementById("galPill");
    const galTabs = galSwitch.querySelectorAll(".gal-tab");
    const galItems = galGrid.querySelectorAll(".gal-item");

    let galCat = "fasilitas";
    let galReady = false;

    function moveGalPill() {
      const active = galSwitch.querySelector(".gal-tab.active");
      if (active) {
        galPill.style.left = active.offsetLeft + "px";
        galPill.style.width = active.offsetWidth + "px";
      }
    }

    function playGal() {
      galItems.forEach((it) => it.classList.remove("in-view"));
      void galGrid.offsetWidth;
      let i = 0;
      galItems.forEach((it) => {
        if (it.style.display === "none") return;
        it.style.setProperty("--d", reduceMotion ? "0ms" : i * 24 + "ms");
        it.classList.add("in-view");
        i++;
      });
    }

    function applyGal() {
      galItems.forEach((it) => {
        const ok = galCat === "semua" || it.dataset.gal === galCat;
        it.style.display = ok ? "" : "none";
      });
      if (galReady) playGal();
    }

    galTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.gal === galCat) return;
        galCat = btn.dataset.gal;
        galTabs.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        galSwitch.dataset.gal = galCat;
        moveGalPill();
        applyGal();
      });
    });

    const galObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            galReady = true;
            moveGalPill();
            playGal();
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    galObs.observe(galGrid);

    window.addEventListener("load", moveGalPill);
    window.addEventListener("resize", moveGalPill);

    applyGal();
  }

  /* ───────────── PARALLAX ORNAMENT HERO ───────────── */
  const ornaments = document.querySelectorAll(".ornament");
  if (!reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        ornaments.forEach((o, i) => {
          o.style.translate = `0 ${(y * (0.06 + i * 0.05)).toFixed(1)}px`;
        });
      },
      { passive: true }
    );
  }
})();