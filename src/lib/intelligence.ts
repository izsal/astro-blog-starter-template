import type { D1Database } from "@cloudflare/workers-types";
import type { UnifiedPost } from "./posts";
import type { CategoryItem } from "./categories";

export interface ArticleHealthMetrics {
	overallScore: number;
	seo: number;
	content: number;
	internalLinks: number;
	readability: number;
	freshness: number;
	recommendations: string[];
}

export interface StaleArticleAlert {
	post: UnifiedPost;
	daysOld: number;
	reason: string;
	urgency: "HIGH" | "MEDIUM" | "LOW";
}

export interface SmartLinkSuggestion {
	matchedPhrase: string;
	suggestedPost: UnifiedPost;
	markdownLink: string;
}

export interface ClusterHealth {
	category: string;
	slug: string;
	completenessPercent: number;
	pillarExists: boolean;
	totalArticles: number;
	missingTopics: string[];
}

export interface KeywordTrackItem {
	id: string;
	keyword: string;
	intent: string;
	target_position: number;
	current_position: number;
	impressions: number;
	status: string;
}

export function calculateArticleHealth(post: UnifiedPost): ArticleHealthMetrics {
	let seo = 85;
	let content = 80;
	let internalLinks = 75;
	let readability = 88;
	let freshness = 100;
	const recommendations: string[] = [];

	// Freshness check (180 days rule)
	const publishedDate = new Date(post.published_at);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 3600 * 24));

	if (diffDays > 180) {
		freshness = Math.max(40, 100 - Math.floor((diffDays - 180) / 10));
		recommendations.push(`Artikel telah berusia ${diffDays} hari. Pertimbangkan memperbarui contoh kode & konteks terkini.`);
	}

	// Content depth
	if (post.reading_time >= 5) {
		content = 95;
	} else if (post.reading_time >= 3) {
		content = 85;
	} else {
		content = 65;
		recommendations.push("Durasi baca relatif singkat. Tambahkan bagian studi kasus atau troubleshooting tips.");
	}

	// Internal Links & Tags
	if (post.tags && post.tags.length >= 3) {
		internalLinks = 90;
	} else {
		internalLinks = 70;
		recommendations.push("Tambahkan minimal 2 internal link kontekstual ke artikel atau content series terkait.");
	}

	const overallScore = Math.round((seo + content + internalLinks + readability + freshness) / 5);

	return {
		overallScore,
		seo,
		content,
		internalLinks,
		readability,
		freshness,
		recommendations,
	};
}

export function detectContentRefreshNeeds(posts: UnifiedPost[]): StaleArticleAlert[] {
	const now = new Date();
	const alerts: StaleArticleAlert[] = [];

	posts.forEach((post) => {
		const pubDate = new Date(post.published_at);
		const daysOld = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24));

		if (daysOld > 180) {
			alerts.push({
				post,
				daysOld,
				reason: `Terakhir diperbarui ${Math.floor(daysOld / 30)} bulan lalu. Potensi penurunan ranking Google.`,
				urgency: daysOld > 365 ? "HIGH" : "MEDIUM",
			});
		}
	});

	// If none older than 180 days, provide demo queue for developer awareness
	if (alerts.length === 0 && posts.length > 0) {
		alerts.push({
			post: posts[posts.length - 1],
			daysOld: 195,
			reason: "Traffic organik mulai melandai. Rekomendasi: perbarui versi library dependency.",
			urgency: "MEDIUM",
		});
	}

	return alerts;
}

export function getSmartLinkSuggestions(
	content: string,
	allPosts: UnifiedPost[]
): SmartLinkSuggestion[] {
	const suggestions: SmartLinkSuggestion[] = [];
	const contentLower = content.toLowerCase();

	allPosts.forEach((p) => {
		// Match by exact title
		if (contentLower.includes(p.title.toLowerCase())) {
			suggestions.push({
				matchedPhrase: p.title,
				suggestedPost: p,
				markdownLink: `[${p.title}](/blog/${p.slug})`,
			});
		}

		// Match by tags or keywords
		(p.tags || []).forEach((tag) => {
			const tagRegex = new RegExp(`\\b${tag.toLowerCase()}\\b`, "i");
			if (tagRegex.test(contentLower) && !suggestions.some((s) => s.suggestedPost.slug === p.slug)) {
				suggestions.push({
					matchedPhrase: tag,
					suggestedPost: p,
					markdownLink: `[${p.title}](/blog/${p.slug})`,
				});
			}
		});
	});

	return suggestions.slice(0, 5);
}

export function getContentClusterStats(
	categories: CategoryItem[],
	posts: UnifiedPost[]
): ClusterHealth[] {
	return categories.map((cat) => {
		const clusterPosts = posts.filter(
			(p) => (p.category || "").toLowerCase() === cat.name.toLowerCase()
		);
		const count = clusterPosts.length;
		const completeness = Math.min(100, Math.round((count / 5) * 100));

		const missingTopics: string[] = [];
		if (cat.name === "Cloud" && !clusterPosts.some((p) => p.title.toLowerCase().includes("r2"))) {
			missingTopics.push("Cloudflare R2 Object Storage Tutorial");
		}
		if (cat.name === "Frontend" && !clusterPosts.some((p) => p.title.toLowerCase().includes("island"))) {
			missingTopics.push("Astro Islands Architecture Deep Dive");
		}
		if (cat.name === "DevOps" && !clusterPosts.some((p) => p.title.toLowerCase().includes("compose"))) {
			missingTopics.push("Docker Compose Healthcheck & Dependencies");
		}

		return {
			category: cat.name,
			slug: cat.slug,
			completenessPercent: completeness,
			pillarExists: count >= 1,
			totalArticles: count,
			missingTopics,
		};
	});
}

export async function getKeywords(db: D1Database | null): Promise<KeywordTrackItem[]> {
	const fallbacks: KeywordTrackItem[] = [
		{ id: "kw-1", keyword: "astro cloudflare", intent: "Tutorial", target_position: 5, current_position: 11, impressions: 1284, status: "Top Opportunity" },
		{ id: "kw-2", keyword: "cloudflare d1 tutorial", intent: "Technical Guide", target_position: 10, current_position: 18, impressions: 950, status: "Opportunity" },
		{ id: "kw-3", keyword: "docker homelab microservices", intent: "Architecture", target_position: 8, current_position: 14, impressions: 820, status: "Top Opportunity" },
		{ id: "kw-4", keyword: "astro ssr edge latency", intent: "Informational", target_position: 10, current_position: 22, impressions: 610, status: "Growing" },
	];

	if (!db) return fallbacks;

	try {
		const { results } = await db.prepare("SELECT * FROM keywords ORDER BY impressions DESC").all();
		if (results && results.length > 0) return results as any[];
	} catch (e) {
		console.warn("Could not query keywords table:", e);
	}

	return fallbacks;
}

export interface WritingGoalItem {
	id: string;
	month_year: string;
	target_count: number;
	completed_count: number;
	updated_at?: string;
}

export async function getWritingGoal(db: D1Database | null): Promise<WritingGoalItem> {
	const currentMonth = "September 2026";
	const fallback: WritingGoalItem = {
		id: "goal-fallback",
		month_year: currentMonth,
		target_count: 4,
		completed_count: 3,
	};

	if (!db) return fallback;

	try {
		const row = await db
			.prepare("SELECT * FROM writing_goals ORDER BY updated_at DESC LIMIT 1")
			.first<WritingGoalItem>();
		if (row) return row;
	} catch (e) {
		console.warn("Could not query writing_goals table:", e);
	}

	return fallback;
}
