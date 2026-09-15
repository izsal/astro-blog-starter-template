import type { D1Database } from "@cloudflare/workers-types";

export interface SeriesPostItem {
	id: string;
	title: string;
	slug: string;
	position: number;
}

export interface SeriesDetail {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	posts: SeriesPostItem[];
}

export const FALLBACK_SERIES: SeriesDetail[] = [
	{
		id: "ser-astro-cf",
		title: "Astro + Cloudflare Mastery",
		slug: "astro-cloudflare",
		description:
			"Panduan komprehensif dari dasar hingga deployment: membuat personal knowledge hub, edge API, dan database D1 berkecepatan tinggi.",
		posts: [
			{ id: "p-1", title: "Mengenal Arsitektur Astro 5 & Islands", slug: "mengenal-astro", position: 1 },
			{ id: "p-2", title: "Membuat Blog & Content Collections", slug: "first-post", position: 2 },
			{ id: "p-3", title: "Astro On-Demand SSR di Cloudflare Workers", slug: "second-post", position: 3 },
			{ id: "p-4", title: "Integrasi Cloudflare D1 SQLite Database", slug: "cloudflare-d1-astro-tutorial", position: 4 },
			{ id: "p-5", title: "Optimasi SEO, Caching, & Production Deploy", slug: "third-post", position: 5 },
		],
	},
	{
		id: "ser-docker-infra",
		title: "Production Microservices with Docker",
		slug: "docker-microservices",
		description:
			"Arsitektur container production-ready, Traefik reverse proxy dengan automated SSL certs, and Prometheus monitoring.",
		posts: [
			{ id: "p-6", title: "Docker Fundamental & Multi-stage Builds", slug: "docker-fundamental", position: 1 },
			{ id: "p-7", title: "Automated Reverse Proxy dengan Traefik", slug: "docker-traefik", position: 2 },
			{ id: "p-8", title: "Membangun Homelab Microservices", slug: "docker-homelab-microservices", position: 3 },
		],
	},
];

export async function getAllSeries(db: D1Database | null): Promise<SeriesDetail[]> {
	if (!db) return FALLBACK_SERIES;

	try {
		const { results } = await db.prepare("SELECT * FROM series ORDER BY id ASC").all();
		if (!results || results.length === 0) return FALLBACK_SERIES;

		const seriesList: SeriesDetail[] = [];

		for (const row of results as any[]) {
			const { results: postRows } = await db
				.prepare(
					`SELECT p.id, p.title, p.slug, sp.position
					 FROM series_posts sp
					 JOIN posts p ON sp.post_id = p.id
					 WHERE sp.series_id = ?
					 ORDER BY sp.position ASC`
				)
				.bind(row.id)
				.all();

			seriesList.push({
				id: row.id,
				title: row.title,
				slug: row.slug,
				description: row.description,
				posts: (postRows || []).map((p: any) => ({
					id: p.id,
					title: p.title,
					slug: p.slug,
					position: Number(p.position),
				})),
			});
		}

		return seriesList;
	} catch (err) {
		console.error("Error fetching all series:", err);
		return FALLBACK_SERIES;
	}
}

export async function getSeriesBySlug(db: D1Database | null, slug: string): Promise<SeriesDetail | null> {
	if (!db) return FALLBACK_SERIES.find((s) => s.slug === slug) || null;

	try {
		const series = await db.prepare("SELECT * FROM series WHERE slug = ?").bind(slug).first<any>();
		if (!series) return FALLBACK_SERIES.find((s) => s.slug === slug) || null;

		const { results: postRows } = await db
			.prepare(
				`SELECT p.id, p.title, p.slug, sp.position
				 FROM series_posts sp
				 JOIN posts p ON sp.post_id = p.id
				 WHERE sp.series_id = ?
				 ORDER BY sp.position ASC`
			)
			.bind(series.id)
			.all();

		return {
			id: series.id,
			title: series.title,
			slug: series.slug,
			description: series.description,
			posts: (postRows || []).map((p: any) => ({
				id: p.id,
				title: p.title,
				slug: p.slug,
				position: Number(p.position),
			})),
		};
	} catch (err) {
		console.error("Error fetching series by slug:", err);
		return FALLBACK_SERIES.find((s) => s.slug === slug) || null;
	}
}

export async function getSeriesForPost(
	db: D1Database | null,
	postSlug: string
): Promise<{ series: SeriesDetail; currentPosition: number } | null> {
	const all = await getAllSeries(db);
	for (const s of all) {
		const match = s.posts.find((p) => p.slug === postSlug);
		if (match) {
			return { series: s, currentPosition: match.position };
		}
	}
	return null;
}
