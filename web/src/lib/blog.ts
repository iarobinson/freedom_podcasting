import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);
        return {
          slug: (data.slug as string) ?? file.replace(".mdx", ""),
          title: data.title as string,
          excerpt: data.excerpt as string,
          date: data.date as string,
          readingTime: readingTime(content).text,
        };
      })
  );
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  let files: string[];
  try {
    files = await fs.readdir(CONTENT_DIR);
  } catch {
    return null;
  }
  for (const file of files.filter((f) => f.endsWith(".mdx"))) {
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const postSlug = (data.slug as string) ?? file.replace(".mdx", "");
    if (postSlug === slug) {
      return {
        slug: postSlug,
        title: data.title as string,
        excerpt: data.excerpt as string,
        date: data.date as string,
        readingTime: readingTime(content).text,
        content,
      };
    }
  }
  return null;
}
