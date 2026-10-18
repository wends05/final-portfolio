import { describe, expect, it, vi } from "vitest";

const skill = (slug: string, confidence: number, tools: string[]) => ({
	slug,
	name: slug.toUpperCase(),
	confidence,
	tools,
	overview: `<p>${slug}</p>`,
	description: slug,
});
const project = (slug: string, startedAt: string, tools: string[]) => ({
	slug,
	title: slug.toUpperCase(),
	startedAt,
	tools,
	cover: null,
	body: "<p>write-up</p>",
});

vi.mock("#content", () => ({
	skills: [
		skill("devops", 40, ["Docker"]),
		skill("web", 80, ["React", "Prisma"]),
		skill("games", 60, ["Godot"]),
	],
	projects: [
		project("old-app", "2022-01-01", ["react", "Go"]),
		project("new-app", "2025-01-01", ["React", "Prisma"]),
		project("jam", "2024-01-01", ["Godot"]),
	],
	site: { featured: ["old-app"], topSkills: ["games"] },
}));

const { getSkillPage, getSkillsPage } = await import(
	"#/features/skills/skills.content"
);

describe("getSkillsPage", () => {
	it("lists top skills first, then by confidence", () => {
		expect(getSkillsPage().map((s) => s.slug)).toEqual([
			"games",
			"web",
			"devops",
		]);
	});

	it("leaves the overview out of the list", () => {
		expect(getSkillsPage()[0]).toEqual({
			slug: "games",
			name: "GAMES",
			confidence: 60,
			tools: ["Godot"],
		});
	});
});

describe("getSkillPage", () => {
	it("is undefined for an unknown slug", () => {
		expect(getSkillPage("missing")).toBeUndefined();
	});

	it("marks top skills", () => {
		expect(getSkillPage("games")?.isTop).toBe(true);
		expect(getSkillPage("web")?.isTop).toBe(false);
	});

	it("lists the projects that used its tools in the /projects order, each with only those tools", () => {
		expect(getSkillPage("web")?.projects).toEqual([
			{ slug: "old-app", title: "OLD-APP", cover: null, tools: ["react"] },
			{
				slug: "new-app",
				title: "NEW-APP",
				cover: null,
				tools: ["React", "Prisma"],
			},
		]);
	});
});
