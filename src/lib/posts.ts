import type { D1Database } from "@cloudflare/workers-types";
import { getCollection } from "astro:content";

export interface UnifiedPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content?: string;
	cover_image?: string;
	category?: string;
	tags?: string[];
	series_id?: string;
	published_at: string;
	reading_time: number;
	views: number;
	is_d1?: boolean;
}

export function calculateReadingTime(text: string): number {
	const wordsPerMinute = 200;
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function getUnifiedPosts(db: D1Database | null): Promise<UnifiedPost[]> {
	const posts: UnifiedPost[] = [];

	// 1. Fetch Astro Content Collection markdown posts
	try {
		const mdPosts = await getCollection("blog");
		for (const p of mdPosts) {
			posts.push({
				id: p.id,
				title: p.data.title,
				slug: p.id,
				excerpt: p.data.description,
				cover_image: p.data.heroImage,
				category: "Development",
				tags: ["Astro", "TypeScript", "Web"],
				published_at: p.data.pubDate.toISOString(),
				reading_time: calculateReadingTime(p.body || p.data.description),
				views: 0,
				is_d1: false,
			});
		}
	} catch (e) {
		console.warn("Could not read markdown collections:", e);
	}

	// 2. Fetch D1 database posts if available
	if (db) {
		try {
			const { results } = await db
				.prepare(
					`SELECT p.*, c.name as category_name, c.slug as category_slug
					 FROM posts p
					 LEFT JOIN post_categories pc ON p.id = pc.post_id
					 LEFT JOIN categories c ON pc.category_id = c.id
					 WHERE p.status = 'PUBLISHED'
					 ORDER BY p.published_at DESC`
				)
				.all();

			if (results && results.length > 0) {
				for (const r of results as any[]) {
					// Avoid duplicates if slug already exists in markdown
					if (!posts.some((p) => p.slug === r.slug)) {
						posts.push({
							id: r.id,
							title: r.title,
							slug: r.slug,
							excerpt: r.excerpt || "",
							content: r.content,
							cover_image: r.cover_image,
							category: r.category_name || "Development",
							tags: ["Cloudflare", "D1", "Astro"],
							published_at: r.published_at || r.created_at,
							reading_time: r.reading_time || calculateReadingTime(r.content || ""),
							views: Number(r.views || 0),
							is_d1: true,
						});
					}
				}
			}
		} catch (err) {
			console.error("Error fetching D1 posts:", err);
		}
	}

	return posts.sort(
		(a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
	);
}

// PRD Section 12: Related Articles Algorithm (Same Category + Same Tags + Same Series)
export async function getRelatedArticles(
	allPosts: UnifiedPost[],
	currentSlug: string,
	currentCategory?: string,
	currentTags: string[] = []
): Promise<UnifiedPost[]> {
	const candidates = allPosts.filter((p) => p.slug !== currentSlug);

	return candidates
		.map((post) => {
			let score = 0;
			if (currentCategory && post.category === currentCategory) {
				score += 3;
			}
			if (post.tags && currentTags.length > 0) {
				const commonTags = post.tags.filter((t) =>
					currentTags.map((ct) => ct.toLowerCase()).includes(t.toLowerCase())
				);
				score += commonTags.length * 2;
			}
			return { post, score };
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, 2)
		.map((item) => item.post);
}

export async function createPostInD1(
	db: D1Database,
	data: {
		title: string;
		slug: string;
		excerpt: string;
		content: string;
		cover_image?: string;
		category_id?: string;
		status?: string;
		seo_title?: string;
		seo_description?: string;
	}
): Promise<{ success: boolean; id?: string; error?: string }> {
	try {
		const id = "post-" + Date.now();
		const readingTime = calculateReadingTime(data.content);

		await db
			.prepare(
				`INSERT INTO posts (id, title, slug, excerpt, content, cover_image, status, published_at, seo_title, seo_description, reading_time)
				 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)`
			)
			.bind(
				id,
				data.title,
				data.slug,
				data.excerpt,
				data.content,
				data.cover_image || "/blog-placeholder-1.jpg",
				data.status || "PUBLISHED",
				data.seo_title || data.title,
				data.seo_description || data.excerpt,
				readingTime
			)
			.run();

		if (data.category_id) {
			await db
				.prepare("INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)")
				.bind(id, data.category_id)
				.run();
		}

		return { success: true, id };
	} catch (err: any) {
		console.error("Error creating post in D1:", err);
		return { success: false, error: err?.message || "Database insert failed" };
	}
}
