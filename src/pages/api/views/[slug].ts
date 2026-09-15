import type { APIRoute } from "astro";
import { getD1Database, getPostStats, incrementPostView, togglePostLike } from "../../../lib/db";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
	const slug = params.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const db = getD1Database(locals);
	const stats = await getPostStats(db, slug);

	return new Response(JSON.stringify(stats), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
		},
	});
};

export const POST: APIRoute = async ({ params, request, locals }) => {
	const slug = params.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	let action = "view";
	try {
		const body = (await request.json()) as { action?: string };
		if (body && body.action) {
			action = body.action;
		}
	} catch {
		// Default to view
	}

	const db = getD1Database(locals);
	let stats;

	if (action === "like") {
		stats = await togglePostLike(db, slug);
	} else {
		stats = await incrementPostView(db, slug);
	}

	return new Response(JSON.stringify(stats), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
