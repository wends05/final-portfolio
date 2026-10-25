import { describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	projects: [
		{ slug: "live", draft: false },
		{ slug: "wip", draft: true },
	],
	skills: [
		{ slug: "web", draft: false },
		{ slug: "secret", draft: true },
	],
}));

const { getSitemapPaths } = await import("#/features/seo/seo.content");

describe("getSitemapPaths", () => {
	it("lists the public pages and every non-draft project and skill", () => {
		expect(getSitemapPaths()).toEqual([
			"/",
			"/projects",
			"/skills",
			"/projects/live",
			"/skills/web",
		]);
	});
});
