import type { APIRoute } from 'astro';
import { getAllPosts } from '../../utils/content';
import type { SearchIndexItem } from '../../types/search';

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const searchIndex: SearchIndexItem[] = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
    url: `/blog/${post.id}`,
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' },
  });
};
