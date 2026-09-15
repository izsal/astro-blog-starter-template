import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
	const sitemapURL = new URL("sitemap-index.xml", site || "https://qblog.qwarts.my.id").href;

	const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${sitemapURL}
`;

	return new Response(robotsTxt, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
