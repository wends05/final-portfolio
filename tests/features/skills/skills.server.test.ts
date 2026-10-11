import { describe, expect, it, vi } from "vitest";
import { getTopSkillCategories } from "#/features/skills/skills.server";
import { db } from "#/integrations/prisma/db";

vi.mock("#/integrations/prisma/db", () => ({
	db: { orm: { public: { SkillCategory: {} } } },
}));

type Call = { method: string; args: unknown[] };

// Stands in for a Prisma Next collection: each builder method records its
// arguments and returns the builder, and `all()` resolves to `rows`.
function mockCollection(rows: unknown[]) {
	const calls: Call[] = [];
	const builder: Record<string, unknown> = { all: vi.fn(async () => rows) };
	for (const method of ["where", "include", "orderBy", "limit"]) {
		builder[method] = (...args: unknown[]) => {
			calls.push({ method, args });
			return builder;
		};
	}
	Object.assign(db.orm.public.SkillCategory, builder);
	return calls;
}

// Each field describes the condition or ordering built on it.
const model = new Proxy(
	{},
	{
		get: (_, field) => ({
			isNotNull: () => `${String(field)} is not null`,
			asc: () => `${String(field)} asc`,
		}),
	},
);

const relation = { select: (...fields: string[]) => fields };

function run(calls: Call[], method: string) {
	return calls
		.filter((call) => call.method === method)
		.map(({ args }) =>
			typeof args[0] === "function" ? args[0](model) : args[0],
		);
}

describe("getTopSkillCategories", () => {
	it("keeps only categories with a top rank, in rank order", async () => {
		const calls = mockCollection([]);
		await getTopSkillCategories({});
		expect(run(calls, "where")).toEqual(["topRank is not null"]);
		expect(run(calls, "orderBy")).toEqual(["topRank asc"]);
	});

	it("limits to three by default and passes a custom limit through", async () => {
		let calls = mockCollection([]);
		await getTopSkillCategories({});
		expect(run(calls, "limit")).toEqual([3]);

		calls = mockCollection([]);
		await getTopSkillCategories({ limit: 5 });
		expect(run(calls, "limit")).toEqual([5]);
	});

	it("loads the id and name of each category's skills", async () => {
		const calls = mockCollection([]);
		await getTopSkillCategories({});
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("skills");
		const select = include?.args[1] as (r: typeof relation) => unknown;
		expect(select(relation)).toEqual(["name", "id"]);
	});

	it("returns the rows the query resolves", async () => {
		const rows = [{ id: "c1", name: "Web development", skills: [] }];
		mockCollection(rows);
		await expect(getTopSkillCategories({})).resolves.toBe(rows);
	});
});
