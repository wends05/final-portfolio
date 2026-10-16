import { describe, expect, it, vi } from "vitest";
import { getAllSkills, getTopSkills } from "#/features/skills/skills.server";
import { db } from "#/integrations/prisma/db";

vi.mock("#/integrations/prisma/db", () => ({
	db: { orm: { public: { Skill: {} } } },
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
	Object.assign(db.orm.public.Skill, builder);
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

describe("getTopSkills", () => {
	it("keeps only skills with a top rank, in rank order", async () => {
		const calls = mockCollection([]);
		await getTopSkills({});
		expect(run(calls, "where")).toEqual(["topRank is not null"]);
		expect(run(calls, "orderBy")).toEqual(["topRank asc"]);
	});

	it("limits to three by default and passes a custom limit through", async () => {
		let calls = mockCollection([]);
		await getTopSkills({});
		expect(run(calls, "limit")).toEqual([3]);

		calls = mockCollection([]);
		await getTopSkills({ limit: 5 });
		expect(run(calls, "limit")).toEqual([5]);
	});

	it("loads the id and name of each skill's tools", async () => {
		const calls = mockCollection([]);
		await getTopSkills({});
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("tools");
		const select = include?.args[1] as (r: typeof relation) => unknown;
		expect(select(relation)).toEqual(["name", "id"]);
	});

	it("returns the rows the query resolves", async () => {
		const rows = [{ id: "c1", name: "Web development", tools: [] }];
		mockCollection(rows);
		await expect(getTopSkills({})).resolves.toBe(rows);
	});
});

describe("getAllSkills", () => {
	it("loads every skill, ranked ones first in rank order", async () => {
		const calls = mockCollection([]);
		await getAllSkills();
		// Postgres sorts nulls last in ascending order, so unranked skills
		// follow the top ones.
		expect(run(calls, "where")).toEqual([]);
		expect(run(calls, "orderBy")).toEqual(["topRank asc"]);
		expect(run(calls, "limit")).toEqual([]);
	});

	it("loads the id and name of each skill's tools", async () => {
		const calls = mockCollection([]);
		await getAllSkills();
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("tools");
		const select = include?.args[1] as (r: typeof relation) => unknown;
		expect(select(relation)).toEqual(["name", "id"]);
	});

	it("returns the rows the query resolves", async () => {
		const rows = [{ id: "c1", name: "UI design", tools: [] }];
		mockCollection(rows);
		await expect(getAllSkills()).resolves.toBe(rows);
	});
});
