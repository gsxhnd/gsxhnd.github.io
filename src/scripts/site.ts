import { animate } from 'motion';
import { SOFT_EASE, prefersReducedMotion } from './motion';

function syncThemeIcons() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.getElementById('icon-light')?.classList.toggle('hidden', isDark);
  document.getElementById('icon-dark')?.classList.toggle('hidden', !isDark);
}

export function initThemeToggle() {
  syncThemeIcons();

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    syncThemeIcons();
  });
}

export function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const chevron = document.getElementById('menu-chevron');
  if (!btn || !menu) return;

  const reduce = prefersReducedMotion();
  let open = false;
  let running: ReturnType<typeof animate> | null = null;

  if (!reduce) {
    menu.style.height = '0px';
    menu.style.opacity = '0';
  }

  btn.addEventListener('click', () => {
    open = !open;
    menu.dataset.open = open ? 'true' : 'false';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    chevron?.classList.toggle('rotate-180', open);

    if (reduce) return;

    running?.stop();
    running = animate(
      menu,
      { height: open ? 'auto' : 0, opacity: open ? 1 : 0 },
      { duration: open ? 0.32 : 0.24, ease: SOFT_EASE },
    );
  });
}
