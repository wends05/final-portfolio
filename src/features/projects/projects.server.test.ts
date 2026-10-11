import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchImageWithKey } from "#/integrations/neon/storage/storage.server";
import { db } from "#/integrations/prisma/db";
import { getFeaturedProjects, getProjects } from "./projects.server";

vi.mock("#/integrations/prisma/db", () => ({
	db: { orm: { public: { Project: {} } } },
}));
vi.mock("#/integrations/neon/storage/storage.server", () => ({
	fetchImageWithKey: vi.fn(),
}));

type Call = { method: string; args: unknown[] };

// Stands in for a Prisma Next collection: each builder method records its
// arguments and returns the builder, and `all()` resolves to `rows`.
function mockCollection(rows: unknown[]) {
	const calls: Call[] = [];
	const builder: Record<string, unknown> = {
		all: vi.fn(async () => rows),
	};
	for (const method of ["where", "include", "orderBy", "limit", "offset"]) {
		builder[method] = (...args: unknown[]) => {
			calls.push({ method, args });
			return builder;
		};
	}
	Object.assign(db.orm.public.Project, builder);
	return calls;
}

// A model whose fields describe the condition or ordering built on them, so
// a test can read what a callback like `(p) => p.featuredRank.isNotNull()` asks for.
const model = new Proxy(
	{},
	{
		get: (_, field) => ({
			isNotNull: () => `${String(field)} is not null`,
			asc: () => `${String(field)} asc`,
			desc: () => `${String(field)} desc`,
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

const project = (overrides: Record<string, unknown> = {}) => ({
	id: "p1",
	slug: "taskflow",
	coverImageKey: "covers/taskflow.png",
	...overrides,
});

describe("getFeaturedProjects", () => {
	beforeEach(() => {
		vi.mocked(fetchImageWithKey).mockReset();
		vi.mocked(fetchImageWithKey).mockImplementation(async (key) =>
			key ? `https://cdn.test/${key}` : null,
		);
	});

	it("keeps only published projects that have a featured rank", async () => {
		const calls = mockCollection([]);
		await getFeaturedProjects({});
		expect(run(calls, "where")).toEqual([
			{ published: true },
			"featuredRank is not null",
		]);
	});

	it("orders by featured rank and limits to three by default", async () => {
		const calls = mockCollection([]);
		await getFeaturedProjects({});
		expect(run(calls, "orderBy")).toEqual(["featuredRank asc"]);
		expect(run(calls, "limit")).toEqual([3]);
	});

	it("passes a custom limit through", async () => {
		const calls = mockCollection([]);
		await getFeaturedProjects({ limit: 5 });
		expect(run(calls, "limit")).toEqual([5]);
	});

	it("loads the names of each project's skills", async () => {
		const calls = mockCollection([]);
		await getFeaturedProjects({});
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("skills");
		const select = include?.args[1] as (r: typeof relation) => unknown;
		expect(select(relation)).toEqual(["name"]);
	});

	it("adds a cover image URL resolved from the stored key", async () => {
		mockCollection([project()]);
		const [result] = await getFeaturedProjects({});
		expect(fetchImageWithKey).toHaveBeenCalledWith("covers/taskflow.png");
		expect(result).toMatchObject({
			coverImageKey: "covers/taskflow.png",
			coverImageUrl: "https://cdn.test/covers/taskflow.png",
		});
	});

	it("gives a project without a cover key a null URL", async () => {
		mockCollection([project({ coverImageKey: null })]);
		const [result] = await getFeaturedProjects({});
		expect(fetchImageWithKey).toHaveBeenCalledWith(undefined);
		expect(result.coverImageUrl).toBeNull();
	});
});

describe("getProjects", () => {
	it("pages through published projects, newest first", async () => {
		vi.mocked(fetchImageWithKey).mockResolvedValue(null);
		const calls = mockCollection([]);
		await getProjects({ take: 10, skip: 20 });
		expect(run(calls, "where")).toEqual([{ published: true }]);
		expect(run(calls, "orderBy")).toEqual(["createdAt desc"]);
		expect(run(calls, "offset")).toEqual([20]);
		expect(run(calls, "limit")).toEqual([10]);
	});
});
