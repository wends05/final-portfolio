import { describe, expect, it } from "vitest";
import {
	absoluteUrl,
	buildRobotsTxt,
	buildSeo,
	buildSitemapXml,
	formatTitle,
	homeJsonLd,
	markdownAlternate,
	projectJsonLd,
	SITE_ORIGIN,
	serializeJsonLd,
	truncateDescription,
} from "#/features/seo/seo.utils";

type Meta = Record<string, string>;
const find = (meta: unknown[], key: string, value: string) =>
	(meta as Meta[]).find((m) => m.name === key || m.property === key)?.[value];

describe("absoluteUrl", () => {
	it("joins the origin and a path without doubled or trailing slashes", () => {
		expect(absoluteUrl("/projects/foo")).toBe(`${SITE_ORIGIN}/projects/foo`);
		expect(absoluteUrl("projects//")).toBe(`${SITE_ORIGIN}/projects`);
	});

	it("keeps the root slash and leaves absolute URLs alone", () => {
		expect(absoluteUrl("/")).toBe(`${SITE_ORIGIN}/`);
		expect(absoluteUrl("https://example.com/a.png")).toBe(
			"https://example.com/a.png",
		);
	});
});

describe("formatTitle", () => {
	it("is the site name alone on the home page", () => {
		expect(formatTitle()).toBe("wends.dev");
	});

	it("puts the page name first", () => {
		expect(formatTitle("projects")).toBe("projects · wends.dev");
	});
});

describe("truncateDescription", () => {
	it("returns short text with whitespace collapsed", () => {
		expect(truncateDescription("  one\n two  ")).toBe("one two");
	});

	it("cuts at a word boundary within the limit and ends with an ellipsis", () => {
		const text = "word ".repeat(60);
		const cut = truncateDescription(text, 20);
		expect(cut.length).toBeLessThanOrEqual(20);
		expect(cut).toBe("word word word…");
	});

	it("cuts a single long word at the limit", () => {
		expect(truncateDescription("x".repeat(50), 10)).toBe(`${"x".repeat(9)}…`);
	});
});

describe("buildSeo", () => {
	const base = { description: "A page.", path: "/projects" };

	it("sets the title, description, canonical and agent copy links, Open Graph and Twitter tags", () => {
		const seo = buildSeo({ ...base, title: "projects" });
		expect(seo.meta).toContainEqual({ title: "projects · wends.dev" });
		expect(find(seo.meta, "description", "content")).toBe("A page.");
		expect(find(seo.meta, "og:title", "content")).toBe("projects");
		expect(find(seo.meta, "og:type", "content")).toBe("website");
		expect(find(seo.meta, "og:url", "content")).toBe(`${SITE_ORIGIN}/projects`);
		expect(find(seo.meta, "twitter:title", "content")).toBe("projects");
		expect(seo.links).toEqual([
			{ rel: "canonical", href: `${SITE_ORIGIN}/projects` },
			{
				rel: "alternate",
				type: "text/markdown",
				href: `${SITE_ORIGIN}/projects.md`,
			},
		]);
	});

	it("links the home page to /index.md", () => {
		expect(markdownAlternate("/")).toEqual({
			rel: "alternate",
			type: "text/markdown",
			href: `${SITE_ORIGIN}/index.md`,
		});
	});

	it("sends no image and a summary card when there is none", () => {
		const seo = buildSeo(base);
		expect(find(seo.meta, "og:image", "content")).toBeUndefined();
		expect(find(seo.meta, "twitter:card", "content")).toBe("summary");
	});

	it("makes an image path absolute and uses the large card", () => {
		const seo = buildSeo({
			...base,
			image: { src: "/static/a.png", width: 1200, height: 630, alt: "A" },
		});
		expect(find(seo.meta, "og:image", "content")).toBe(
			`${SITE_ORIGIN}/static/a.png`,
		);
		expect(find(seo.meta, "twitter:image", "content")).toBe(
			`${SITE_ORIGIN}/static/a.png`,
		);
		expect(find(seo.meta, "og:image:width", "content")).toBe("1200");
		expect(find(seo.meta, "og:image:height", "content")).toBe("630");
		expect(find(seo.meta, "og:image:alt", "content")).toBe("A");
		expect(find(seo.meta, "twitter:card", "content")).toBe(
			"summary_large_image",
		);
	});

	it("uses the site name as the title on the home page", () => {
		const seo = buildSeo({ description: "Home.", path: "/" });
		expect(seo.meta).toContainEqual({ title: "wends.dev" });
		expect(find(seo.meta, "og:title", "content")).toBe("wends.dev");
	});

	it("marks a noindex page and drops its canonical, URL and JSON-LD", () => {
		const seo = buildSeo({ ...base, noindex: true, jsonLd: { a: 1 } });
		expect(find(seo.meta, "robots", "content")).toBe("noindex");
		expect(find(seo.meta, "og:url", "content")).toBeUndefined();
		expect(seo.links).toEqual([]);
		expect(seo.scripts).toEqual([]);
	});

	it("omits canonical and og:url without a path", () => {
		const seo = buildSeo({ description: "Default." });
		expect(seo.links).toEqual([]);
		expect(find(seo.meta, "og:url", "content")).toBeUndefined();
	});

	it("embeds JSON-LD as a script", () => {
		const seo = buildSeo({ ...base, jsonLd: { "@type": "Thing" } });
		expect(seo.scripts).toEqual([
			{ type: "application/ld+json", children: '{"@type":"Thing"}' },
		]);
	});
});

