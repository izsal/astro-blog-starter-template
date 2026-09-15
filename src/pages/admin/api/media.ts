import type { APIRoute } from "astro";
import { getD1Database, getMediaItems, createMediaItem, deleteMediaItem } from "../../../lib/db";
import { verifyAdminSession } from "../../../lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
	const cookie = request.headers.get("cookie");
	if (!verifyAdminSession(cookie, locals.runtime?.env)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	}

	const db = getD1Database(locals);
	const media = await getMediaItems(db);
	return new Response(JSON.stringify({ success: true, media }), {
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
		const filename = body?.filename || body?.file_name;
		const url = body?.url || body?.file_url;
		if (!filename || !url) {
			return new Response(JSON.stringify({ error: "Filename and URL are required" }), { status: 400 });
		}

		const result = await createMediaItem(db, {
			filename,
			url,
			mime_type: body?.mime_type || body?.file_type || "image/webp",
			size_bytes: body?.size_bytes || body?.file_size || 0,
			alt_text: body?.alt_text || null,
		});
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

	const result = await deleteMediaItem(db, id);
	return new Response(JSON.stringify(result), {
		status: result.success ? 200 : 400,
		headers: { "Content-Type": "application/json" },
	});
};
