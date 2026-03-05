document.addEventListener('DOMContentLoaded', function() {

  // Scroll Reveal
  gsap.set('[data-scroll-reveal]', { autoAlpha: 0, y: 20 });
  ScrollTrigger.batch('[data-scroll-reveal]', {
    start: 'top 80%',
    once: true,
    onEnter: function(batch) {
      gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out',
        stagger: window.innerWidth > 478 ? 0.3 : 0
      });
    }
  });

  // Parallax
  function initGlobalParallax() {
    const mm = gsap.matchMedia();
    mm.add(
      {
        isMobile: "(max-width:479px)",
        isMobileLandscape: "(max-width:767px)",
        isTablet: "(max-width:991px)",
        isDesktop: "(min-width:992px)"
      },
      (context) => {
        const { isMobile, isMobileLandscape, isTablet } = context.conditions;
        const ctx = gsap.context(() => {
          document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
            const disable = trigger.getAttribute("data-parallax-disable");
            if (
              (disable === "mobile" && isMobile) ||
              (disable === "mobileLandscape" && isMobileLandscape) ||
              (disable === "tablet" && isTablet)
            ) return;
            const target = trigger.querySelector('[data-parallax="target"]') || trigger;
            const direction = trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";
            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true;
            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20;
            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20;
            const scrollStart = `clamp(${trigger.getAttribute("data-parallax-scroll-start") || "top bottom"})`;
            const scrollEnd = `clamp(${trigger.getAttribute("data-parallax-scroll-end") || "bottom top"})`;
            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: { trigger, start: scrollStart, end: scrollEnd, scrub },
              }
            );
          });
        });
        return () => ctx.revert();
      }
    );
  }
  initGlobalParallax();

  // Accordion
  document.querySelectorAll('[data-accordion-css-init]').forEach(function(acc) {
    var closeSiblings = acc.getAttribute('data-accordion-close-siblings') === 'true';
    acc.addEventListener('click', function(e) {
      var tog = e.target.closest('[data-accordion-toggle]');
      if (!tog) return;
      var panel = tog.closest('[data-accordion-status]');
      if (!panel) return;
      var active = panel.getAttribute('data-accordion-status') === 'active';
      panel.setAttribute('data-accordion-status', active ? 'not-active' : 'active');
      if (closeSiblings && !active) {
        acc.querySelectorAll('[data-accordion-status="active"]').forEach(function(s) {
          if (s !== panel) s.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });

});
