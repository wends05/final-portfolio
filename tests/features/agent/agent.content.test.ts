import { afterEach, describe, expect, it, vi } from "vitest";

const project = (slug: string, draft = false) => ({
	slug,
	title: slug.toUpperCase(),
	description: `${slug} description`,
	status: "COMPLETED",
	startedAt: "2024-01-01",
	endedAt: null,
	tools: ["React"],
	teamName: null,
	credits: [],
	githubUrl: null,
	liveUrl: null,
	metadata: [],
	bodyMarkdown: `${slug} write-up`,
	draft,
});

vi.mock("#content", () => ({
	projects: [project("live"), project("secret", true)],
	skills: [
		{
			slug: "web",
			name: "Web",
			confidence: 80,
			tools: ["React"],
			overviewMarkdown: "Websites.",
			description: "Websites.",
			draft: false,
		},
		{
			slug: "hidden",
			name: "Hidden",
			confidence: 10,
			tools: ["React"],
			overviewMarkdown: "No.",
			description: "No.",
			draft: true,
		},
	],
	collaborators: [],
	site: { featured: ["secret", "live"], topSkills: ["hidden", "web"] },
}));

const { getAgentCopy, getAgentFiles, getAgentOrigin } = await import(
	"#/features/agent/agent.content"
);

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getAgentFiles", () => {
	it("writes a copy of every page, llms.txt and sitemap.md", () => {
		expect(getAgentFiles().map((f) => f.file)).toEqual([
			"/index.md",
			"/projects.md",
			"/skills.md",
			"/projects/live.md",
			"/skills/web.md",
			"/llms.txt",
			"/sitemap.md",
		]);
	});

	it("never mentions a draft, even when drafts are switched on", () => {
		for (const { text } of getAgentFiles()) {
			expect(text).not.toMatch(/secret|SECRET|hidden|Hidden/);
		}
	});

	it("links to the site's origin", () => {
		const sitemap = getAgentFiles().find((f) => f.file === "/sitemap.md");
		expect(sitemap?.text).toContain(
			"https://portfolio.wends.dev/projects/live",
		);
	});
});

describe("getAgentOrigin", () => {
	it("uses VITE_SITE_URL when it is set", () => {
		vi.stubEnv("VITE_SITE_URL", "https://preview.example/");
		expect(getAgentOrigin()).toBe("https://preview.example");
		const copy = getAgentCopy("/projects");
		expect(copy?.markdown).toContain("https://preview.example/projects/live");
	});

	it("falls back to the site's origin", () => {
		expect(getAgentOrigin()).toBe("https://portfolio.wends.dev");
	});
});

describe("getAgentCopy", () => {
	it("returns the same Markdown as the file", () => {
		const copy = getAgentCopy("/projects/live");
		const file = getAgentFiles().find((f) => f.file === "/projects/live.md");
		expect(copy).toMatchObject({
			path: "/projects/live",
			file: "/projects/live.md",
			title: "LIVE",
		});
		expect(copy?.markdown).toBe(file?.text);
	});

	it("has no copy for a draft or an unknown page", () => {
		expect(getAgentCopy("/projects/secret")).toBeUndefined();
		expect(getAgentCopy("/skills/hidden")).toBeUndefined();
		expect(getAgentCopy("/nope")).toBeUndefined();
	});
});
