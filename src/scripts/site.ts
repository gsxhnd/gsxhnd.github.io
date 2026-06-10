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
  document.getElementById('menu-btn')?.addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('menu-btn');
    const chevron = document.getElementById('menu-chevron');
    const isOpen = menu?.dataset.open === 'true';

    if (menu) menu.dataset.open = isOpen ? 'false' : 'true';
    btn?.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    chevron?.classList.toggle('rotate-180', !isOpen);
  });
}
