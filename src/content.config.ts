import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const areas = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
	schema: z.object({
		title: z.string(),
		order: z.number().int().positive(),
		focus: z.array(z.string()).nonempty(),
		tools: z.array(z.string()).default([]),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		type: z.enum(['team', 'private']),
		role: z.string(),
		areas: z.array(reference('areas')).nonempty(),
		start: z.date(),
		// An absent value means the project is still running.
		end: z.date().optional(),
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

const quotes = defineCollection({
	loader: file('src/content/quotes.json'),
	schema: z.object({
		text: z.string(),
	}),
});

export const collections = { areas, projects, quotes };
