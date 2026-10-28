import { describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	projects: [
		{
			slug: "foo",
			title: "Foo",
			description: "A foo.",
			startedAt: "2024-01-01",
			tools: [],
			credits: [],
			cover: { src: "/static/foo-a1b2c3.png", width: 1600, height: 900 },
			draft: false,
		},
		{
			slug: "bare",
			title: "Bare",
			description: "No cover.",
			startedAt: "2023-01-01",
			tools: [],
			credits: [],
			cover: null,
			draft: false,
		},
	],
	skills: [
		{
			slug: "web",
			name: "Web",
			confidence: 80,
			tools: [],
			overview: "<p>x</p>",
			description: "Websites.",
			draft: false,
		},
	],
	collaborators: [],
	site: { featured: [], topSkills: [] },
}));
// The pages pull in GSAP and Lenis; these tests only need each route's head.
vi.mock("#/features/projects/components/ProjectCaseStudy", () => ({
	default: () => null,
}));
vi.mock("#/features/projects/components/ProjectsPage", () => ({
	default: () => null,
}));
vi.mock("#/features/skills/components/SkillPage", () => ({
	default: () => null,
}));
vi.mock("#/features/skills/components/SkillsPage", () => ({
	default: () => null,
}));

type Meta = Record<string, string> & { title?: string };
type Head = { meta: Meta[]; links: { rel: string; href: string }[] };
type HeadFn = (ctx: { loaderData?: unknown }) => Head | Record<string, never>;

const headOf = (route: { options: unknown }) =>
	(route.options as { head: HeadFn }).head;
const content = (head: Head, key: string) =>
	head.meta.find((m) => m.name === key || m.property === key)?.content;

describe("page metadata", () => {
	it("gives a project the cover as an absolute image and a canonical URL", async () => {
		const { Route } = await import("#/routes/_public/projects/$slug");
		const { getProjectPage } = await import(
			"#/features/projects/projects.content"
		);
		const head = headOf(Route)({
			loaderData: { page: getProjectPage("foo") },
		}) as Head;
		expect(head.meta).toContainEqual({ title: "Foo · wends.dev" });
		expect(content(head, "og:image")).toBe(
			"https://portfolio.wends.dev/static/foo-a1b2c3.png",
		);
		expect(content(head, "og:type")).toBe("article");
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://portfolio.wends.dev/projects/foo" },
		]);
	});

	it("sends no image for a project without a cover", async () => {
		const { Route } = await import("#/routes/_public/projects/$slug");
		const { getProjectPage } = await import(
			"#/features/projects/projects.content"
		);
		const head = headOf(Route)({
			loaderData: { page: getProjectPage("bare") },
		}) as Head;
		expect(content(head, "og:image")).toBeUndefined();
	});

	it("gives each list page its own title and canonical URL", async () => {
		const projects = await import("#/routes/_public/projects/index");
		const skills = await import("#/routes/_public/skills/index");
		const home = await import("#/routes/_public/index");
		const heads = [home, projects, skills].map(
			(m) => headOf(m.Route)({}) as Head,
		);
		const titles = heads.map((h) => h.meta.find((m) => m.title)?.title);
		expect(titles).toEqual([
			"wends.dev",
			"projects · wends.dev",
			"skills · wends.dev",
		]);
		expect(heads.map((h) => h.links[0]?.href)).toEqual([
			"https://portfolio.wends.dev/",
			"https://portfolio.wends.dev/projects",
			"https://portfolio.wends.dev/skills",
		]);
	});

	it("gives a skill its description", async () => {
		const { Route } = await import("#/routes/_public/skills/$slug");
		const { getSkillPage } = await import("#/features/skills/skills.content");
		const head = headOf(Route)({
			loaderData: { page: getSkillPage("web") },
		}) as Head;
		expect(head.meta).toContainEqual({ title: "Web · wends.dev" });
		expect(content(head, "description")).toBe("Websites.");
	});

	it("keeps /coming-soon out of search", async () => {
		const { Route } = await import("#/routes/coming-soon");
		const head = headOf(Route)({}) as Head;
		expect(content(head, "robots")).toBe("noindex");
		expect(head.links).toEqual([]);
	});
});
