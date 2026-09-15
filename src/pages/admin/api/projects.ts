import type { APIRoute } from "astro";
import { getD1Database, createProjectInD1 } from "../../../lib/db";
import { verifyAdminSession } from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	if (!db) return new Response(JSON.stringify({ error: "Database not connected" }), { status: 500 });

	try {
		const body = (await request.json()) as any;
		if (!body.title || !body.slug || !body.description) {
			return new Response(JSON.stringify({ error: "Title, slug, and description are required" }), {
				status: 400,
			});
		}

		const result = await createProjectInD1(db, body);
		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 400,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
