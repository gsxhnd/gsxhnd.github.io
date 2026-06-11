import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '../consts';
import { getAllPosts } from '../utils/content';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.created,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: [...(post.data.category ? [post.data.category] : []), ...post.data.tags],
    })),
    customData: `<language>zh-CN</language>`,
  });
}
