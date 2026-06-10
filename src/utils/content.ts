import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.data.category === category);
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.data.tags.includes(tag));
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  const categories = new Set(posts.map((post) => post.data.category));
  return Array.from(categories).sort();
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tags = new Set(posts.flatMap((post) => post.data.tags));
  return Array.from(tags).sort();
}

export async function getPostsByYear(): Promise<Record<string, BlogPost[]>> {
  const posts = await getAllPosts();
  const grouped: Record<string, BlogPost[]> = {};

  for (const post of posts) {
    const year = post.data.pubDate.getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(post);
  }

  return grouped;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function countBy<T>(items: T[], getKey: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function countTags(posts: BlogPost[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

export function groupPostsByYear(posts: BlogPost[]): { year: string; posts: BlogPost[] }[] {
  const grouped: { year: string; posts: BlogPost[] }[] = [];
  let currentYear = '';

  for (const post of posts) {
    const year = String(post.data.pubDate.getFullYear());
    if (year !== currentYear) {
      currentYear = year;
      grouped.push({ year, posts: [] });
    }
    grouped[grouped.length - 1].posts.push(post);
  }

  return grouped;
}
