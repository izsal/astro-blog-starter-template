import type { APIRoute } from "astro";
import { getD1Database, getRedirects, createRedirect, deleteRedirect } from "../../../lib/db";
import { verifyAdminSession } from "../../../lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	const redirects = await getRedirects(db);
	return new Response(JSON.stringify({ success: true, redirects }), {
		headers: { "Content-Type": "application/json" },
	});
};

export const POST: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "Database not connected" }), { status: 500 });

	try {
		const body = (await request.json()) as any;
		if (!body.from_path || !body.to_path) {
			return new Response(JSON.stringify({ error: "from_path and to_path are required" }), { status: 400 });
		}

		const result = await createRedirect(db, body);
		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 400,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};

export const DELETE: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "Database not connected" }), { status: 500 });

	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

	const result = await deleteRedirect(db, id);
	return new Response(JSON.stringify(result), {
		status: result.success ? 200 : 400,
		headers: { "Content-Type": "application/json" },
	});
};
