import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { comparePartialDates } from './lib/partial-date';

// Dates come with mixed precision (some only a year), so they stay strings
// instead of z.date(), which would invent a month or day.
const yearOrMonth = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/);

const period = {
	start: yearOrMonth,
	// An absent value means it is still running. Equal to start for a single point in time.
	end: yearOrMonth.optional(),
};

const endNotBeforeStart = (value: { start: string; end?: string }) =>
	value.end === undefined || comparePartialDates(value.end, value.start) >= 0;

const endNotBeforeStartError = {
	message: 'end must not be before start',
	path: ['end'],
};

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
	schema: z
		.object({
			title: z.string(),
			summary: z.string(),
			type: z.enum(['team', 'private']),
			roles: z.array(z.string()).nonempty(),
			areas: z.array(reference('areas')).nonempty(),
			...period,
			// The panel lays out at most four tiles without gaps.
			challenges: z
				.array(z.object({ title: z.string(), text: z.string() }))
				.nonempty()
				.max(4),
			links: z
				.array(
					z.object({
						label: z.string(),
						url: z.url(),
					}),
				)
				.optional(),
		})
		.refine(endNotBeforeStart, endNotBeforeStartError),
});

const quotes = defineCollection({
	loader: file('src/content/quotes.json'),
	schema: z.object({
		text: z.string(),
	}),
});

const cv = defineCollection({
	loader: file('src/content/cv.json'),
	schema: z
		.object({
			group: z.enum(['work', 'engagement', 'education']),
			title: z.string(),
			organization: z.string(),
			...period,
			details: z.array(z.string()).default([]),
		})
		.refine(endNotBeforeStart, endNotBeforeStartError),
});

export const collections = { areas, projects, quotes, cv };
