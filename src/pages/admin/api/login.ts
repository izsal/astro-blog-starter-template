import type { APIRoute } from "astro";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = (await request.json()) as { token?: string };
		const token = body?.token?.trim();
		const expectedToken = getExpectedAdminToken(locals.runtime?.env);

		if (token === expectedToken) {
			const headers = new Headers({ "Content-Type": "application/json" });
			headers.append(
				"Set-Cookie",
				`${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
			);

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers,
			});
		}

		return new Response(
			JSON.stringify({ success: false, message: "Token atau password admin salah." }),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	} catch (err) {
		return new Response(
			JSON.stringify({ success: false, message: "Invalid payload." }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
};
