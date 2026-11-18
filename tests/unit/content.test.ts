// Rules from CLAUDE.md for the MDX content collections, checked on the source
// files without the Astro runtime. `astro build` already rejects frontmatter
// that does not match src/content/config.ts; these catch the rest.

import { describe, expect, it } from 'vitest';
import { loadEntries, type Entry } from '../lib/content';

const entries = loadEntries();
const published = entries.filter((entry) => entry.published);

/** Every line of a file matching `pattern`, as `file:line: text`. */
function findLines(entry: Entry, pattern: RegExp, allow?: (line: string) => boolean): string[] {
  return entry.source.split('\n').flatMap((line, index) =>
    pattern.test(line) && !(allow && allow(line))
      ? [`${entry.file}:${index + 1}: ${line.trim()}`]
      : [],
  );
}

/** Lines after the frontmatter block, so frontmatter values are not read as prose. */
function body(entry: Entry): Entry {
  const lines = entry.source.split('\n');
  return {
    ...entry,
    source: lines.map((line, i) => (i < entry.frontmatterLines ? '' : line)).join('\n'),
  };
}

const isDate = (value: unknown) =>
  value instanceof Date || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));

describe('content collections', () => {
  it('finds the guides and references', () => {
    expect(entries.filter((e) => e.collection === 'guide').length).toBeGreaterThan(0);
    expect(entries.filter((e) => e.collection === 'reference').length).toBeGreaterThan(0);
  });

  describe.each(entries.map((entry) => [entry.file, entry] as const))('%s frontmatter', (_file, entry) => {
    it('has a frontmatter block', () => {
      expect(entry.frontmatterLines).toBeGreaterThan(0);
    });

    it.each(['title', 'description'])('has a non-empty %s', (field) => {
      expect(typeof entry.data[field]).toBe('string');
      expect(String(entry.data[field]).trim()).not.toBe('');
    });

    it('has a pubDate that parses as a date', () => {
      expect(isDate(entry.data.pubDate)).toBe(true);
    });

    it('has a parseable updatedDate, if any', () => {
      if (entry.data.updatedDate !== undefined) {
        expect(isDate(entry.data.updatedDate)).toBe(true);
      }
    });

    it('uses only the fields src/content/config.ts declares', () => {
      const allowed = ['title', 'description', 'pubDate', 'updatedDate', 'heroImage', 'heroAlt'];
      if (entry.collection === 'guide') allowed.push('order');
      expect(Object.keys(entry.data).filter((key) => !allowed.includes(key))).toEqual([]);
    });
  });

  it('gives every published guide an integer order', () => {
    const missing = published
      .filter((e) => e.collection === 'guide' && !Number.isInteger(e.data.order))
      .map((e) => e.file);
    expect(missing).toEqual([]);
  });

  it('gives guides unique order values', () => {
    const seen = new Map<unknown, string>();
    const clashes: string[] = [];
    for (const entry of entries.filter((e) => e.collection === 'guide' && e.data.order !== undefined)) {
      const other = seen.get(entry.data.order);
      if (other) clashes.push(`order ${entry.data.order}: ${other} and ${entry.file}`);
      seen.set(entry.data.order, entry.file);
    }
    expect(clashes).toEqual([]);
  });
});

describe('published pages', () => {
  // `[TOC]` is not expanded: no remark plugins are configured.
  it('contain no [TOC] marker', () => {
    expect(published.flatMap((entry) => findLines(body(entry), /\[TOC\]/))).toEqual([]);
  });

  it('contain no (#) placeholder links', () => {
    expect(published.flatMap((entry) => findLines(body(entry), /\]\(#\)|href=["']#["']/))).toEqual([]);
  });

  // Staging hosts appear only in an explicitly labelled environment list: a
  // line that starts with a "Staging" label, such as `**Staging:** …`,
  // `- Staging: …` or a table row `| Staging | …`.
  it('mention staging hosts only in a labelled environment list', () => {
    const labelled = (line: string) => /^\s*(?:[-*+]\s+|\|\s*)?(?:\*\*|__)?staging\b/i.test(line);
    expect(
      published.flatMap((entry) => findLines(body(entry), /\.stage\.m\.todaq\.net/, labelled)),
    ).toEqual([]);
  });
});

// The repository is public: example credentials must be visibly fake, never
// real-format values. This covers unpublished files too, since they are in git.
const REAL_FORMAT: Array<{ name: string; pattern: RegExp; real: string; fake: string }> = [
  {
    name: 'an access or refresh token (tqmt_ + 32 hex)',
    pattern: /\btqmt_[0-9a-f]{32}\b/i,
    real: '"access_token": "tqmt_00000000000000000000000000000000"',
    fake: '"access_token": "<ACCESS_TOKEN>"',
  },
  {
    name: 'an account public secret (mp_ + 32 hex)',
    pattern: /\bmp_[0-9a-f]{32}\b/i,
    real: 'loadMicroPayments("mp_00000000000000000000000000000000")',
    fake: 'loadMicroPayments("<PUBLIC_SECRET>")',
  },
  {
    name: 'a UUID twin API key under "key"',
    pattern: /["']?\bkey["']?\s*:\s*["'][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}["']/i,
    real: '"key": "00000000-0000-0000-0000-000000000000",',
    fake: '"key": "<TWIN_KEY>",',
  },
  {
    name: 'a client secret value',
    pattern: /client_?secret["']?\s*[:=]\s*["'](?!<)[A-Za-z0-9_-]{16,}["']/i,
    real: '"client_secret": "abcdefghijklmnopqrstuvwxyz012345"',
    fake: '"client_secret": "<CLIENT_SECRET>"',
  },
];

describe('code samples', () => {
  it.each(REAL_FORMAT)('contain no $name', ({ pattern }) => {
    expect(entries.flatMap((entry) => findLines(entry, pattern))).toEqual([]);
  });
});

// The detectors above must keep catching what they are for.
describe('credential detectors', () => {
  it.each(REAL_FORMAT)('flag $name and pass its placeholder', ({ pattern, real, fake }) => {
    expect(pattern.test(real)).toBe(true);
    expect(pattern.test(fake)).toBe(false);
  });
});
