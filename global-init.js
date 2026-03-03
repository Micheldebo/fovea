// ─── Plugin Registration ───────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, Draggable);

// ─── Lenis Smooth Scroll ───────────────────────────────────────────────────
window.lenis = new Lenis({ smoothWheel: true });
gsap.ticker.add((t) => window.lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
