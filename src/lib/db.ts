// Cloudflare D1 Helper & Database Access Layer
// Binding: "my-binding"

export interface PostStats {
	slug: string;
	views: number;
	likes: number;
	updated_at?: string;
}

export interface ProjectItem {
	id: number;
	slug: string;
	title: string;
	description: string;
	tech_stack: string[];
	github_url?: string | null;
	live_url?: string | null;
	featured: boolean;
	category: string;
	created_at: string;
}

export interface SnippetItem {
	id: number;
	slug: string;
	title: string;
	category: string;
	summary: string;
	code_snippet?: string | null;
	created_at: string;
}

export const FALLBACK_PROJECTS: ProjectItem[] = [
	{
		id: 1,
		slug: "cloud-edge-api",
		title: "Cloud Edge Analytics API",
		description:
			"High-throughput analytics ingestion engine built on Cloudflare Workers and D1 database with sub-millisecond response latency.",
		tech_stack: ["Cloudflare Workers", "TypeScript", "D1 SQLite", "Hono"],
		github_url: "https://github.com/qwarts/cloud-edge-api",
		live_url: "https://qblog.qwarts.my.id",
		featured: true,
		category: "Backend & Cloud",
		created_at: "2026-01-15 10:00:00",
	},
	{
		id: 2,
		slug: "astro-knowledge-hub",
		title: "Personal Knowledge Hub & Digital Garden",
		description:
			"Modern developer blog and knowledge management system built with Astro 5, Cloudflare adapter, and tailored content clusters.",
		tech_stack: ["Astro", "TypeScript", "Tailwind CSS", "Cloudflare"],
		github_url: "https://github.com/qwarts/astro-blog-starter-template",
		live_url: "https://qblog.qwarts.my.id",
		featured: true,
		category: "Fullstack",
		created_at: "2026-02-01 10:00:00",
	},
	{
		id: 3,
		slug: "docker-homelab-infra",
		title: "Automated Homelab & Microservice Cluster",
		description:
			"Production-ready Docker Compose infrastructure with automated Traefik reverse proxy, SSL certs, Prometheus and Grafana monitoring.",
		tech_stack: ["Docker", "Linux", "Traefik", "Bash", "Prometheus"],
		github_url: "https://github.com/qwarts/docker-homelab-infra",
		live_url: null,
		featured: true,
		category: "DevOps & Linux",
		created_at: "2026-02-15 10:00:00",
	},
];

export const FALLBACK_SNIPPETS: SnippetItem[] = [
	{
		id: 1,
		slug: "cloudflare-d1-batch-queries",
		title: "Cloudflare D1 Atomic Transactions using Batch API",
		category: "Cloudflare",
		summary:
			"How to run atomic batch queries in Cloudflare D1 to eliminate round-trip overhead and maintain data consistency.",
		code_snippet: `const [views, info] = await db.batch([
  db.prepare("UPDATE post_views SET views = views + 1 WHERE slug = ?").bind(slug),
  db.prepare("SELECT views, likes FROM post_views WHERE slug = ?").bind(slug)
]);`,
		created_at: "2026-02-10 10:00:00",
	},
	{
		id: 2,
		slug: "docker-compose-healthcheck",
		title: "Robust Docker Service Dependency with condition: service_healthy",
		category: "Docker",
		summary:
			"Ensure database containers are fully ready before launching dependent application services in Docker Compose.",
		code_snippet: `services:
  web:
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 5s
      timeout: 5s
      retries: 5`,
		created_at: "2026-02-14 10:00:00",
	},
	{
		id: 3,
		slug: "astro-on-demand-ssr-island",
		title: "Selective SSR in Astro 5 with export const prerender = false",
		category: "Astro",
		summary:
			"Make dynamic API endpoints or specific dynamic pages on-demand rendered while keeping the rest static.",
		code_snippet: `// src/pages/api/views/[slug].ts
export const prerender = false;

export async function GET({ params, locals }) {
  const db = getD1Database(locals);
  // Query D1 directly at the edge
}`,
		created_at: "2026-02-20 10:00:00",
	},
];

export function getD1Database(locals?: App.Locals): D1Database | null {
	try {
		if (locals && "runtime" in locals && locals.runtime?.env?.["my-binding"]) {
			return locals.runtime.env["my-binding"];
		}
	} catch (err) {
		console.warn("Could not obtain D1 database binding 'my-binding':", err);
	}
	return null;
}

export async function getPostStats(
	db: D1Database | null,
	slug: string
): Promise<PostStats> {
	if (!db) {
		return { slug, views: 0, likes: 0 };
	}

	try {
		const row = await db
			.prepare("SELECT slug, views, likes, updated_at FROM post_views WHERE slug = ?")
			.bind(slug)
			.first<PostStats>();

		if (row) {
			return row;
		}

		// Insert initial record if not exists
		await db
			.prepare("INSERT OR IGNORE INTO post_views (slug, views, likes) VALUES (?, 0, 0)")
			.bind(slug)
			.run();

		return { slug, views: 0, likes: 0 };
	} catch (error) {
		console.error(`Error querying post stats for slug "${slug}":`, error);
		return { slug, views: 0, likes: 0 };
	}
}

