// Structured Data JSON-LD Generator (PRD Section 9)
import { SITE_URL, AUTHOR_NAME, SITE_TITLE } from "../consts";

export interface ArticleJsonLdProps {
	title: string;
	description: string;
	url: string;
	pubDate: string;
	updatedDate?: string;
	heroImage?: string;
}

export function generateArticleJsonLd({
	title,
	description,
	url,
	pubDate,
	updatedDate,
	heroImage,
}: ArticleJsonLdProps) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: title,
		description: description,
		url: url,
		image: heroImage ? new URL(heroImage, SITE_URL).toString() : undefined,
		datePublished: pubDate,
		dateModified: updatedDate || pubDate,
		author: {
			"@type": "Person",
			name: AUTHOR_NAME,
			url: `${SITE_URL}/about`,
		},
		publisher: {
			"@type": "Organization",
			name: SITE_TITLE,
			url: SITE_URL,
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url,
		},
	};
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}
