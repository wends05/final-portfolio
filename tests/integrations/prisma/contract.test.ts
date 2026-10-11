import { describe, expect, it } from "vitest";
import contract from "#/integrations/prisma/contract.json";

const tables = contract.storage.namespaces.public.entries.table;

describe("Skill storage", () => {
	it("has no slug column", () => {
		expect(Object.keys(tables.Skill.columns)).not.toContain("slug");
	});

	it("keeps names unique ignoring case", () => {
		expect(tables.Skill.indexes).toContainEqual(
			expect.objectContaining({
				expression: 'lower("name")',
				prefix: "skill_name_lower",
				unique: true,
			}),
		);
	});
});

describe("createdAt", () => {
	it.each(["Project", "Skill", "SkillCategory"] as const)(
		"%s.createdAt defaults to now() in the database",
		(table) => {
			expect(tables[table].columns.createdAt).toMatchObject({
				default: { kind: "function", expression: "now()" },
			});
		},
	);
});

describe("SkillCategory storage", () => {
	it("keeps its slug for the category page URL", () => {
		expect(Object.keys(tables.SkillCategory.columns)).toContain("slug");
	});
});
