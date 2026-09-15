import type { APIRoute } from "astro";
import { getD1Database, getProjects } from "../../lib/db";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
	const url = new URL(request.url);
	const featured = url.searchParams.get("featured") === "true";

	const db = getD1Database(locals);
	const projects = await getProjects(db, featured);

	return new Response(JSON.stringify({ projects }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
		},
	});
};