describe("serializeJsonLd", () => {
	it("escapes < so data cannot close the script tag", () => {
		const out = serializeJsonLd({ name: "</script><b>" });
		expect(out).not.toContain("<");
		expect(JSON.parse(out)).toEqual({ name: "</script><b>" });
	});
});

describe("JSON-LD builders", () => {
	it("describes the person and the site on the home page", () => {
		const data = homeJsonLd(["https://github.com/wends05"]);
		const types = data["@graph"].map((node) => node["@type"]);
		expect(types).toEqual(["Person", "WebSite"]);
		expect(data["@graph"][0]).toMatchObject({
			sameAs: ["https://github.com/wends05"],
		});
	});

	it("describes a project and skips fields it lacks", () => {
		const full = projectJsonLd({
			slug: "foo",
			title: "Foo",
			description: "A foo.",
			startedAt: "2024-01-01",
			tools: ["React", "Godot"],
			cover: { src: "/static/c.png" },
			githubUrl: "https://github.com/x/foo",
			liveUrl: null,
		});
		expect(full).toMatchObject({
			"@type": "CreativeWork",
			url: `${SITE_ORIGIN}/projects/foo`,
			image: `${SITE_ORIGIN}/static/c.png`,
			keywords: "React, Godot",
			sameAs: ["https://github.com/x/foo"],
		});

		const bare = projectJsonLd({
			slug: "bar",
			title: "Bar",
			description: "A bar.",
			startedAt: "2024-01-01",
			tools: [],
		});
		expect(bare).not.toHaveProperty("image");
		expect(bare).not.toHaveProperty("keywords");
		expect(bare).not.toHaveProperty("sameAs");
	});
});

describe("buildSitemapXml", () => {
	it("lists each path once as an absolute <loc>", () => {
		const xml = buildSitemapXml(["/", "/projects", "/projects"]);
		expect(xml).toContain(
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		);
		expect(xml.match(/<url>/g)).toHaveLength(2);
		expect(xml).toContain(`<loc>${SITE_ORIGIN}/</loc>`);
		expect(xml).toContain(`<loc>${SITE_ORIGIN}/projects</loc>`);
	});

	it("escapes XML characters in a path", () => {
		expect(buildSitemapXml(["/a&b"])).toContain("/a&amp;b</loc>");
	});

	it("is a valid empty urlset with no paths", () => {
		expect(buildSitemapXml([])).toContain("</urlset>");
		expect(buildSitemapXml([])).not.toContain("<url>");
	});
});

describe("buildRobotsTxt", () => {
	it("allows crawlers and points at the sitemap when the site is public", () => {
		const txt = buildRobotsTxt(false);
		expect(txt).toContain("Allow: /");
		expect(txt).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
	});

	it("disallows everything and names no sitemap while gated", () => {
		const txt = buildRobotsTxt(true);
		expect(txt).toContain("Disallow: /");
		expect(txt).not.toContain("Sitemap");
	});
});
