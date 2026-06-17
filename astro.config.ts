import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeKatex from 'rehype-katex';
import remarkCollapse from 'remark-collapse';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives';
import remarkMath from 'remark-math';
import remarkSectionize from 'remark-sectionize';
import { SITE_URL } from './src/consts';

import expressiveCode from 'astro-expressive-code';

function remarkCodeFilenameToTitle() {
  return (tree: { children?: unknown[] }) => {
    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      const mdNode = node as {
        type?: string;
        meta?: string;
        children?: unknown[];
      };

      if (mdNode.type === 'code' && typeof mdNode.meta === 'string') {
        const filenameMatch = mdNode.meta.match(/(?:^|\s)filename=(["'])(.*?)\1/);
        const hasTitle = /(?:^|\s)title=(["']).*?\1/.test(mdNode.meta);
        if (filenameMatch && !hasTitle) {
          mdNode.meta = `${mdNode.meta} title="${filenameMatch[2]}"`;
        }
      }

      if (Array.isArray(mdNode.children)) {
        for (const child of mdNode.children) {
          walk(child);
        }
      }
    };

    walk(tree);
  };
}

function remarkForceCodeFrame() {
  return (tree: { children?: unknown[] }) => {
    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      const mdNode = node as { type?: string; meta?: string; children?: unknown[] };

      if (mdNode.type === 'code') {
        const meta = mdNode.meta ?? '';
        if (!/(?:^|\s)frame=/.test(meta)) {
          mdNode.meta = meta ? `${meta} frame=code` : 'frame=code';
        }
      }

      if (Array.isArray(mdNode.children)) {
        for (const child of mdNode.children) {
          walk(child);
        }
      }
    };

    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useDarkModeMediaQuery: false,
      themeCssRoot: 'html',
      themeCssSelector: (theme) => (theme.type === 'dark' ? '[data-theme="dark"]' : '[data-theme="light"]'),
      emitExternalStylesheet: false,
      styleOverrides: {
        borderRadius: '0.75rem',
        borderWidth: '1px',
        codeFontFamily: 'var(--font-code)',
        codePaddingBlock: '1rem',
        codePaddingInline: '1.25rem',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorActiveTabIndicatorHeight: '0',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: 'transparent',
          editorTabsMarginInlineStart: '0.75rem',
          editorTabBorderRadius: '0.625rem',
          inlineButtonBorderOpacity: '0',
        },
      },
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkCodeFilenameToTitle,
        remarkForceCodeFrame,
        remarkGithubAdmonitionsToDirectives,
        remarkDirective,
        remarkDirectiveRehype,
        remarkMath,
        remarkSectionize,
        [remarkCollapse, { test: /^details$/i, summary: '展开详情' }],
      ],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});