import { describe, expect, it, vi } from "vitest";

const project = (slug: string) => ({
	slug,
	title: slug.toUpperCase(),
	description: `About ${slug}.`,
	cover: null,
	tools: ["React"],
	githubUrl: null,
	liveUrl: null,
	status: "COMPLETED",
	startedAt: "2024-01-01",
	endedAt: null,
	teamName: null,
	body: "<p>write-up</p>",
	credits: [],
});
const skill = (slug: string) => ({
	slug,
	name: slug.toUpperCase(),
	tools: ["React"],
	confidence: 50,
	overview: "<p>overview</p>",
});

vi.mock("#content", () => ({
	// File order differs from site.yaml order on purpose.
	projects: ["d", "a", "c", "b"].map(project),
	skills: ["web", "games", "mobile", "devops"].map(skill),
	site: {
		featured: ["b", "missing", "a", "c", "d"],
		topSkills: ["mobile", "web", "games", "devops"],
	},
}));

const { getHomepage, HOMEPAGE_LIMIT } = await import(
	"#/features/public/public.content"
);

describe("getHomepage", () => {
	it("lists featured projects in site.yaml order, skipping unknown slugs, up to the limit", () => {
		const { featuredProjects } = getHomepage();
		expect(featuredProjects.map((p) => p.slug)).toEqual(["b", "a", "c"]);
		expect(featuredProjects).toHaveLength(HOMEPAGE_LIMIT);
	});

	it("lists top skills in site.yaml order, up to the limit", () => {
		expect(getHomepage().topSkills.map((s) => s.slug)).toEqual([
			"mobile",
			"web",
			"games",
		]);
	});

	it("sends only what the cards show, without the write-up or overview", () => {
		const { featuredProjects, topSkills } = getHomepage();
		expect(featuredProjects[0]).not.toHaveProperty("body");
		expect(featuredProjects[0]).not.toHaveProperty("credits");
		expect(topSkills[0]).toEqual({
			slug: "mobile",
			name: "MOBILE",
			tools: ["React"],
		});
	});
});
