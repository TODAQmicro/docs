import { defineCollection, z } from 'astro:content';

const guide = defineCollection({
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
