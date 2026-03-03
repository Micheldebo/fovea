document.addEventListener('DOMContentLoaded', () => {
  const FULL_SLIDER_DURATION = 1;

  // Basic GSAP Slider
  document.querySelectorAll('[data-gsap-slider-init]:not([data-slider="full"])').forEach((root) => {
    root._sliderDraggable?.kill?.();
    const coll  = root.querySelector('[data-gsap-slider-collection]');
    const track = root.querySelector('[data-gsap-slider-list]');
    const items = [...root.querySelectorAll('[data-gsap-slider-item]')];
    const ctrls = [...root.querySelectorAll('[data-gsap-slider-control]')];
    if (!coll || !track || !items.length) return;

    root.setAttribute('role', 'region');
    coll.setAttribute('role', 'group');
    items.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-label', 'Slide ' + (i + 1) + ' of ' + items.length);
    });
    ctrls.forEach((b) => {
      b.setAttribute('role', 'button');
      b.setAttribute('aria-label', b.getAttribute('data-gsap-slider-control') === 'prev' ? 'Previous Slide' : 'Next Slide');
      b.disabled = true;
      b.setAttribute('aria-disabled', 'true');
    });

    const cs     = getComputedStyle(items[0]);
    const mr     = parseFloat(cs.marginRight) || 0;
    const slideW = items[0].getBoundingClientRect().width + mr;
    let spv = parseFloat(getComputedStyle(root).getPropertyValue('--slider-spv'));
    if (isNaN(spv)) spv = coll.clientWidth / slideW;
    const statusOn = getComputedStyle(root).getPropertyValue('--slider-status').trim() === 'on';

    if (!(statusOn && spv < items.length)) {
      track.removeAttribute('style');
      root.removeAttribute('role');
      coll.removeAttribute('role');
      items.forEach((s) => {
        s.removeAttribute('role');
        s.removeAttribute('aria-hidden');
        s.removeAttribute('tabindex');
        s.removeAttribute('data-gsap-slider-item-status');
      });
      ctrls.forEach((b) => { b.disabled = false; b.setAttribute('aria-disabled', 'false'); });
      return;
    }

    const vw        = coll.clientWidth;
    const tw        = track.scrollWidth;
    const maxScroll = Math.max(tw - vw, 0);
    const minX      = -maxScroll;
    const pts  = [];
    const full = Math.floor(maxScroll / slideW);
    for (let i = 0; i <= full; i++) pts.push(-i * slideW);
    if (full < maxScroll / slideW) pts.push(-maxScroll);

    const setX = gsap.quickSetter(track, 'x', 'px');
    let active   = 0;
    let collRect = coll.getBoundingClientRect();

    function update(x) {
      const cx      = Math.min(0, Math.max(minX, x));
      const closest = pts.reduce((a, b) => (Math.abs(b - cx) < Math.abs(a - cx) ? b : a), pts[0]);
      active        = Math.max(0, pts.indexOf(closest));
      items.forEach((s, i) => {
        const r      = s.getBoundingClientRect();
        const le     = r.left - collRect.left;
        const center = le + r.width / 2;
        const inView = center > 0 && center < collRect.width;
        s.setAttribute('data-gsap-slider-item-status', i === active ? 'active' : inView ? 'inview' : 'not-active');
        s.setAttribute('aria-hidden', (!inView).toString());
        s.setAttribute('tabindex', i === active ? '0' : '-1');
      });
      ctrls.forEach((b) => {
        const dir = b.getAttribute('data-gsap-slider-control');
        const can = dir === 'prev' ? active > 0 : active < pts.length - 1;
        b.disabled = !can;
        b.setAttribute('aria-disabled', (!can).toString());
      });
    }

    ctrls.forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      const delta  = b.getAttribute('data-gsap-slider-control') === 'next' ? 1 : -1;
      const target = pts[active + delta];
      if (typeof target !== 'number') return;
      gsap.to(track, {
        duration: 0.4,
        x: target,
        onUpdate: () => update(gsap.getProperty(track, 'x')),
      });
    }));

    root._sliderDraggable = Draggable.create(track, {
      type: 'x',
      bounds: { minX, maxX: 0 },
      inertia: true,
      throwResistance: 2000,
      dragResistance: 0.05,
      snap: { x: pts, duration: 0.4 },
      onPress()         { track.setAttribute('data-gsap-slider-list-status', 'grabbing'); collRect = coll.getBoundingClientRect(); },
      onDrag()          { setX(this.x); update(this.x); },
      onThrowUpdate()   { setX(this.x); update(this.x); },
      onThrowComplete() { setX(this.endX); update(this.endX); track.setAttribute('data-gsap-slider-list-status', 'grab'); },
      onRelease()       { setX(this.x); update(this.x); track.setAttribute('data-gsap-slider-list-status', 'grab'); },
    })[0];

    setX(0);
    update(0);
  });

  // Full Looping Slider
  document.querySelectorAll('[data-gsap-slider-init][data-slider="full"]').forEach((root) => {
    const coll  = root.querySelector('[data-gsap-slider-collection]');
    const track = root.querySelector('[data-gsap-slider-list]');
    if (!coll || !track) return;

    const originals = Array.from(track.children).filter(
      (el) => el.nodeType === 1 && !el.hasAttribute('data-loop-clone')
    );
    const n = originals.length;
    if (n < 2) return;

    root._fullBtnTween?.kill?.();
    track.querySelectorAll('[data-loop-clone="true"]').forEach((el) => el.remove());
    originals.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('data-loop-clone', 'true');
      track.appendChild(clone);
    });

    let index = 0;
    const getSlideW = () => originals[0].getBoundingClientRect().width || coll.clientWidth;
    const setX      = (x) => gsap.set(track, { x });
    setX(0);

    function goTo(newIndex, dir) {
      const slideW = getSlideW();
      if (!slideW) return;
      root._fullBtnTween?.kill?.();
      if (dir === 1 && index === n - 1 && newIndex === 0) {
        root._fullBtnTween = gsap.to(track, {
          x: -(n * slideW), duration: FULL_SLIDER_DURATION, ease: 'power2.out',
          onComplete: () => setX(0),
        });
        index = 0;
        return;
      }
      if (dir === -1 && index === 0 && newIndex === n - 1) {
        setX(-(n * slideW));
        root._fullBtnTween = gsap.to(track, {
          x: -((n - 1) * slideW), duration: FULL_SLIDER_DURATION, ease: 'power2.out',
        });
        index = n - 1;
        return;
      }
      root._fullBtnTween = gsap.to(track, {
        x: -(newIndex * slideW), duration: FULL_SLIDER_DURATION, ease: 'power2.out',
      });
      index = newIndex;
    }

    root.querySelector('[data-gsap-slider-control="next"]')
      ?.addEventListener('click', () => goTo((index + 1) % n, 1));
    root.querySelector('[data-gsap-slider-control="prev"]')
      ?.addEventListener('click', () => goTo((index - 1 + n) % n, -1));

    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => setX(-(index * getSlideW())), 150);
    });
  });

});
