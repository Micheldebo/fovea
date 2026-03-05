function onReady(fn) {
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn)
    : fn();
}

onReady(function () {

  // Parallax
  gsap.matchMedia().add({
    isMobile: '(max-width:479px)',
    isMobileLandscape: '(max-width:767px)',
    isTablet: '(max-width:991px)',
    isDesktop: '(min-width:992px)'
  }, (ctx) => {
    const { isMobile, isMobileLandscape, isTablet } = ctx.conditions;
    document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
      const disable = trigger.getAttribute('data-parallax-disable');
      if (
        (disable === 'mobile' && isMobile) ||
        (disable === 'mobileLandscape' && isMobileLandscape) ||
        (disable === 'tablet' && isTablet)
      ) return;
      const target = trigger.querySelector('[data-parallax="target"]') || trigger;
      const prop = trigger.getAttribute('data-parallax-direction') === 'horizontal' ? 'xPercent' : 'yPercent';
      const scrub = parseFloat(trigger.getAttribute('data-parallax-scrub')) || 1;
      const startVal = parseFloat(trigger.getAttribute('data-parallax-start') ?? 20);
      const endVal = parseFloat(trigger.getAttribute('data-parallax-end') ?? -20);
      gsap.fromTo(target, { [prop]: startVal }, {
        [prop]: endVal,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger,
          start: `clamp(${trigger.getAttribute('data-parallax-scroll-start') || 'top bottom'})`,
          end: `clamp(${trigger.getAttribute('data-parallax-scroll-end') || 'bottom top'})`,
          scrub,
          invalidateOnRefresh: true
        }
      });
    });
    return () => gsap.context().revert();
  });

  // Scroll Reveal
  gsap.set('[data-scroll-reveal]', { autoAlpha: 0, y: 20 });
  ScrollTrigger.batch('[data-scroll-reveal]', {
    start: 'top 80%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out',
      stagger: window.innerWidth > 478 ? 0.3 : 0
    })
  });

  // Accordion
  document.querySelectorAll('[data-accordion-css-init]').forEach((acc) => {
    const closeSiblings = acc.getAttribute('data-accordion-close-siblings') === 'true';
    acc.addEventListener('click', (e) => {
      const panel = e.target.closest('[data-accordion-toggle]')?.closest('[data-accordion-status]');
      if (!panel) return;
      const isActive = panel.getAttribute('data-accordion-status') === 'active';
      panel.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
      if (closeSiblings && !isActive) {
        acc.querySelectorAll('[data-accordion-status="active"]').forEach((s) => {
          if (s !== panel) s.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });

  ScrollTrigger.refresh();
});
