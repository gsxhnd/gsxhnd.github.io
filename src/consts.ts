export interface NavItem {
  name: string;
  url: string;
  target?: "_blank";
}

/** Canonical site URL — also referenced by astro.config.ts `site` option. */
export const SITE_URL = "https://www.newma.dev";

export const siteConfig = {
  title: "全菜开发",
  subtitle: "记录技术与思考的点滴",
  description: "一个基于 Astro 构建的个人博客",
  since: 2024,
  note: "白は、余白の名。",
  darkMode: true,
  menu: [
    { name: "首页", url: "/" },
    { name: "分类", url: "/categories" },
    { name: "归档", url: "/archive" },
    { name: "标签", url: "/tags" },
    { name: "关于", url: "/about" },
  ] satisfies NavItem[],
  social: {
    github: "https://github.com/gsxhnd",
    rss: "/rss.xml",
  },
} as const;
