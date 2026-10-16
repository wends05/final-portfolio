import { describe, expect, it } from "vitest";
import { getMockSkillPage } from "#/features/skills/utils/skills-mocks";

describe("getMockSkillPage", () => {
	it("returns null for an unknown slug", () => {
		expect(getMockSkillPage("knitting")).toBeNull();
	});

	it("lists only projects that used one of the skill's tools", () => {
		const page = getMockSkillPage("game-development");
		expect(page?.projects.length).toBeGreaterThan(0);
		for (const project of page?.projects ?? []) {
			expect(project.tools.map((s) => s.name)).toEqual(["Godot"]);
		}
	});

	it("keeps only the skill's tools on each project", () => {
		const page = getMockSkillPage("web-development");
		const ids = new Set(page?.tools.map((s) => s.id));
		for (const project of page?.projects ?? []) {
			expect(project.tools.every((s) => ids.has(s.id))).toBe(true);
		}
	});
});
