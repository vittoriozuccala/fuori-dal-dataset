import { z } from 'astro/zod';

const nonEmptyText = z.string().trim().min(1, 'Non può essere vuoto');

export const blogFrontmatterSchema = z
	.object({
		title: nonEmptyText,
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		description: nonEmptyText.optional(),
		draft: z.boolean().optional().default(false),
		categories: z.array(nonEmptyText),
		tags: z.array(nonEmptyText),
	})
	.strict()
	.superRefine((data, context) => {
		if (data.categories.length > 1) {
			context.addIssue({
				code: 'custom',
				path: ['categories'],
				message: 'Un articolo può avere al massimo una categoria',
			});
		}

		if (!data.draft && data.categories.length !== 1) {
			context.addIssue({
				code: 'custom',
				path: ['categories'],
				message: 'Un articolo pubblicato deve avere esattamente una categoria',
			});
		}

		if (!data.draft && data.tags.length === 0) {
			context.addIssue({
				code: 'custom',
				path: ['tags'],
				message: 'Un articolo pubblicato richiede almeno un tag',
			});
		}

		if (new Set(data.tags).size !== data.tags.length) {
			context.addIssue({
				code: 'custom',
				path: ['tags'],
				message: 'I tag non possono ripetersi',
			});
		}
	})
	.transform((data) => ({
		...data,
		pubDate: data.date,
		updatedDate: data.updated,
	}));
