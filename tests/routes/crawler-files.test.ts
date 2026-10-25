import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	projects: [{ slug: "live", draft: false }],
	skills: [{ slug: "web", draft: false }],
}));

const sitemap = await import("#/routes/sitemap[.]xml");
const robots = await import("#/routes/robots[.]txt");

type Handlers = { server: { handlers: { GET: () => Response } } };
const get = (route: { options: unknown }) =>
	(route.options as Handlers).server.handlers.GET();

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("/sitemap.xml", () => {
	it("serves XML listing the public pages", async () => {
		const res = get(sitemap.Route);
		expect(res.headers.get("Content-Type")).toContain("application/xml");
		const body = await res.text();
		expect(body).toContain("https://portfolio.wends.dev/projects/live");
		expect(body).toContain("https://portfolio.wends.dev/skills/web");
	});

	it("lists nothing while the site is gated", async () => {
		vi.stubEnv("COMING_SOON", "true");
		expect(await get(sitemap.Route).text()).not.toContain("<url>");
	});
});

describe("/robots.txt", () => {
	it("serves plain text that names the sitemap", async () => {
		const res = get(robots.Route);
		expect(res.headers.get("Content-Type")).toContain("text/plain");
		expect(await res.text()).toContain(
			"Sitemap: https://portfolio.wends.dev/sitemap.xml",
		);
	});

	it("disallows everything while the site is gated", async () => {
		vi.stubEnv("COMING_SOON", "true");
		expect(await get(robots.Route).text()).toContain("Disallow: /");
	});
});
