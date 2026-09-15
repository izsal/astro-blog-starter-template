import type { D1Database } from "@cloudflare/workers-types";

export interface CategoryItem {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	post_count?: number;
}

export const FALLBACK_CATEGORIES: CategoryItem[] = [
	{ id: "cat-1", name: "Development", slug: "development", description: "General software development and best practices.", post_count: 5 },
	{ id: "cat-2", name: "Frontend", slug: "frontend", description: "Modern frontend frameworks: Astro, React, TypeScript.", post_count: 4 },
	{ id: "cat-3", name: "Backend", slug: "backend", description: "Microservices, FastAPI, Laravel, and database architecture.", post_count: 3 },
	{ id: "cat-4", name: "DevOps", slug: "devops", description: "Docker, Linux, CI/CD, and homelab infrastructure.", post_count: 4 },
	{ id: "cat-5", name: "Cloud", slug: "cloud", description: "Cloudflare Workers, D1 SQLite, and edge computing.", post_count: 6 },
];

export async function getCategories(db: D1Database | null): Promise<CategoryItem[]> {
	if (!db) return FALLBACK_CATEGORIES;

	try {
		const { results } = await db
			.prepare(
				`SELECT c.id, c.name, c.slug, c.description, COUNT(pc.post_id) as post_count
				 FROM categories c
				 LEFT JOIN post_categories pc ON c.id = pc.category_id
				 GROUP BY c.id
				 ORDER BY c.name ASC`
			)
			.all();

		if (!results || results.length === 0) return FALLBACK_CATEGORIES;

		return results.map((row: any) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			description: row.description,
			post_count: Number(row.post_count || 0),
		}));
	} catch (err) {
		console.error("Error fetching categories:", err);
		return FALLBACK_CATEGORIES;
	}
}

export async function getCategoryBySlug(db: D1Database | null, slug: string): Promise<CategoryItem | null> {
	if (!db) {
		return FALLBACK_CATEGORIES.find((c) => c.slug === slug) || null;
	}

	try {
		const row = await db
			.prepare("SELECT * FROM categories WHERE slug = ?")
			.bind(slug)
			.first<CategoryItem>();
		return row || FALLBACK_CATEGORIES.find((c) => c.slug === slug) || null;
	} catch (err) {
		console.error("Error fetching category by slug:", err);
		return FALLBACK_CATEGORIES.find((c) => c.slug === slug) || null;
	}
}
