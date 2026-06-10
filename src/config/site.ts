export interface NavItem {
  name: string;
  url: string;
  target?: '_blank';
}

export const siteConfig = {
  title: 'gsxhnd',
  subtitle: '记录技术与思考的点滴',
  description: '一个基于 Astro 构建的个人博客',
  url: 'https://gsxhnd.github.io',
  since: 2024,
  seal: true,
  sealText: '白',
  note: '白は、余白の名。',
  darkMode: true,
  menu: [
    { name: '首页', url: '/' },
    { name: '分类', url: '/categories' },
    { name: '归档', url: '/archive' },
    { name: '标签', url: '/tags' },
  ] satisfies NavItem[],
  social: {
    github: 'https://github.com/gsxhnd',
    rss: '/rss.xml',
  },
} as const;

export const SEAL_PATH_D =
  'M15,12 Q50,5 85,12 Q95,50 88,88 Q50,95 12,88 Q5,50 15,12 Z';
