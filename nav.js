document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const HIDE_Y        = "-10em";
  const SHOW_Y        = "0em";
  const TOP_THRESHOLD = 10;
  const SCROLL_LIMIT  = 60;

  let lastScroll = 0;
  let navHidden  = false;
  let bgActive   = false;

  gsap.set(nav, { y: SHOW_Y });
  nav.style.backgroundColor = "transparent";

  window.lenis.on("scroll", ({ scroll: current }) => {
    // ── Background ──────────────────────────────────────────
    if (current <= TOP_THRESHOLD && bgActive) {
      bgActive = false;
      gsap.to(nav, { backgroundColor: "transparent", duration: 0.5, ease: "power2.out" });
    }
    if (current > TOP_THRESHOLD && !bgActive) {
      bgActive = true;
      gsap.to(nav, { backgroundColor: "var(--color-primary)", duration: 0.5, ease: "power2.out" });
    }

    // ── Hide / Show ─────────────────────────────────────────
    if (current > lastScroll + 2 && current > SCROLL_LIMIT && !navHidden) {
      navHidden = true;
      gsap.to(nav, { y: HIDE_Y, duration: 0.6, ease: "power2.out" });
    }
    if (current < lastScroll - 2 && navHidden) {
      navHidden = false;
      gsap.to(nav, { y: SHOW_Y, duration: 0.55, ease: "power2.out" });
    }
    if (current <= 0) {
      navHidden = false;
      gsap.to(nav, { y: SHOW_Y, duration: 0.5 });
    }

    lastScroll = current;
  });
});
