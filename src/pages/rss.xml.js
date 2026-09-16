import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getD1Database } from "../lib/db";
import { getUnifiedPosts } from "../lib/posts";

export const prerender = false;

export async function GET(context) {
	const db = getD1Database(context.locals);
	const posts = await getUnifiedPosts(db, { status: "PUBLISHED" });
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.excerpt,
			pubDate: new Date(post.published_at),
			link: `/blog/${post.slug}/`,
		})),
	});
}
