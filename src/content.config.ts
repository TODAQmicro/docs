import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every .mdx file under the collection's directory, except files and
// directories whose name starts with `_` (unpublished), as collections did
// before the Content Layer. An entry's id is its path without the extension,
// for example `payment-js/payment-element`, and is the URL slug.
const mdx = (collection: string) =>
	glob({
		pattern: ['**/*.mdx', '!**/_*', '!**/_*/**'],
		base: `./src/content/${collection}`,
	});

const guide = defineCollection({
	loader: mdx('guide'),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
		// Position in the sidebar's User Guides list, lowest first. Guides
		// without one follow, by title.
		order: z.number().int().optional(),
	}),
});

const reference = defineCollection({
	loader: mdx('reference'),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
	}),
});

export const collections = { guide, reference };
