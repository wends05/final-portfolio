import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ProjectPageData } from "#/features/projects/projects.types";

// The router and GSAP need a browser; the markup does not.
vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
		<a href={to} {...rest}>
			{children}
		</a>
	),
}));
vi.mock("#/features/public/hooks/usePageEntrance", () => ({
	usePageEntrance: () => {},
}));

const { default: ProjectCaseStudy } = await import(
	"#/features/projects/components/ProjectCaseStudy"
);

const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

/** The tag and class of each element directly inside the page's `<main>`. */
function mainChildren(markup: string) {
	const children: { tag: string; className: string }[] = [];
	let depth = 0;
	for (const match of markup.matchAll(/<(\/?)([a-z][a-z0-9]*)([^>]*)>/gi)) {
		const [, closing, tag, attrs] = match;
		const name = tag.toLowerCase();
		if (closing) {
			depth -= 1;
			continue;
		}
		if (depth === 1) {
			children.push({
				tag: name,
				className: /class="([^"]*)"/.exec(attrs)?.[1] ?? "",
			});
		}
		if (!VOID_TAGS.has(name) && !attrs.endsWith("/")) depth += 1;
	}
	return children;
}

function makePage(overrides: Partial<ProjectPageData["project"]> = {}) {
	const project = {
		slug: "wishlist-app",
		title: "Wishlist App",
		description: "Share what you want.",
		body: "<h2>Problem</h2><p>Gifts.</p>",
		status: "COMPLETED",
		startedAt: "2024-01-01",
		endedAt: "2024-06-01",
		tools: [],
		metadata: [],
		gallery: [],
		credits: [],
		...overrides,
	} as unknown as ProjectPageData["project"];
	return {
		project,
		credits: [],
		position: 1,
		total: 2,
		next: { slug: "other", title: "Other" },
		isFeatured: false,
	} satisfies ProjectPageData;
}

const render = (page: ProjectPageData) =>
	renderToStaticMarkup(<ProjectCaseStudy page={page} />);

describe("ProjectCaseStudy placement", () => {
	it("keeps the footer after the about section when a project has no links and no gallery", () => {
		const markup = render(makePage());
		expect(markup.indexOf('id="project-about"')).toBeGreaterThan(-1);
		expect(markup.indexOf("next project")).toBeGreaterThan(
			markup.indexOf('id="project-about"'),
		);
		const children = mainChildren(markup);
		expect(children.at(-1)?.className).toContain("border-t");
		expect(markup.lastIndexOf("next project")).toBeGreaterThan(
			markup.indexOf("Cover of Wishlist App"),
		);
	});

	it("gives no direct child of main a row-start class", () => {
		const bare = mainChildren(render(makePage()));
		expect(bare.length).toBeGreaterThan(0);
		for (const child of bare) {
			expect(child.className).not.toMatch(/row-start-/);
		}
	});

	it("holds the same with links, credits, metadata and a gallery", () => {
		const page = makePage({
			githubUrl: "https://github.com/wends05/x",
			liveUrl: "https://x.example",
			metadata: [{ label: "role", value: "programmer" }],
			gallery: [{ image: { src: "/a.png" }, alt: "A" }],
		} as Partial<ProjectPageData["project"]>);
		const markup = render({
			...page,
			credits: [{ name: "Ada", role: "art", profileUrl: null }],
		});
		for (const child of mainChildren(markup)) {
			expect(child.className).not.toMatch(/row-start-/);
		}
		expect(markup.indexOf("next project")).toBeGreaterThan(
			markup.indexOf('id="project-credits"'),
		);
	});

	it("keeps the page entrance on the cover, about and details blocks", () => {
		const markup = render(
			makePage({
				metadata: [{ label: "role", value: "programmer" }],
			} as Partial<ProjectPageData["project"]>),
		);
		const about =
			/<section[^>]*data-entrance[^>]*aria-labelledby="project-about"/;
		expect(markup).toMatch(/<figure[^>]*data-entrance/);
		expect(markup).toMatch(about);
	});
});

describe("ProjectCaseStudy tools", () => {
	const toolsList = (markup: string) =>
		[
			...(
				/<section[^>]*aria-labelledby="project-tools".*?<\/section>/s.exec(
					markup,
				)?.[0] ?? ""
			).matchAll(/<li[^>]*>([^<]*)<\/li>/g),
		].map((match) => match[1]);

	it("lists every tool, one per row, in the project's order", () => {
		const tools = ["React", "TypeScript", "Vite", "Tailwind CSS", "Convex"];
		const markup = render(makePage({ tools }));
		expect(toolsList(markup)).toEqual(tools);
	});

	it("puts the tools above the label/value list and the credits", () => {
		const page = makePage({
			tools: ["Godot"],
			metadata: [{ label: "role", value: "programmer" }],
		} as Partial<ProjectPageData["project"]>);
		const markup = render({
			...page,
			credits: [{ name: "Ada", role: "art", profileUrl: null }],
		});
		const tools = markup.indexOf('id="project-tools"');
		expect(tools).toBeGreaterThan(markup.indexOf("Cover of Wishlist App"));
		expect(tools).toBeLessThan(markup.indexOf("<dl"));
		expect(tools).toBeLessThan(markup.indexOf('id="project-credits"'));
	});

	it("still shows the details column for a project with tools but no credits or metadata", () => {
		const markup = render(makePage({ tools: ["Godot"] }));
		expect(markup).toContain('id="project-tools"');
		expect(markup).not.toContain("<dl");
		expect(markup).not.toContain('id="project-credits"');
	});

	it("leaves the tools block out when the project has none", () => {
		const markup = render(makePage({ tools: [] }));
		expect(markup).not.toContain('id="project-tools"');
	});
});

describe("ProjectCaseStudy cover", () => {
	it("shows the cover image when the project has one", () => {
		const markup = render(
			makePage({
				cover: { src: "/static/cover.png" },
			} as Partial<ProjectPageData["project"]>),
		);
		expect(markup).toContain('alt="Cover of Wishlist App"');
		expect(markup).not.toContain("tile-columns");
	});

	it("fills the cover slot with the no-cover tile when there is none", () => {
		const markup = render(makePage());
		expect(markup).not.toContain("Cover of Wishlist App");
		expect(markup).toContain("tile-columns");
		expect(markup).toContain(">01<");
		expect(markup).toContain(">completed<");
		expect(markup).toContain(">2024<");
	});

	it("keeps the tile inside the 4:3 cover box", () => {
		const markup = render(makePage());
		const figure = /<figure.*?<\/figure>/s.exec(markup)?.[0] ?? "";
		expect(figure).toContain("aspect-4/3");
		expect(figure).toContain("tile-columns");
	});

	it("leaves the gallery section out with no images", () => {
		expect(render(makePage())).not.toContain("Gallery of Wishlist App");
	});

	it("shows the gallery, with its expand button, when there are images", () => {
		const markup = render(
			makePage({
				gallery: [
					{ image: { src: "/a.png", width: 800, height: 600 }, alt: "A" },
				],
			} as Partial<ProjectPageData["project"]>),
		);
		expect(markup).toContain("Gallery of Wishlist App");
		expect(markup).toContain('aria-label="View full screen"');
	});
});
