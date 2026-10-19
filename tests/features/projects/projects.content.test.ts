import { describe, expect, it, vi } from "vitest";

const project = (slug: string, startedAt: string, credits: object[] = []) => ({
	slug,
	title: slug.toUpperCase(),
	startedAt,
	credits,
});

vi.mock("#content", () => ({
	projects: [
		project("old", "2022-01-01"),
		project("new", "2025-01-01", [
			{ collaborator: "jane-doe", role: "Artist" },
		]),
		project("featured", "2020-01-01"),
	],
	collaborators: [{ slug: "jane-doe", name: "Jane Doe" }],
	site: { featured: ["featured"], topSkills: [] },
}));

const { getProjectPage, getProjectsPage } = await import(
	"#/features/projects/projects.content"
);

describe("getProjectsPage", () => {
	it("lists featured projects first, then the rest newest first", () => {
		const { projects, featured } = getProjectsPage();
		expect(projects.map((p) => p.slug)).toEqual(["featured", "new", "old"]);
		expect(featured).toEqual(["featured"]);
	});
});

describe("getProjectPage", () => {
	it("is undefined for an unknown slug", () => {
		expect(getProjectPage("missing")).toBeUndefined();
	});

	it("returns the project with its place in the /projects order", () => {
		const page = getProjectPage("new");
		expect(page?.project.slug).toBe("new");
		expect(page).toMatchObject({
			position: 2,
			total: 3,
			next: { slug: "old", title: "OLD" },
		});
	});

	it("marks only featured projects as featured", () => {
		expect(getProjectPage("featured")?.isFeatured).toBe(true);
		expect(getProjectPage("new")?.isFeatured).toBe(false);
	});

	it("names the credited collaborators", () => {
		expect(getProjectPage("new")?.credits).toEqual([
			{ name: "Jane Doe", role: "Artist", profileUrl: null },
		]);
	});
});
