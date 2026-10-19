import { isNotFound, isRedirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSiteGate } = vi.hoisted(() => ({ getSiteGate: vi.fn() }));

// One published project. Drafts are removed before the data is generated, so
// a draft's slug is as unknown here as a typo.
vi.mock("#content", () => ({
	projects: [
		{
			slug: "portfolio",
			title: "Portfolio",
			startedAt: "2026-10-01",
			credits: [],
		},
	],
	collaborators: [],
	site: { featured: [], topSkills: [] },
}));
vi.mock("#/features/site/site.functions", () => ({ getSiteGate }));
// The layout component pulls in GSAP and Lenis; these tests only need the
// route options.
vi.mock("#/features/public/components/RootLayout", () => ({
	default: () => null,
}));

const { Route: publicLayout } = await import("#/routes/_public/route");
const { Route: catchAll } = await import("#/routes/_public/$");
const { Route: projectRoute } = await import("#/routes/_public/projects/$slug");

// Route hooks take a large context object; these only read what is passed.
type Hook = (ctx: unknown) => unknown;
const run = (hook: unknown, ctx: unknown = {}) =>
	Promise.resolve().then(() => (hook as Hook)(ctx));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("unknown URLs", () => {
	it("throw notFound from the catch-all route", async () => {
		await expect(run(catchAll.options.beforeLoad)).rejects.toSatisfy(
			isNotFound,
		);
	});

	it("redirect to /coming-soon first while the site is gated", async () => {
		getSiteGate.mockResolvedValue({ gated: true });

		const thrown = await run(publicLayout.options.beforeLoad).catch((e) => e);

		expect(isRedirect(thrown) && thrown.options.to).toBe("/coming-soon");
	});

	it("reach the catch-all when the site is open", async () => {
		getSiteGate.mockResolvedValue({ gated: false });

		await expect(run(publicLayout.options.beforeLoad)).resolves.toBeUndefined();
	});
});

describe("project page loader", () => {
	const load = (slug: string) =>
		run(projectRoute.options.loader, { params: { slug } });

	it("throws notFound for a slug with no project, drafts included", async () => {
		await expect(load("draft-or-missing")).rejects.toSatisfy(isNotFound);
	});

	it("returns the case study when the project exists", async () => {
		const { page } = (await load("portfolio")) as {
			page: { project: { slug: string }; position: number; total: number };
		};
		expect(page.project.slug).toBe("portfolio");
		expect(page).toMatchObject({ position: 1, total: 1 });
	});
});
