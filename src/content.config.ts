import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { compareCvDates } from './lib/cv-date';

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

// CV dates come with mixed precision (some only a year), so they stay strings
// instead of z.date(), which would invent a month or day.
const yearOrMonth = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/);

const cv = defineCollection({
	loader: file('src/content/cv.json'),
	schema: z
		.object({
			group: z.enum(['work', 'engagement', 'education']),
			title: z.string(),
			organization: z.string(),
			start: yearOrMonth,
			// An absent value means the station is still running. Equal to start for a single point in time.
			end: yearOrMonth.optional(),
			details: z.array(z.string()).default([]),
		})
		.refine(
			(station) =>
				station.end === undefined ||
				compareCvDates(station.end, station.start) >= 0,
			{ message: 'end must not be before start', path: ['end'] },
		),
});

export const collections = { areas, projects, quotes, cv };
