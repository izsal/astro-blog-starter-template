import type { APIRoute } from "astro";
import { getD1Database } from "../../../lib/db";
import { createPostInD1 } from "../../../lib/posts";
import { verifyAdminSession } from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const body = (await request.json()) as any;
		if (!body?.title || !body?.slug || !body?.content) {
			return new Response(JSON.stringify({ error: "Title, slug, dan content wajib diisi." }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const db = getD1Database(locals);
		if (!db) {
			return new Response(JSON.stringify({ error: "Database D1 binding not found" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		const result = await createPostInD1(db, body);
		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 500,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err?.message || "Failed to process" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
