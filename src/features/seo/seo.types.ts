export interface SeoImage {
	/** A path ("/static/cover-a1b2c3.png") or an absolute URL. */
	src: string;
	width?: number;
	height?: number;
	alt?: string;
}

export interface SeoInput {
	/** The page name. Leave out on the home page, which is just the site name. */
	title?: string;
	/** At most 160 characters; see `truncateDescription`. */
	description: string;
	/**
	 * The canonical path, such as "/projects/foo". Without it there is no
	 * canonical, `og:url`, or link to the page's agent copy.
	 */
	path?: string;
	/** Falls back to the default social image, when there is one. */
	image?: SeoImage | null;
	type?: "website" | "article";
	noindex?: boolean;
	jsonLd?: Record<string, unknown>;
}

export type SeoMeta = { title: string } | Record<string, string>;

export interface SeoHead {
	meta: SeoMeta[];
	links: { rel: string; href: string; type?: string }[];
	scripts: { type: "application/ld+json"; children: string }[];
}
