// ─── Plugin Registration ───────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, Draggable);

// ─── Lenis Smooth Scroll ───────────────────────────────────────────────────
window.lenis = new Lenis({ smoothWheel: true });

// ─── Connect Lenis ↔ ScrollTrigger ────────────────────────────────────────
window.lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((t) => window.lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    if (arguments.length) window.lenis.scrollTo(value, { immediate: true });
    return window.lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.body.style.transform ? 'transform' : 'fixed'
});
