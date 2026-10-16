import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getAllProjects,
	getFeaturedProjects,
	getProjectPage,
	getProjects,
} from "#/features/projects/projects.server";
import { fetchImageWithKey } from "#/integrations/neon/storage/storage.server";
import { db } from "#/integrations/prisma/db";

vi.mock("#/integrations/prisma/db", () => ({
	db: { orm: { public: { Project: {} } } },
}));
vi.mock("#/integrations/neon/storage/storage.server", () => ({
	fetchImageWithKey: vi.fn(),
}));

type Call = { method: string; args: unknown[] };

// Stands in for a Prisma Next collection: each builder method records its
// arguments and returns the builder, `all()` resolves to `rows`, and
// `first()` to `first`.
function mockCollection(rows: unknown[], first: unknown = null) {
	const calls: Call[] = [];
	const builder: Record<string, unknown> = {
		all: vi.fn(async () => rows),
		first: vi.fn(async () => first),
	};
	for (const method of [
		"where",
		"include",
		"orderBy",
		"limit",
		"offset",
		"select",
	]) {
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

	it("loads the names of each project's tools", async () => {
		const calls = mockCollection([]);
		await getFeaturedProjects({});
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("tools");
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

describe("getAllProjects", () => {
	beforeEach(() => {
		vi.mocked(fetchImageWithKey).mockReset();
		vi.mocked(fetchImageWithKey).mockImplementation(async (key) =>
			key ? `https://cdn.test/${key}` : null,
		);
	});

	it("loads published projects with their tool names", async () => {
		const calls = mockCollection([]);
		await getAllProjects();
		expect(run(calls, "where")).toEqual([{ published: true }]);
		const include = calls.find((call) => call.method === "include");
		expect(include?.args[0]).toBe("tools");
		const select = include?.args[1] as (r: typeof relation) => unknown;
		expect(select(relation)).toEqual(["name"]);
	});

	it("returns them in the /projects order with cover URLs", async () => {
		mockCollection([
			project({ slug: "old", featuredRank: null, createdAt: "2023-01-01" }),
			project({ slug: "featured", featuredRank: 1, createdAt: "2020-01-01" }),
			project({ slug: "new", featuredRank: null, createdAt: "2025-01-01" }),
		]);
		const result = await getAllProjects();
		expect(result.map((p) => p.slug)).toEqual(["featured", "new", "old"]);
		expect(result[0].coverImageUrl).toBe(
			"https://cdn.test/covers/taskflow.png",
		);
	});
});

describe("getProjectPage", () => {
	const listedRows = [
		{ slug: "taskflow", title: "Taskflow", featuredRank: 1, createdAt: "2024" },
		{ slug: "ledger", title: "Ledger", featuredRank: null, createdAt: "2025" },
	];
	const row = (overrides: Record<string, unknown> = {}) => ({
		...project({ title: "Taskflow", status: "COMPLETED" }),
		tools: [{ name: "React" }, { name: "Vite" }],
		images: [
			{ key: "shots/1.png", alt: "The board" },
			{ key: "shots/missing.png", alt: "Gone" },
		],
		collaborators: [
			{ role: "design", collaborator: { name: "Ana", profileUrl: null } },
			{
				role: null,
				collaborator: { name: "Ben", profileUrl: "https://b.test" },
			},
			{ role: "art", collaborator: null },
		],
		...overrides,
	});

	beforeEach(() => {
		vi.mocked(fetchImageWithKey).mockReset();
		vi.mocked(fetchImageWithKey).mockImplementation(async (key) =>
			key && !key.includes("missing") ? `https://cdn.test/${key}` : null,
		);
	});

	it("is null when no published project has the slug", async () => {
		const calls = mockCollection(listedRows, null);
		expect(await getProjectPage("draft")).toBeNull();
		expect(run(calls, "where")).toContainEqual({
			slug: "draft",
			published: true,
		});
	});

	it("keeps the cover on the project, out of the gallery", async () => {
		mockCollection(listedRows, row());
		const page = await getProjectPage("taskflow");
		expect(page?.project.coverImageUrl).toBe(
			"https://cdn.test/covers/taskflow.png",
		);
		expect(page?.gallery.map((image) => image.alt)).not.toContain(
			"Screenshot of Taskflow",
		);
	});

	it("lists the gallery in order, dropping images without a URL", async () => {
		mockCollection(listedRows, row({ coverImageKey: null }));
		const page = await getProjectPage("taskflow");
		expect(page?.gallery).toEqual([
			{ url: "https://cdn.test/shots/1.png", alt: "The board" },
		]);
		expect(page?.project.coverImageUrl).toBeNull();
	});

	it("loads the gallery in its set order", async () => {
		const calls = mockCollection(listedRows, row());
		await getProjectPage("taskflow");
		const include = calls.find(
			(call) => call.method === "include" && call.args[0] === "images",
		);
		expect(include).toBeDefined();
	});

	it("flattens collaborators into credits, skipping missing people", async () => {
		mockCollection(listedRows, row());
		const page = await getProjectPage("taskflow");
		expect(page?.credits).toEqual([
			{ name: "Ana", role: "design", profileUrl: null },
			{ name: "Ben", role: null, profileUrl: "https://b.test" },
		]);
	});

	it("keeps the tool names on the project", async () => {
		mockCollection(listedRows, row());
		const page = await getProjectPage("taskflow");
		expect(page?.project.tools).toEqual([{ name: "React" }, { name: "Vite" }]);
	});

	it("places the project in the /projects order", async () => {
		mockCollection(listedRows, row());
		const page = await getProjectPage("taskflow");
		expect(page).toMatchObject({
			position: 1,
			total: 2,
			next: { slug: "ledger", title: "Ledger" },
		});
	});
});
