import { describe, expect, it } from "vitest";
import contract from "#/integrations/prisma/contract.json";

const tables = contract.storage.namespaces.public.entries.table;

describe("Tool storage", () => {
	it("has no slug column", () => {
		expect(Object.keys(tables.Tool.columns)).not.toContain("slug");
	});

	it("has no skill of its own: a tool joins skills through SkillTool", () => {
		expect(Object.keys(tables.Tool.columns)).not.toContain("skillId");
	});

	it("keeps names unique ignoring case", () => {
		expect(tables.Tool.indexes).toContainEqual(
			expect.objectContaining({
				expression: 'lower("name")',
				prefix: "tool_name_lower",
				unique: true,
			}),
		);
	});
});

describe("createdAt", () => {
	it.each(["Project", "Tool", "Skill"] as const)(
		"%s.createdAt defaults to now() in the database",
		(table) => {
			expect(tables[table].columns.createdAt).toMatchObject({
				default: { kind: "function", expression: "now()" },
			});
		},
	);
});

describe("Skill storage", () => {
	it("keeps its slug for the skill page URL", () => {
		expect(Object.keys(tables.Skill.columns)).toContain("slug");
	});
});

describe("join tables", () => {
	it.each([
		["SkillTool", ["skillId", "toolId"]],
		["ProjectTool", ["projectId", "toolId"]],
	] as const)("%s has a composite key", (table, columns) => {
		expect(tables[table].primaryKey.columns).toEqual(columns);
	});

	it.each(["SkillTool", "ProjectTool"] as const)(
		"%s rows cascade from both sides",
		(table) => {
			const { foreignKeys } = tables[table];
			expect(foreignKeys).toHaveLength(2);
			for (const fk of foreignKeys) expect(fk.onDelete).toBe("cascade");
		},
	);
});
