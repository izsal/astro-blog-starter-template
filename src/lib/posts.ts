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
	category_id?: string;
	tags?: string[];
	series_id?: string;
	status?: "PUBLISHED" | "DRAFT" | "SCHEDULED";
	focus_keyword?: string;
	search_intent?: string;
	seo_score?: number;
	featured?: boolean;
	scheduled_at?: string;
	is_trashed?: boolean;
	published_at: string;
	updated_at?: string;
	reading_time: number;
	views: number;
	is_d1?: boolean;
}

export interface PostRevisionItem {
	id: string;
	post_id: string;
	title: string;
	content: string;
	revision_note?: string;
	created_at: string;
}

export function calculateReadingTime(text: string): number {
	const wordsPerMinute = 200;
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function getUnifiedPosts(
	db: D1Database | null,
	options?: { status?: string; includeTrashed?: boolean }
): Promise<UnifiedPost[]> {
	const posts: UnifiedPost[] = [];

	// 1. Fetch D1 database posts if available (dynamic posts have precedence)
	if (db) {
		try {
			let query = `
				SELECT p.*, c.id as cat_id, c.name as category_name, c.slug as category_slug
				FROM posts p
				LEFT JOIN post_categories pc ON p.id = pc.post_id
				LEFT JOIN categories c ON pc.category_id = c.id
			`;

			const conditions: string[] = [];
			const bindings: any[] = [];

			if (options?.includeTrashed) {
				conditions.push("p.is_trashed = 1");
			} else {
				conditions.push("(p.is_trashed = 0 OR p.is_trashed IS NULL)");
			}

			if (options?.status && options.status !== "ALL" && !options?.includeTrashed) {
				conditions.push("UPPER(p.status) = UPPER(?)");
				bindings.push(options.status);
			}

			if (conditions.length > 0) {
				query += " WHERE " + conditions.join(" AND ");
			}

			query += " ORDER BY p.created_at DESC";

			const stmt = bindings.length > 0 ? db.prepare(query).bind(...bindings) : db.prepare(query);
			const { results } = await stmt.all();

			if (results && results.length > 0) {
				for (const r of results as any[]) {
					if (!posts.some((p) => p.slug === r.slug)) {
						posts.push({
							id: r.id,
							title: r.title,
							slug: r.slug,
							excerpt: r.excerpt || "",
							content: r.content,
							cover_image: r.cover_image,
							category: r.category_name || "Development",
							category_id: r.cat_id,
							tags: ["Cloudflare", "D1", "Astro"],
							status: ((r.status || "PUBLISHED") as string).toUpperCase() as any,
							focus_keyword: r.focus_keyword || "",
							search_intent: r.search_intent || "Informational",
							seo_score: r.seo_score ? Number(r.seo_score) : 85,
							featured: Boolean(r.featured),
							scheduled_at: r.scheduled_at,
							is_trashed: Boolean(r.is_trashed),
							published_at: r.published_at || r.created_at,
							updated_at: r.updated_at || r.created_at,
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

	// 2. Fetch Astro Content Collection markdown posts (only if not overridden in D1)
	if (!options?.status || options.status === "ALL" || options.status === "PUBLISHED") {
		try {
			const mdPosts = await getCollection("blog");
			for (const p of mdPosts) {
				if (!posts.some((existing) => existing.slug === p.id || existing.id === p.id)) {
					posts.push({
						id: p.id,
						title: p.data.title,
						slug: p.id,
						excerpt: p.data.description,
						cover_image: p.data.heroImage,
						category: "Development",
						tags: ["Astro", "TypeScript", "Web"],
						status: "PUBLISHED",
						seo_score: 92,
						published_at: p.data.pubDate.toISOString(),
						reading_time: calculateReadingTime(p.body || p.data.description),
						views: 1240,
						is_d1: false,
						is_trashed: false,
					});
				}
			}
		} catch (e) {
			console.warn("Could not read markdown collections:", e);
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
		status?: "PUBLISHED" | "DRAFT" | "SCHEDULED";
		seo_title?: string;
		seo_description?: string;
		canonical_url?: string;
		og_image?: string;
		focus_keyword?: string;
		search_intent?: string;
		seo_score?: number;
		featured?: boolean;
		scheduled_at?: string;
	}
): Promise<{ success: boolean; id?: string; error?: string }> {
	try {
		const id = "post-" + Date.now();
		const readingTime = calculateReadingTime(data.content);

		await db
			.prepare(
				`INSERT INTO posts (
					id, title, slug, excerpt, content, cover_image, status,
					published_at, updated_at, seo_title, seo_description,
					canonical_url, og_image, focus_keyword, search_intent,
					seo_score, featured, scheduled_at, reading_time, is_trashed
				) VALUES (
					?, ?, ?, ?, ?, ?, ?,
					CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?, 0
				)`
			)
			.bind(
				id,
				data.title || "Untitled Post",
				data.slug,
				data.excerpt ?? (data as any).description ?? "",
				data.content,
				data.cover_image || "/blog-placeholder-1.jpg",
				data.status || "PUBLISHED",
				data.seo_title || data.title || null,
				data.seo_description || data.excerpt || (data as any).description || null,
				data.canonical_url || null,
				data.og_image || null,
				data.focus_keyword || null,
				data.search_intent || "Informational",
				data.seo_score || 85,
				data.featured ? 1 : 0,
				data.scheduled_at || null,
				readingTime
			)
			.run();

		if (data.category_id) {
			let catId = data.category_id;
			const catRow = await db
				.prepare("SELECT id FROM categories WHERE id = ? OR slug = ? OR LOWER(name) = LOWER(?)")
				.bind(catId, catId, catId)
				.first<{ id: string }>();
			if (catRow?.id) catId = catRow.id;

			await db
				.prepare("INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)")
				.bind(id, catId)
				.run();
		}

		// Initial revision
		await savePostRevision(db, id, data.title, data.content, "Versi awal artikel");

		return { success: true, id };
	} catch (err: any) {
		console.error("Error creating post in D1:", err);
		return { success: false, error: err?.message || "Database insert failed" };
	}
}

export async function updatePostInD1(
	db: D1Database,
	id: string,
	data: Partial<{
		title: string;
		slug: string;
		excerpt: string;
		content: string;
		cover_image: string;
		category_id: string;
		status: "PUBLISHED" | "DRAFT" | "SCHEDULED";
		seo_title: string;
		seo_description: string;
		canonical_url: string;
		og_image: string;
		focus_keyword: string;
		search_intent: string;
		seo_score: number;
		featured: boolean;
		scheduled_at: string;
		revision_note: string;
	}>
): Promise<{ success: boolean; error?: string }> {
	try {
		const readingTime = data.content ? calculateReadingTime(data.content) : 1;

		const existing = await db
			.prepare("SELECT id FROM posts WHERE id = ? OR slug = ?")
			.bind(id, id)
			.first<{ id: string }>();

		const targetId = existing?.id || id;

		let resolvedCatId = data.category_id;
		if (resolvedCatId) {
			const catRow = await db
				.prepare("SELECT id FROM categories WHERE id = ? OR slug = ? OR LOWER(name) = LOWER(?)")
				.bind(resolvedCatId, resolvedCatId, resolvedCatId)
				.first<{ id: string }>();
			if (catRow?.id) resolvedCatId = catRow.id;
		}

		if (!existing) {
			await db
				.prepare(
					`INSERT INTO posts (
						id, title, slug, excerpt, content, cover_image, status,
						published_at, updated_at, seo_title, seo_description,
						canonical_url, og_image, focus_keyword, search_intent,
						seo_score, featured, scheduled_at, reading_time, is_trashed
					) VALUES (
						?, ?, ?, ?, ?, ?, ?,
						CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?,
						?, ?, ?, ?,
						?, ?, ?, ?, 0
					)`
				)
				.bind(
					targetId,
					data.title || "Untitled Post",
					data.slug || targetId,
					data.excerpt || "",
					data.content || "",
					data.cover_image || "/blog-placeholder-1.jpg",
					data.status ? data.status.toUpperCase() : "PUBLISHED",
					data.seo_title || data.title || null,
					data.seo_description || data.excerpt || null,
					data.canonical_url || null,
					data.og_image || null,
					data.focus_keyword || null,
					data.search_intent || "Informational",
					data.seo_score || 85,
					data.featured ? 1 : 0,
					data.scheduled_at || null,
					readingTime
				)
				.run();

			if (resolvedCatId) {
				await db
					.prepare("INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)")
					.bind(targetId, resolvedCatId)
					.run();
			}

			await savePostRevision(db, targetId, data.title || "Untitled", data.content || "", data.revision_note || "Versi awal artikel di D1");
			return { success: true };
		}

		await db
			.prepare(
				`UPDATE posts SET
					title = COALESCE(?, title),
					slug = COALESCE(?, slug),
					excerpt = COALESCE(?, excerpt),
					content = COALESCE(?, content),
					cover_image = COALESCE(?, cover_image),
					status = COALESCE(?, status),
					seo_title = COALESCE(?, seo_title),
					seo_description = COALESCE(?, seo_description),
					canonical_url = COALESCE(?, canonical_url),
					og_image = COALESCE(?, og_image),
					focus_keyword = COALESCE(?, focus_keyword),
					search_intent = COALESCE(?, search_intent),
					seo_score = COALESCE(?, seo_score),
					featured = COALESCE(?, featured),
					scheduled_at = COALESCE(?, scheduled_at),
					reading_time = COALESCE(?, reading_time),
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ?`
			)
			.bind(
				data.title ?? null,
				data.slug ?? null,
				data.excerpt ?? null,
				data.content ?? null,
				data.cover_image ?? null,
				data.status ? data.status.toUpperCase() : null,
				data.seo_title ?? null,
				data.seo_description ?? null,
				data.canonical_url ?? null,
				data.og_image ?? null,
				data.focus_keyword ?? null,
				data.search_intent ?? null,
				data.seo_score ?? null,
				data.featured !== undefined ? (data.featured ? 1 : 0) : null,
				data.scheduled_at ?? null,
				readingTime ?? null,
				targetId
			)
			.run();

		if (resolvedCatId) {
			await db.prepare("DELETE FROM post_categories WHERE post_id = ?").bind(targetId).run();
			await db.prepare("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)").bind(targetId, resolvedCatId).run();
		}

		if (data.content && data.title) {
			await savePostRevision(db, targetId, data.title, data.content, data.revision_note || "Pembaruan berkas artikel");
		}

		return { success: true };
	} catch (err: any) {
		console.error("Error updating post in D1:", err);
		return { success: false, error: err?.message || "Failed to update" };
	}
}

export async function trashPostInD1(db: D1Database, id: string, trash: boolean = true): Promise<{ success: boolean; error?: string }> {
	try {
		await db.prepare("UPDATE posts SET is_trashed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(trash ? 1 : 0, id).run();
		return { success: true };
	} catch (err: any) {
		return { success: false, error: err?.message };
	}
}

export async function deletePostPermanently(db: D1Database, id: string): Promise<{ success: boolean; error?: string }> {
	try {
		await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
		return { success: true };
	} catch (err: any) {
		return { success: false, error: err?.message };
	}
}

export async function duplicatePostInD1(db: D1Database, id: string): Promise<{ success: boolean; newId?: string; error?: string }> {
	try {
		const original = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<any>();
		if (!original) return { success: false, error: "Original post not found" };

		const newId = "post-" + Date.now();
		const newTitle = original.title + " (Copy)";
		const newSlug = original.slug + "-copy-" + Math.floor(Math.random() * 1000);

		await db
			.prepare(
				`INSERT INTO posts (
					id, title, slug, excerpt, content, cover_image, status,
					published_at, created_at, updated_at, seo_title, seo_description,
					focus_keyword, search_intent, seo_score, reading_time, is_trashed
				) VALUES (
					?, ?, ?, ?, ?, ?, 'DRAFT',
					CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?,
					?, ?, ?, ?, 0
				)`
			)
			.bind(
				newId,
				newTitle,
				newSlug,
				original.excerpt ?? "",
				original.content ?? "",
				original.cover_image ?? "/blog-placeholder-1.jpg",
				newTitle,
				original.seo_description ?? null,
				original.focus_keyword ?? null,
				original.search_intent ?? "Informational",
				original.seo_score || 80,
				original.reading_time || 3
			)
			.run();

		// Copy category relation
		const cat = await db.prepare("SELECT category_id FROM post_categories WHERE post_id = ?").bind(id).first<any>();
		if (cat && cat.category_id) {
			await db.prepare("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)").bind(newId, cat.category_id).run();
		}

		await savePostRevision(db, newId, newTitle, original.content, "Duplikasi dari " + original.title);

		return { success: true, newId };
	} catch (err: any) {
		return { success: false, error: err?.message };
	}
}

export async function savePostRevision(
	db: D1Database,
	postId: string,
	title: string,
	content: string,
	note?: string
): Promise<void> {
	try {
		const revId = "rev-" + Date.now();
		await db
			.prepare(
				"INSERT INTO post_revisions (id, post_id, title, content, revision_note) VALUES (?, ?, ?, ?, ?)"
			)
			.bind(revId, postId, title, content, note || "Autosave / Update")
			.run();
	} catch (e) {
		console.warn("Could not save revision:", e);
	}
}

export async function getPostRevisions(db: D1Database, postId: string): Promise<PostRevisionItem[]> {
	try {
		const { results } = await db
			.prepare("SELECT * FROM post_revisions WHERE post_id = ? ORDER BY created_at DESC LIMIT 10")
			.bind(postId)
			.all();
		return (results || []) as any[];
	} catch (e) {
		console.warn("Could not fetch revisions:", e);
		return [];
	}
}
