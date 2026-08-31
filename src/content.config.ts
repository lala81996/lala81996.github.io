import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const bereiche = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/bereiche' }),
	schema: z.object({
		title: z.string(),
		order: z.number().int().positive(),
		stichworte: z.array(z.string()).nonempty(),
	}),
});

const projekte = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projekte' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		typ: z.enum(['arbeit', 'eigen']),
		rolle: z.string(),
		bereiche: z.array(reference('bereiche')).nonempty(),
		von: z.date(),
		// An absent value means the project is still running.
		bis: z.date().optional(),
		links: z
			.array(
				z.object({
					label: z.string(),
					url: z.url(),
				}),
			)
			.optional(),
	}),
});

export const collections = { bereiche, projekte };
