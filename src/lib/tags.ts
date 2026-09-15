import type { D1Database } from "@cloudflare/workers-types";

export interface TagItem {
	id: string;
	name: string;
	slug: string;
	usage_count?: number;
}

export const FALLBACK_TAGS: TagItem[] = [
	{ id: "tag-astro", name: "Astro", slug: "astro", usage_count: 14 },
	{ id: "tag-react", name: "React", slug: "react", usage_count: 21 },
	{ id: "tag-docker", name: "Docker", slug: "docker", usage_count: 8 },
	{ id: "tag-cloudflare", name: "Cloudflare", slug: "cloudflare", usage_count: 6 },
	{ id: "tag-laravel", name: "Laravel", slug: "laravel", usage_count: 7 },
	{ id: "tag-typescript", name: "TypeScript", slug: "typescript", usage_count: 18 },
	{ id: "tag-linux", name: "Linux", slug: "linux", usage_count: 10 },
	{ id: "tag-fastapi", name: "FastAPI", slug: "fastapi", usage_count: 5 },
	{ id: "tag-vue", name: "Vue", slug: "vue", usage_count: 6 },
];

export async function getTags(db: D1Database | null): Promise<TagItem[]> {
	if (!db) return FALLBACK_TAGS;

	try {
		const { results } = await db
			.prepare(
				`SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as usage_count
				 FROM tags t
				 LEFT JOIN post_tags pt ON t.id = pt.tag_id
				 GROUP BY t.id
				 ORDER BY usage_count DESC, t.name ASC`
			)
			.all();

		if (!results || results.length === 0) return FALLBACK_TAGS;

		return results.map((row: any) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			usage_count: Number(row.usage_count || 0),
		}));
	} catch (err) {
		console.error("Error fetching tags:", err);
		return FALLBACK_TAGS;
	}
}

export async function getTagBySlug(db: D1Database | null, slug: string): Promise<TagItem | null> {
	if (!db) return FALLBACK_TAGS.find((t) => t.slug === slug) || null;

	try {
		const row = await db.prepare("SELECT * FROM tags WHERE slug = ?").bind(slug).first<TagItem>();
		return row || FALLBACK_TAGS.find((t) => t.slug === slug) || null;
	} catch (err) {
		console.error("Error fetching tag by slug:", err);
		return FALLBACK_TAGS.find((t) => t.slug === slug) || null;
	}
}
