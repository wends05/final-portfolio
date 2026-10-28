import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("#content", () => ({
	projects: [
		{
			slug: "live",
			title: "Live",
			description: "A live project.",
			status: "COMPLETED",
			startedAt: "2024-01-01",
			tools: [],
			credits: [],
			metadata: [],
			bodyMarkdown: "Write-up.",
			draft: false,
		},
		{
			slug: "secret",
			title: "Secret",
			description: "A draft.",
			status: "ONGOING",
			startedAt: "2024-02-01",
			tools: [],
			credits: [],
			metadata: [],
			bodyMarkdown: "Hidden.",
			draft: true,
		},
	],
	skills: [
		{
			slug: "web",
			name: "Web",
			confidence: 80,
			tools: [],
			overviewMarkdown: "Websites.",
			description: "Websites.",
			draft: false,
		},
	],
	collaborators: [],
	site: { featured: [], topSkills: [] },
}));

type Handlers = {
	server: {
		handlers: { GET: (ctx: { params: Record<string, string> }) => Response };
	};
};
const get = (
	route: { options: unknown },
	params: Record<string, string> = {},
) => (route.options as Handlers).server.handlers.GET({ params });

const routes = {
	home: await import("#/routes/index[.]md"),
	projects: await import("#/routes/projects[.]md"),
	project: await import("#/routes/projects/{$slug}[.]md"),
	skills: await import("#/routes/skills[.]md"),
	skill: await import("#/routes/skills/{$slug}[.]md"),
	llms: await import("#/routes/llms[.]txt"),
	sitemap: await import("#/routes/sitemap[.]md"),
};

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("agent file routes", () => {
	it("serve each copy as Markdown", async () => {
		for (const [route, params, heading] of [
			[routes.home, {}, "# Wendell Terence Dador"],
			[routes.projects, {}, "# Projects"],
			[routes.project, { slug: "live" }, "# Live"],
			[routes.skills, {}, "# Skills"],
			[routes.skill, { slug: "web" }, "# Web"],
			[routes.sitemap, {}, "# Sitemap"],
		] as const) {
			const res = get(route.Route, params);
			expect(res.status).toBe(200);
			expect(res.headers.get("Content-Type")).toBe(
				"text/markdown; charset=utf-8",
			);
			expect((await res.text()).startsWith(`${heading}\n`)).toBe(true);
		}
	});

	it("serve llms.txt as plain text", async () => {
		const res = get(routes.llms.Route);
		expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
		expect(await res.text()).toContain(
			"https://portfolio.wends.dev/projects/live.md",
		);
	});

	it("404 for a draft or an unknown slug", () => {
		expect(get(routes.project.Route, { slug: "secret" }).status).toBe(404);
		expect(get(routes.project.Route, { slug: "nope" }).status).toBe(404);
		expect(get(routes.skill.Route, { slug: "nope" }).status).toBe(404);
	});

	it("404 for every file while the site is gated", () => {
		vi.stubEnv("COMING_SOON", "true");
		expect(get(routes.home.Route).status).toBe(404);
		expect(get(routes.llms.Route).status).toBe(404);
		expect(get(routes.project.Route, { slug: "live" }).status).toBe(404);
	});
});
