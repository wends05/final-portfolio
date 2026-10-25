import type { SeoHead, SeoImage, SeoInput, SeoMeta } from "./seo.types";

export const SITE_NAME = "wends.dev";
export const SITE_ORIGIN = "https://portfolio.wends.dev";
export const AUTHOR_NAME = "Wendell Terence Dador";

export const DEFAULT_DESCRIPTION =
	"Portfolio of Wendell Terence Dador, a software engineer in the Philippines who builds web applications and games.";

/**
 * The 1200×630 image used when a page has none. Set it once the file is in
 * `public/`; until then pages without an image send no social image.
 */
export const DEFAULT_SOCIAL_IMAGE: SeoImage | null = null;

const MAX_DESCRIPTION = 160;

/** The full URL for a site path or URL, with no trailing slash except on "/". */
export function absoluteUrl(path: string, origin: string = SITE_ORIGIN) {
	if (/^https?:\/\//.test(path)) return path;
	const trimmed = path.replace(/^\/+/, "").replace(/\/+$/, "");
	return trimmed ? `${origin}/${trimmed}` : `${origin}/`;
}

/** "projects · wends.dev"; just the site name when there is no page name. */
export function formatTitle(page?: string) {
	return page ? `${page} · ${SITE_NAME}` : SITE_NAME;
}

/** Collapses whitespace and cuts at a word boundary, ending with "…" when it cuts. */
export function truncateDescription(text: string, max = MAX_DESCRIPTION) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	const room = clean.slice(0, max - 1);
	const lastSpace = room.lastIndexOf(" ");
	const cut = lastSpace > 0 ? room.slice(0, lastSpace) : room;
	return `${cut.replace(/[\s,.;:–-]+$/, "")}…`;
}

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/** JSON for a `<script>` body: `<` is escaped so the data cannot close the tag. */
export function serializeJsonLd(data: Record<string, unknown>) {
	return JSON.stringify(data)
		.replaceAll("<", "\\u003c")
		.replaceAll(LINE_SEPARATOR, "\\u2028")
		.replaceAll(PARAGRAPH_SEPARATOR, "\\u2029");
}

/** Everything a route's `head()` returns: meta tags, canonical link, JSON-LD. */
export function buildSeo(input: SeoInput): SeoHead {
	const title = formatTitle(input.title);
	const image = input.image ?? DEFAULT_SOCIAL_IMAGE;
	const indexable = !input.noindex;
	const url = input.path ? absoluteUrl(input.path) : null;

	const meta: SeoMeta[] = [
		{ title },
		{ name: "description", content: input.description },
		...(input.noindex ? [{ name: "robots", content: "noindex" }] : []),
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:locale", content: "en_US" },
		{ property: "og:type", content: input.type ?? "website" },
		{ property: "og:title", content: input.title ?? SITE_NAME },
		{ property: "og:description", content: input.description },
		...(url && indexable ? [{ property: "og:url", content: url }] : []),
		...(image ? imageMeta(image) : []),
		{
			name: "twitter:card",
			content: image ? "summary_large_image" : "summary",
		},
		{ name: "twitter:title", content: input.title ?? SITE_NAME },
		{ name: "twitter:description", content: input.description },
		...(image
			? [{ name: "twitter:image", content: absoluteUrl(image.src) }]
			: []),
	];

	return {
		meta,
		links: url && indexable ? [{ rel: "canonical", href: url }] : [],
		scripts:
			input.jsonLd && indexable
				? [
						{
							type: "application/ld+json",
							children: serializeJsonLd(input.jsonLd),
						},
					]
				: [],
	};
}

function imageMeta(image: SeoImage): Record<string, string>[] {
	return [
		{ property: "og:image", content: absoluteUrl(image.src) },
		...(image.width
			? [{ property: "og:image:width", content: String(image.width) }]
			: []),
		...(image.height
			? [{ property: "og:image:height", content: String(image.height) }]
			: []),
		...(image.alt ? [{ property: "og:image:alt", content: image.alt }] : []),
	];
}

/** The person and the site, for the home page. */
export function homeJsonLd(sameAs: readonly string[]) {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Person",
				"@id": `${absoluteUrl("/")}#person`,
				name: AUTHOR_NAME,
				url: absoluteUrl("/"),
				jobTitle: "Software engineer",
				sameAs: [...sameAs],
			},
			{
				"@type": "WebSite",
				"@id": `${absoluteUrl("/")}#website`,
				name: SITE_NAME,
				url: absoluteUrl("/"),
				publisher: { "@id": `${absoluteUrl("/")}#person` },
			},
		],
	};
}

interface ProjectJsonLdInput {
	slug: string;
	title: string;
	description: string;
	startedAt: string;
	tools: readonly string[];
	cover?: { src: string } | null;
	githubUrl?: string | null;
	liveUrl?: string | null;
}

/** A project case study as a creative work by the site owner. */
export function projectJsonLd(project: ProjectJsonLdInput) {
	const sameAs = [project.githubUrl, project.liveUrl].filter(
		(link): link is string => Boolean(link),
	);
	return {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		name: project.title,
		description: project.description,
		url: absoluteUrl(`/projects/${project.slug}`),
		dateCreated: project.startedAt,
		author: { "@type": "Person", name: AUTHOR_NAME, url: absoluteUrl("/") },
		...(project.cover ? { image: absoluteUrl(project.cover.src) } : {}),
		...(project.tools.length > 0 ? { keywords: project.tools.join(", ") } : {}),
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}

function escapeXml(text: string) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/** A sitemaps.org `urlset` listing each site path once. */
export function buildSitemapXml(paths: readonly string[]) {
	const urls = [...new Set(paths)]
		.map((path) => `\t<url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Open to every crawler with a sitemap, or closed to all while the site is gated. */
export function buildRobotsTxt(gated: boolean) {
	if (gated) return "User-agent: *\nDisallow: /\n";
	return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;
}
