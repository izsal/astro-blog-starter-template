import type { D1Database } from "@cloudflare/workers-types";
import { getUnifiedPosts, type UnifiedPost } from "./posts";

export interface SearchResult {
	post: UnifiedPost;
	matchType: "title" | "description" | "tag" | "content";
}

export async function searchArticles(
	db: D1Database | null,
	keyword: string
): Promise<UnifiedPost[]> {
	const query = keyword.trim().toLowerCase();
	if (!query) return [];

	const allPosts = await getUnifiedPosts(db);

	return allPosts.filter((post) => {
		const inTitle = post.title.toLowerCase().includes(query);
		const inDesc = post.excerpt.toLowerCase().includes(query);
		const inCategory = (post.category || "").toLowerCase().includes(query);
		const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(query));
		const inContent = (post.content || "").toLowerCase().includes(query);

		return inTitle || inDesc || inCategory || inTags || inContent;
	});
}
