import { isNotFound, isRedirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProjectBySlugFn, getSiteGate } = vi.hoisted(() => ({
	getProjectBySlugFn: vi.fn(),
	getSiteGate: vi.fn(),
}));

vi.mock("#/features/projects/projects.functions", () => ({
	getProjectBySlugFn,
}));
vi.mock("#/features/site/site.functions", () => ({ getSiteGate }));
// The layout component pulls in GSAP and Lenis; these tests only need the
// route options.
vi.mock("#/features/public/components/RootLayout", () => ({
	default: () => null,
}));

const { Route: publicLayout } = await import("#/routes/_public/route");
const { Route: catchAll } = await import("#/routes/_public/$");
const { Route: projectRoute } = await import("#/routes/_public/projects/$");

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
	const load = (slug: string | undefined) =>
		run(projectRoute.options.loader, { params: { _splat: slug } });

	it("throws notFound when no published project has the slug", async () => {
		// getProjectBySlug filters on published, so drafts come back null too.
		getProjectBySlugFn.mockResolvedValue(null);

		await expect(load("draft-or-missing")).rejects.toSatisfy(isNotFound);
		expect(getProjectBySlugFn).toHaveBeenCalledWith({
			data: { slug: "draft-or-missing" },
		});
	});

	it("throws notFound for an empty slug without querying", async () => {
		await expect(load("")).rejects.toSatisfy(isNotFound);
		expect(getProjectBySlugFn).not.toHaveBeenCalled();
	});

	it("returns the project when it exists", async () => {
		const project = { slug: "portfolio", title: "Portfolio" };
		getProjectBySlugFn.mockResolvedValue(project);

		await expect(load("portfolio")).resolves.toEqual({ project });
	});
});
