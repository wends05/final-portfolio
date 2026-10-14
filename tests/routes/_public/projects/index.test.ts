import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_INDEX_PROJECTS } from "#/features/projects/utils/project-mocks";

const { getProjectsPageFn } = vi.hoisted(() => ({
	getProjectsPageFn: vi.fn(),
}));

vi.mock("#/features/projects/projects.functions", () => ({
	getProjectsPageFn,
}));
// The page pulls in GSAP and Lenis; these tests only need the loader.
vi.mock("#/features/projects/components/ProjectsPage", () => ({
	default: () => null,
}));

const { Route } = await import("#/routes/_public/projects/index");

const load = () =>
	Promise.resolve().then(() => (Route.options.loader as () => unknown)());

beforeEach(() => {
	vi.clearAllMocks();
});

describe("projects page loader", () => {
	it("returns the published projects", async () => {
		const projects = [{ slug: "taskflow" }];
		getProjectsPageFn.mockResolvedValue(projects);

		await expect(load()).resolves.toEqual({ projects });
	});

	it("shows the mocks in development while nothing is published", async () => {
		// Vitest runs in development mode, like `bun run dev`.
		getProjectsPageFn.mockResolvedValue([]);

		await expect(load()).resolves.toEqual({ projects: MOCK_INDEX_PROJECTS });
	});
});