export async function incrementPostView(
	db: D1Database | null,
	slug: string
): Promise<PostStats> {
	if (!db) {
		return { slug, views: 1, likes: 0 };
	}

	try {
		await db
			.prepare(
				`INSERT INTO post_views (slug, views, likes, updated_at)
         VALUES (?1, 1, 0, CURRENT_TIMESTAMP)
         ON CONFLICT(slug) DO UPDATE SET
           views = views + 1,
           updated_at = CURRENT_TIMESTAMP`
			)
			.bind(slug)
			.run();

		const updated = await db
			.prepare("SELECT slug, views, likes, updated_at FROM post_views WHERE slug = ?")
			.bind(slug)
			.first<PostStats>();

		return updated || { slug, views: 1, likes: 0 };
	} catch (error) {
		console.error(`Error incrementing view for slug "${slug}":`, error);
		return { slug, views: 0, likes: 0 };
	}
}

export async function togglePostLike(
	db: D1Database | null,
	slug: string
): Promise<PostStats> {
	if (!db) {
		return { slug, views: 0, likes: 1 };
	}

	try {
		await db
			.prepare(
				`INSERT INTO post_views (slug, views, likes, updated_at)
         VALUES (?1, 0, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(slug) DO UPDATE SET
           likes = likes + 1,
           updated_at = CURRENT_TIMESTAMP`
			)
			.bind(slug)
			.run();

		const updated = await db
			.prepare("SELECT slug, views, likes, updated_at FROM post_views WHERE slug = ?")
			.bind(slug)
			.first<PostStats>();

		return updated || { slug, views: 0, likes: 1 };
	} catch (error) {
		console.error(`Error liking post "${slug}":`, error);
		return { slug, views: 0, likes: 0 };
	}
}

export async function getProjects(
	db: D1Database | null,
	featuredOnly = false
): Promise<ProjectItem[]> {
	if (!db) {
		return featuredOnly
			? FALLBACK_PROJECTS.filter((p) => p.featured)
			: FALLBACK_PROJECTS;
	}

	try {
		const query = featuredOnly
			? "SELECT * FROM projects WHERE featured = 1 ORDER BY id DESC"
			: "SELECT * FROM projects ORDER BY id DESC";

		const { results } = await db.prepare(query).all();

		if (!results || results.length === 0) {
			return featuredOnly
				? FALLBACK_PROJECTS.filter((p) => p.featured)
				: FALLBACK_PROJECTS;
		}

		return results.map((row: any) => ({
			id: row.id,
			slug: row.slug,
			title: row.title,
			description: row.description,
			tech_stack: typeof row.tech_stack === "string" ? JSON.parse(row.tech_stack) : row.tech_stack,
			github_url: row.github_url,
			live_url: row.live_url,
			featured: Boolean(row.featured),
			category: row.category,
			created_at: row.created_at,
		}));
	} catch (error) {
		console.error("Error fetching projects from D1:", error);
		return featuredOnly
			? FALLBACK_PROJECTS.filter((p) => p.featured)
			: FALLBACK_PROJECTS;
	}
}

export async function getSnippets(
	db: D1Database | null,
	category?: string
): Promise<SnippetItem[]> {
	if (!db) {
		return category
			? FALLBACK_SNIPPETS.filter((s) => s.category.toLowerCase() === category.toLowerCase())
			: FALLBACK_SNIPPETS;
	}

	try {
		let query = "SELECT * FROM snippets ORDER BY id DESC";
		let stmt = db.prepare(query);

		if (category) {
			query = "SELECT * FROM snippets WHERE LOWER(category) = LOWER(?) ORDER BY id DESC";
			stmt = db.prepare(query).bind(category);
		}

		const { results } = await stmt.all();

		if (!results || results.length === 0) {
			return category
				? FALLBACK_SNIPPETS.filter((s) => s.category.toLowerCase() === category.toLowerCase())
				: FALLBACK_SNIPPETS;
		}

		return results.map((row: any) => ({
			id: row.id,
			slug: row.slug,
			title: row.title,
			category: row.category,
			summary: row.summary,
			code_snippet: row.code_snippet,
			created_at: row.created_at,
		}));
	} catch (error) {
		console.error("Error fetching snippets from D1:", error);
		return category
			? FALLBACK_SNIPPETS.filter((s) => s.category.toLowerCase() === category.toLowerCase())
			: FALLBACK_SNIPPETS;
	}
}

export async function addSubscriber(
	db: D1Database | null,
	email: string
): Promise<{ success: boolean; message: string }> {
	if (!db) {
		return { success: true, message: "Subscribed successfully (Local/Demo mode)." };
	}

	try {
		await db
			.prepare("INSERT INTO subscribers (email) VALUES (?)")
			.bind(email)
			.run();
		return { success: true, message: "Thank you for subscribing!" };
	} catch (err: any) {
		if (err?.message?.includes("UNIQUE constraint failed")) {
			return { success: true, message: "You are already subscribed!" };
		}
		console.error("Error adding subscriber:", err);
		return { success: false, message: "Failed to subscribe. Please try again." };
	}
}
