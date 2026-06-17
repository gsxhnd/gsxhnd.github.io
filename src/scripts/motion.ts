import { animate, inView, press, stagger } from 'motion';

/** Soft "easeOutExpo"-ish curve used across the whole site. */
export const SOFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reveal-on-scroll for every `[data-reveal]` element. Elements are pre-hidden
 * via CSS (see `html.motion-ready [data-reveal]` in global.css) to avoid FOUC,
 * then faded + lifted into place as they enter the viewport. Stagger is computed
 * per nearest `[data-reveal-group]` so each list cascades independently.
 */
function initReveals(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (elements.length === 0) return;

  const groupCounts = new Map<Element | null, number>();
  for (const el of elements) {
    const group = el.closest('[data-reveal-group]');
    const step = groupCounts.get(group) ?? 0;
    el.dataset.revealStep = String(step);
    groupCounts.set(group, step + 1);
  }

  inView(
    '[data-reveal]',
    (element) => {
      const target = element as HTMLElement;
      const step = Number(target.dataset.revealStep ?? 0);
      const delay = Math.min(step * 0.06, 0.3);

      const animation = animate(
        target,
        { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
        { duration: 0.6, delay, ease: SOFT_EASE },
      );

      animation.finished
        .then(() => {
          target.style.willChange = 'auto';
        })
        .catch(() => {});

      // No onEnd handler → each element animates only once.
    },
    { margin: '0px 0px -8% 0px' },
  );
}

/**
 * Gentle "settle" entrance for the page shell (`[data-page-enter]`) on load.
 */
function initPageEnter(): void {
  const shell = document.querySelector<HTMLElement>('[data-page-enter]');
  if (!shell) return;

  animate(
    shell,
    { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
    { duration: 0.55, ease: SOFT_EASE },
  ).finished
    .then(() => {
      shell.style.willChange = 'auto';
    })
    .catch(() => {});
}

const PRESS_TARGETS = [
  '.header-pill-btn',
  '.btn-ink',
  '.tag-pill',
  '.nav-menu-btn',
  '.search-modal-close',
].join(', ');

/** Tactile press feedback (subtle scale) on the main interactive controls. */
function initPressFeedback(): void {
  press(PRESS_TARGETS, (element) => {
    const target = element as HTMLElement;
    animate(target, { scale: 0.96 }, { duration: 0.12, ease: 'easeOut' });
    return () => {
      animate(target, { scale: 1 }, { type: 'spring', stiffness: 420, damping: 22 });
    };
  });
}

/**
 * Stagger-in a freshly rendered set of elements (e.g. search results).
 * Safe to call repeatedly; respects reduced-motion.
 */
export function revealBatch(elements: ArrayLike<Element>, delayStep = 0.04): void {
  if (elements.length === 0 || prefersReducedMotion()) return;
  animate(
    elements,
    { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
    { duration: 0.32, delay: stagger(delayStep), ease: SOFT_EASE },
  );
}

let started = false;

/** Site-wide entry point. Idempotent and a no-op under reduced-motion. */
export function initMotion(): void {
  if (started) return;
  started = true;

  // Tell the inline safety-net timeout (see BaseLayout) that motion is alive,
  // so it won't strip the pre-hide styles out from under our animations.
  document.documentElement.dataset.motionRun = '1';

  if (prefersReducedMotion()) return;

  initPageEnter();
  initReveals();
  initPressFeedback();
}
