import { describe, expect, it, vi } from "vitest";
import {
	getAllSkills,
	getSkillPage,
	getTopSkills,
} from "#/features/skills/skills.server";
import { db } from "#/integrations/prisma/db";

vi.mock("#/integrations/neon/storage/storage.server", () => ({
	fetchImageWithKey: vi.fn(async (key?: string) =>
		key ? `https://files.example/${key}` : null,
	),
}));

vi.mock("#/integrations/prisma/db", () => ({
	db: { orm: { public: { Skill: {}, Project: {} } } },
}));

type Call = { method: string; args: unknown[] };

// Stands in for a Prisma Next collection: each builder method records its
// arguments and returns the builder, and `all()` resolves to `rows`.
function mockCollection(rows: unknown[], table: "Skill" | "Project" = "Skill") {
	const calls: Call[] = [];
	const builder: Record<string, unknown> = {
		all: vi.fn(async () => rows),
		first: vi.fn(async () => rows[0] ?? null),
	};
	for (const method of ["where", "include", "orderBy", "limit"]) {
		builder[method] = (...args: unknown[]) => {
			calls.push({ method, args });
			return builder;
		};
	}
	Object.assign(db.orm.public[table], builder);
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

describe("getSkillPage", () => {
	const react = { id: "react", name: "React" };
	const go = { id: "go", name: "Go" };
	const skill = {
		id: "s1",
		slug: "web-development",
		name: "Web development",
		overview: "About the web.",
		confidence: 80,
		topRank: 1,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		tools: [react],
	};
	const project = (slug: string, tools: unknown[], createdAt: string) => ({
		id: `p-${slug}`,
		slug,
		title: slug,
		coverImageKey: `${slug}.png`,
		featuredRank: null,
		createdAt,
		tools,
	});

	it("looks the skill up by slug and loads its tools by name", async () => {
		const calls = mockCollection([skill]);
		mockCollection([], "Project");
		await getSkillPage("web-development");
		expect(run(calls, "where")).toEqual([{ slug: "web-development" }]);
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("tools");
	});

	it("returns null when no skill has the slug", async () => {
		mockCollection([]);
		const projects = mockCollection([], "Project");
		await expect(getSkillPage("knitting")).resolves.toBeNull();
		expect(projects).toEqual([]);
	});

	it("reads only published projects", async () => {
		mockCollection([skill]);
		const calls = mockCollection([], "Project");
		await getSkillPage("web-development");
		expect(run(calls, "where")).toEqual([{ published: true }]);
	});

	it("keeps the projects that used the skill's tools, each with only those tools", async () => {
		mockCollection([skill]);
		mockCollection(
			[
				project("api", [go], "2026-03-01T00:00:00.000Z"),
				project("site", [react, go], "2026-02-01T00:00:00.000Z"),
			],
			"Project",
		);
		const page = await getSkillPage("web-development");
		expect(page?.projects).toEqual([
			{
				id: "p-site",
				slug: "site",
				title: "site",
				coverImageUrl: "https://files.example/site.png",
				tools: [react],
			},
		]);
	});

	it("orders the projects like /projects, newest first", async () => {
		mockCollection([skill]);
		mockCollection(
			[
				project("old", [react], "2026-01-01T00:00:00.000Z"),
				project("new", [react], "2026-03-01T00:00:00.000Z"),
			],
			"Project",
		);
		const page = await getSkillPage("web-development");
		expect(page?.projects.map((p) => p.slug)).toEqual(["new", "old"]);
	});

	it("gives a project without a cover image a null URL", async () => {
		mockCollection([skill]);
		mockCollection(
			[
				{
					...project("site", [react], "2026-01-01T00:00:00.000Z"),
					coverImageKey: null,
				},
			],
			"Project",
		);
		const page = await getSkillPage("web-development");
		expect(page?.projects[0]?.coverImageUrl).toBeNull();
	});

	it("returns the skill's fields and tools without the timestamps", async () => {
		mockCollection([skill]);
		mockCollection([], "Project");
		await expect(getSkillPage("web-development")).resolves.toEqual({
			id: "s1",
			slug: "web-development",
			name: "Web development",
			overview: "About the web.",
			confidence: 80,
			topRank: 1,
			tools: [react],
			projects: [],
		});
	});
});
