document.addEventListener('DOMContentLoaded', function() {

  // Scroll Reveal
  gsap.set('[data-scroll-reveal]', { autoAlpha: 0, y: 20 });
  ScrollTrigger.batch('[data-scroll-reveal]', {
    start: 'top 80%',
    once: true,
    onEnter: function(batch) {
      gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out',
        stagger: window.innerWidth > 478 ? 0.3 : 0
      });
    }
  });

  // Parallax
  gsap.matchMedia().add(
    {
      isMobile: '(max-width:479px)',
      isMobileLandscape: '(max-width:767px)',
      isTablet: '(max-width:991px)',
      isDesktop: '(min-width:992px)'
    },
    function(ctx) {
      document.querySelectorAll('[data-parallax="trigger"]').forEach(function(trg) {
        var dis = trg.getAttribute('data-parallax-disable');
        if (
          (dis === 'mobile' && ctx.conditions.isMobile) ||
          (dis === 'mobileLandscape' && ctx.conditions.isMobileLandscape) ||
          (dis === 'tablet' && ctx.conditions.isTablet)
        ) return;

        var tgt  = trg.querySelector('[data-parallax="target"]') || trg;
        var dir  = trg.getAttribute('data-parallax-direction') || 'vertical';
        var prop = dir === 'horizontal' ? 'xPercent' : 'yPercent';
        var scr  = trg.getAttribute('data-parallax-scrub') ? parseFloat(trg.getAttribute('data-parallax-scrub')) : true;
        var st   = trg.getAttribute('data-parallax-scroll-start') || 'top bottom';
        var en   = trg.getAttribute('data-parallax-scroll-end') || 'bottom top';
        var sv   = parseFloat(trg.getAttribute('data-parallax-start')) || 20;
        var ev   = parseFloat(trg.getAttribute('data-parallax-end')) || -20;

        var from = {}; from[prop] = sv;
        var to = { ease: 'none' }; to[prop] = ev;
        to.scrollTrigger = {
          trigger: trg,
          start: 'clamp(' + st + ')',
          end: 'clamp(' + en + ')',
          scrub: scr
        };
        gsap.fromTo(tgt, from, to);
      });
    }
  );

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
