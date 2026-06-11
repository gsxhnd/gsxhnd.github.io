# AGENTS.md

## Stack

- Astro 6 (static output) + MDX + Tailwind CSS v4 (Vite plugin)
- TypeScript strict mode (`astro/tsconfigs/strict`)
- Node >= 22.12.0, npm lockfile
- Deployed to GitHub Pages via `.github/workflows/deploy.yml`

## Commands

```sh
npm run dev       # dev server at localhost:4321
npm run build     # production build → dist/
npm run preview   # preview dist locally
```

No linter, formatter, or test runner is configured. `npm run build` is the only verification step.

## Architecture

| Path | Purpose |
|------|---------|
| `src/content/blog/` | Markdown/MDX blog posts (glob-loaded collection) |
| `src/content/about/index.md` | Single-file「关于我」页面内容 |
| `src/content.config.ts` | Collection schema (Zod): blog + about |
| `astro.config.ts` | Astro build config; `site` URL imported from `src/consts.ts` |
| `src/consts.ts` | Site-wide constants (title, menu, social, theming, `SITE_URL`) |
| `src/utils/content.ts` | Shared content helpers — always use `getAllPosts()` instead of raw `getCollection('blog')` so draft filtering and sorting stay consistent |
| `src/pages/api/search.json.ts` | Static JSON endpoint for client-side search |
| `src/layouts/BaseLayout.astro` | Root HTML shell (meta, OG, theme script) |
| `src/layouts/PageLayout.astro` | Standard page wrapper (Header + Footer + SearchModal) |
| `src/styles/global.css` | Theme tokens (light/dark via `data-theme`), component classes |

## Key Conventions

- **Draft filtering**: Posts with `draft: true` are excluded in `getAllPosts()` and in `getStaticPaths` for blog routes. Always filter drafts when querying content directly.
- **Search**: SearchModal lazily fetches `/api/search.json` at runtime; no inline JSON in HTML.
- **Theming**: Light/dark controlled by `html[data-theme]` attribute + CSS custom properties. The inline script in BaseLayout prevents FOUC.
- **RSS**: `src/pages/rss.xml.ts` reuses `getAllPosts()` and `siteConfig` — keep it DRY.
- **Routing**: `/blog/index.astro` redirects to `/`. The homepage _is_ the post list. `/about` renders `src/content/about/index.md` via the `about` collection.
- **Language**: Site content is in Chinese (zh-CN). Components use Chinese labels.

## Content Frontmatter

```yaml
title: string        # required
description: string  # required
created: date        # required
updated: date        # optional
category: string     # required, single category
tags: string[]       # defaults to []
draft: boolean       # defaults to false
cover: string        # optional image path
```

## Gotchas

- No `astro check` script exists — run `npx astro check` manually if you need type validation beyond the build.
- Tailwind v4 is loaded as a Vite plugin (`@tailwindcss/vite`), not as an Astro integration. Do not use `@astrojs/tailwind`.
- `global.css` uses `@plugin "@tailwindcss/typography"` (Tailwind v4 syntax), not the v3 `plugins` array.
- The `dist/` directory is git-ignored but may linger in the working tree.
