import type { APIRoute } from "astro";
import { addSubscriber, getD1Database } from "../../lib/db";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const data = (await request.json()) as { email?: string };
		const email = data?.email?.trim();

		if (!email || !email.includes("@")) {
			return new Response(
				JSON.stringify({ success: false, message: "Valid email is required." }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const db = getD1Database(locals);
		const result = await addSubscriber(db, email);

		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 500,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({ success: false, message: "Invalid request payload." }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
};
