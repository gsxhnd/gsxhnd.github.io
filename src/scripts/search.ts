import { animate } from 'motion';
import { SOFT_EASE, prefersReducedMotion, revealBatch } from './motion';
import type { SearchIndexItem } from '../types/search';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function filterPosts(index: SearchIndexItem[], query: string): SearchIndexItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return index.filter((post) => {
    const text = `${post.title} ${post.description} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
    return text.includes(q);
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderResults(container: HTMLElement, results: SearchIndexItem[]) {
  container.innerHTML = results
    .map(
      (item) => `
        <a href="${escapeHtml(item.url)}" class="search-result-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="meta">${formatDate(item.created)} · ${escapeHtml(item.category ?? '')}</p>
          <p class="desc">${escapeHtml(item.description)}</p>
        </a>
      `,
    )
    .join('');

  revealBatch(container.querySelectorAll('.search-result-card'));
}

function focusInput(input: HTMLInputElement) {
  requestAnimationFrame(() => {
    input.focus({ preventScroll: true });
    input.select();
  });
}

export function initSearchModal(searchIndex: SearchIndexItem[]) {
  const dialog = document.getElementById('search-modal') as HTMLDialogElement | null;
  const input = document.getElementById('search-modal-input') as HTMLInputElement | null;
  const results = document.getElementById('search-modal-results');
  const empty = document.getElementById('search-modal-empty');
  const openBtn = document.getElementById('search-open');
  const closeBtn = document.getElementById('search-modal-close');
  const panel = dialog?.querySelector('.search-modal-panel');

  if (!dialog || !input || !results || !empty) return;

  function clearResults() {
    results.innerHTML = '';
    empty.classList.add('hidden');
  }

  function handleInput() {
    const query = input.value;
    if (!query.trim()) {
      clearResults();
      return;
    }
    const matches = filterPosts(searchIndex, query);
    if (!matches.length) {
      results.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    renderResults(results, matches);
  }

  function openModal(event: Event) {
    event.preventDefault();
    if (dialog.open) return;

    (document.activeElement as HTMLElement | null)?.blur();
    input.value = '';
    clearResults();
    dialog.showModal();

    if (panel && !prefersReducedMotion()) {
      animate(
        panel,
        { opacity: [0, 1], transform: ['translateY(10px) scale(0.97)', 'translateY(0px) scale(1)'] },
        { duration: 0.28, ease: SOFT_EASE },
      );
    }

    focusInput(input);
  }

  function closeModal() {
    if (!dialog.open) return;

    const finish = () => {
      dialog.close();
      clearResults();
      input.value = '';
    };

    if (panel && !prefersReducedMotion()) {
      animate(
        panel,
        { opacity: 0, transform: 'translateY(10px) scale(0.97)' },
        { duration: 0.16, ease: 'easeIn' },
      ).finished.then(finish).catch(finish);
      return;
    }

    finish();
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeModal();
  });

  dialog.addEventListener('close', () => {
    clearResults();
    input.value = '';
  });

  // Refocus when clicking panel chrome (title/close) so typing resumes quickly
  panel?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button')) return;
    focusInput(input);
  });

  input.addEventListener('input', handleInput);
}
