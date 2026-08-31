import { describe, expect, it } from 'vitest';
import { blogFrontmatterSchema } from './frontmatter-schema';

const validPost = {
	title: '正式articoli',
	date: '2026-07-29T10:00:00+08:00',
	categories: ['工程'],
	tags: ['astro'],
};

describe('blogFrontmatterSchema', () => {
	it('defaults a valid post to draft false and exposes normalized dates', () => {
		const result = blogFrontmatterSchema.parse(validPost);

		expect(result.draft).toBe(false);
		expect(result.pubDate).toBeInstanceOf(Date);
		expect(result.updatedDate).toBeUndefined();
	});

	it('allows a draft to have no category or tags', () => {
		const result = blogFrontmatterSchema.parse({
			title: '空Bozza',
			date: '2026-07-29T10:00:00+08:00',
			draft: true,
			categories: [],
			tags: [],
		});

		expect(result.categories).toEqual([]);
		expect(result.tags).toEqual([]);
	});

	it.each([
		[{ ...validPost, categories: [] }, 'Un articolo pubblicato deve avere esattamente una categoria'],
		[{ ...validPost, categories: ['工程', '随笔'] }, 'Un articolo può avere al massimo una categoria'],
		[{ ...validPost, tags: [] }, 'Un articolo pubblicato richiede almeno un tag'],
		[{ ...validPost, tags: ['astro', 'astro'] }, 'I tag non possono ripetersi'],
	])('rejects invalid publishable metadata', (frontmatter, message) => {
		const result = blogFrontmatterSchema.safeParse(frontmatter);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((issue) => issue.message === message)).toBe(true);
		}
	});

	it('trims text fields and rejects empty taxonomy values', () => {
		const parsed = blogFrontmatterSchema.parse({
			...validPost,
			title: '  标题  ',
			categories: ['  工程  '],
			tags: ['  astro  '],
		});
		expect(parsed.title).toBe('标题');
		expect(parsed.categories).toEqual(['工程']);
		expect(parsed.tags).toEqual(['astro']);

		expect(blogFrontmatterSchema.safeParse({ ...validPost, tags: ['  '] }).success).toBe(false);
	});

	it('rejects legacy and unknown fields', () => {
		const result = blogFrontmatterSchema.safeParse({
			...validPost,
			pubDate: '2026-07-29',
		});

		expect(result.success).toBe(false);
	});
});
