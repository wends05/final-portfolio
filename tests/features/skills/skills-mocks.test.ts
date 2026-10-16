import { describe, expect, it } from "vitest";
import { getMockSkillCategoryPage } from "#/features/skills/utils/skills-mocks";

describe("getMockSkillCategoryPage", () => {
	it("returns null for an unknown slug", () => {
		expect(getMockSkillCategoryPage("knitting")).toBeNull();
	});

	it("lists only projects that used one of the category's skills", () => {
		const page = getMockSkillCategoryPage("game-development");
		expect(page?.projects.length).toBeGreaterThan(0);
		for (const project of page?.projects ?? []) {
			expect(project.skills.map((s) => s.name)).toEqual(["Godot"]);
		}
	});

	it("keeps only the category's skills on each project", () => {
		const page = getMockSkillCategoryPage("web-development");
		const ids = new Set(page?.skills.map((s) => s.id));
		for (const project of page?.projects ?? []) {
			expect(project.skills.every((s) => ids.has(s.id))).toBe(true);
		}
	});
});
