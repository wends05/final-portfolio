import { describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	projects: [
		{ slug: "old", title: "Old", startedAt: "2022-01-01" },
		{ slug: "featured", title: "Featured", startedAt: "2020-01-01" },
	],
	collaborators: [],
	site: { featured: ["featured"], topSkills: [] },
}));
// The page pulls in GSAP and Lenis; these tests only need the loader.
vi.mock("#/features/projects/components/ProjectsPage", () => ({
	default: () => null,
}));

const { Route } = await import("#/routes/_public/projects/index");

const load = () =>
	Promise.resolve().then(() => (Route.options.loader as () => unknown)());

describe("projects page loader", () => {
	it("returns the content projects, featured first, with the featured slugs", async () => {
		const data = (await load()) as {
			projects: { slug: string }[];
			featured: string[];
		};
		expect(data.projects.map((p) => p.slug)).toEqual(["featured", "old"]);
		expect(data.featured).toEqual(["featured"]);
	});
});
