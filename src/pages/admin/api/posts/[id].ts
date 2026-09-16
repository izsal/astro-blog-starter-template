import type { APIRoute } from "astro";
import { getD1Database } from "../../../../lib/db";
import {
	updatePostInD1,
	trashPostInD1,
	deletePostPermanently,
	duplicatePostInD1,
	getPostRevisions,
} from "../../../../lib/posts";
import { verifyAdminSession } from "../../../../lib/admin-auth";

export const prerender = false;

// GET: Fetch post revisions or post info
export const GET: APIRoute = async ({ params, locals, request }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "No DB" }), { status: 500 });

	const { id } = params;
	if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

	const url = new URL(request.url);
	if (url.searchParams.get("action") === "revisions") {
		const revisions = await getPostRevisions(db, id);
		return new Response(JSON.stringify({ success: true, revisions }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	const post = await db
		.prepare(
			`SELECT p.*, pc.category_id, c.name as category_name, c.slug as category_slug
			 FROM posts p
			 LEFT JOIN post_categories pc ON p.id = pc.post_id
			 LEFT JOIN categories c ON pc.category_id = c.id
			 WHERE p.id = ? OR p.slug = ?`
		)
		.bind(id, id)
		.first();
	return new Response(JSON.stringify({ success: true, post }), {
		headers: { "Content-Type": "application/json" },
	});
};

// PATCH: Update post details / Autosave
export const PATCH: APIRoute = async ({ params, request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "No DB" }), { status: 500 });

	const { id } = params;
	if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

	try {
		const body = (await request.json()) as any;
		const result = await updatePostInD1(db, id, body);
		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 400,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};

// POST: Duplicate or Actions (action=duplicate | restore)
export const POST: APIRoute = async ({ params, request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "No DB" }), { status: 500 });

	const { id } = params;
	if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

	try {
		const body = (await request.json().catch(() => ({}))) as any;
		if (body.action === "duplicate") {
			const result = await duplicatePostInD1(db, id);
			return new Response(JSON.stringify(result), {
				status: result.success ? 200 : 400,
				headers: { "Content-Type": "application/json" },
			});
		} else if (body.action === "restore") {
			const result = await trashPostInD1(db, id, false);
			return new Response(JSON.stringify(result), {
				status: result.success ? 200 : 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};

// DELETE: Move to Trash or Permanent Delete
export const DELETE: APIRoute = async ({ params, request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "No DB" }), { status: 500 });

	const { id } = params;
	if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

	const url = new URL(request.url);
	const permanent = url.searchParams.get("permanent") === "true";

	const result = permanent ? await deletePostPermanently(db, id) : await trashPostInD1(db, id, true);

	return new Response(JSON.stringify(result), {
		status: result.success ? 200 : 400,
		headers: { "Content-Type": "application/json" },
	});
};
