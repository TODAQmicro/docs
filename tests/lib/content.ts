// Reads the MDX content collections straight from disk, without the Astro
// runtime, so the unit tests and the page checks share one view of them.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const CONTENT_DIR = join(ROOT, 'src', 'content');

export type Collection = 'guide' | 'reference';

export interface Entry {
  /** Repository-relative path, with forward slashes. */
  file: string;
  collection: Collection;
  /** The slug Astro gives the entry: its path inside the collection, without the extension. */
  slug: string;
  /** A leading `_` on the file name keeps an entry out of its collection. */
  published: boolean;
  /** Parsed frontmatter. */
  data: Record<string, unknown>;
  /** The whole file, frontmatter included, so line numbers match the editor. */
  source: string;
  /** Number of lines the frontmatter block (with its fences) takes. */
  frontmatterLines: number;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const path = join(dir, dirent.name);
    return dirent.isDirectory() ? walk(path) : [path];
  });
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

export function loadEntries(): Entry[] {
  const collections: Collection[] = ['guide', 'reference'];
  return collections.flatMap((collection) =>
    walk(join(CONTENT_DIR, collection))
      .filter((path) => /\.mdx?$/.test(path))
      .sort()
      .map((path) => {
        const source = readFileSync(path, 'utf8');
        const match = FRONTMATTER.exec(source);
        const inner = relative(join(CONTENT_DIR, collection), path).split('\\').join('/');
        const name = inner.split('/').pop() ?? inner;
        return {
          file: relative(ROOT, path).split('\\').join('/'),
          collection,
          slug: inner.replace(/\.mdx?$/, ''),
          published: !name.startsWith('_') && !inner.split('/').some((part) => part.startsWith('_')),
          data: match ? (parse(match[1]) ?? {}) : {},
          source,
          frontmatterLines: match ? match[0].split('\n').length - 1 : 0,
        };
      }),
  );
}

/** Guides in the order the sidebar lists them: `order` first, then title. */
export function sidebarGuides(entries: Entry[] = loadEntries()): Entry[] {
  const order = (entry: Entry) =>
    typeof entry.data.order === 'number' ? entry.data.order : Infinity;
  return entries
    .filter((entry) => entry.collection === 'guide' && entry.published)
    .sort((a, b) =>
      order(a) - order(b) || String(a.data.title).localeCompare(String(b.data.title)),
    );
}

export function pagePath(entry: Entry): string {
  return `/${entry.collection}/${entry.slug}/`;
}
