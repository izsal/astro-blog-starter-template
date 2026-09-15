import type { APIRoute } from "astro";
import { getD1Database, getAdminSettings, saveAdminSetting } from "../../../lib/db";
import { verifyAdminSession } from "../../../lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	const settings = await getAdminSettings(db);
	return new Response(JSON.stringify({ success: true, settings }), {
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
		const body = (await request.json()) as Record<string, string>;
		for (const [key, value] of Object.entries(body)) {
			await saveAdminSetting(db, key, String(value));
		}
		return new Response(JSON.stringify({ success: true }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
};
