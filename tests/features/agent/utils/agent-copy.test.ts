import { describe, expect, it } from "vitest";
import type {
	CopyHome,
	CopyProject,
	CopySkill,
} from "#/features/agent/agent.types";
import {
	agentFileList,
	factsTable,
	homeCopy,
	llmsTxt,
	markdownLink,
	markdownTable,
	projectCopy,
	projectsCopy,
	sitemapMd,
	skillCopy,
	skillsCopy,
	tableCell,
} from "#/features/agent/utils/agent-copy";

const ORIGIN = "https://example.test";

const project: CopyProject = {
	slug: "wishlist",
	title: "Wishlist App",
	description: "Share what you want.",
	status: "COMPLETED",
	startedAt: "2024-01-01",
	endedAt: "2024-06-01",
	tools: ["React", "TypeScript"],
	teamName: "team a",
	credits: [
		{ name: "Jane Doe", role: "Artist", profileUrl: "https://jane.example" },
		{ name: "Sam", role: null, profileUrl: null },
	],
	githubUrl: "https://github.com/x/wishlist",
	liveUrl: null,
	metadata: [{ label: "event", value: "Hack | Day" }],
	featured: true,
	bodyMarkdown: "## Problem\n\nGifts.",
};

const skill: CopySkill = {
	slug: "web",
	name: "Web development",
	confidence: 80,
	tools: ["React"],
	overviewMarkdown: "I build websites.",
	top: false,
	projects: [
		{
			slug: "wishlist",
			title: "Wishlist App",
			status: "ONGOING",
			number: "01",
			year: "2024",
			tools: ["React"],
		},
	],
};

const home: CopyHome = {
	siteName: "wends.dev",
	name: "Jane Owner",
	description: "Portfolio of Jane.",
	about: ["I make things."],
	featured: [
		{ slug: "wishlist", title: "Wishlist App", description: "Share." },
	],
	topSkills: [
		{ slug: "web", name: "Web development", confidence: 80, tools: ["React"] },
	],
	contact: [
		{ label: "GitHub", value: "https://github.com/x" },
		{ label: "Email (main)", value: "jane@example.test" },
	],
	cvPath: "/cv.pdf",
	pagePaths: ["/", "/projects", "/skills", "/projects/wishlist", "/skills/web"],
};

describe("Markdown helpers", () => {
	it("keeps a table cell on one line and escapes pipes", () => {
		expect(tableCell(" a |\n b ")).toBe("a \\| b");
	});

	it("escapes backslashes right before a pipe", () => {
		expect(tableCell("x\\|y")).toBe("x\\\\\\|y");
		expect(tableCell("C:\\dir")).toBe("C:\\dir");
	});

	it("builds a GFM table", () => {
		expect(markdownTable(["A", "B"], [["1", "2"]])).toBe(
			"| A | B |\n| --- | --- |\n| 1 | 2 |",
		);
	});

	it("leaves empty fields out of the facts table", () => {
		expect(
			factsTable([
				["Team", null],
				["Tools", "React"],
				["Ended", " "],
			]),
		).toBe("| Field | Value |\n| --- | --- |\n| Tools | React |");
	});

	it("escapes brackets in link text", () => {
		expect(markdownLink("a [b]", "https://x.test")).toBe(
			"[a \\[b\\]](https://x.test)",
		);
	});
});

describe("projectCopy", () => {
	const text = projectCopy(project, ORIGIN);

	it("has the case study's facts in a Field/Value table", () => {
		expect(text).toMatch(/^# Wishlist App\n\nShare what you want\.\n\n/);
		expect(text).toContain("| Field | Value |");
		expect(text).toContain("| Status | Completed |");
		expect(text).toContain("| Started | 2024-01-01 |");
		expect(text).toContain("| Ended | 2024-06-01 |");
		expect(text).toContain("| Team | team a |");
		expect(text).toContain("| Featured | Yes |");
		expect(text).toContain("| Tools | React, TypeScript |");
		expect(text).toContain(
			"| Credits | [Jane Doe](https://jane.example) (Artist), Sam |",
		);
		expect(text).toContain("| GitHub | https://github.com/x/wishlist |");
		expect(text).toContain("| event | Hack \\| Day |");
		expect(text).not.toContain("Live site");
	});

	it("links the human page and ends with the write-up", () => {
		expect(text).toContain(
			"Human page: https://example.test/projects/wishlist",
		);
		expect(text.endsWith("## Problem\n\nGifts.\n")).toBe(true);
	});
});

describe("list copies", () => {
	it("lists projects with their number, link and facts", () => {
		const text = projectsCopy(
			[{ ...project, number: "01", featured: true }],
			"All projects.",
			ORIGIN,
		);
		expect(text).toContain("All projects.");
		expect(text).toContain(
			"| 01 | [Wishlist App (featured)](https://example.test/projects/wishlist) | Share what you want. | Completed | 2024-01-01 | React, TypeScript |",
		);
	});

	it("lists skills with their confidence and tools", () => {
		const text = skillsCopy([{ ...skill, top: true }], "All skills.", ORIGIN);
		expect(text).toContain(
			"| [Web development (top skill)](https://example.test/skills/web) | 80/100 | React |",
		);
	});
});

describe("skillCopy", () => {
	it("has the facts, the overview and the projects", () => {
		const text = skillCopy(skill, ORIGIN);
		expect(text).toContain("| Confidence | 80/100 |");
		expect(text).not.toContain("Top skill");
		expect(text).toContain("I build websites.");
		expect(text).toContain(
			"| 01 | [Wishlist App](https://example.test/projects/wishlist) | 2024 | Ongoing | React |",
		);
	});

	it("leaves out the projects section when no project used its tools", () => {
		expect(skillCopy({ ...skill, projects: [] }, ORIGIN)).not.toContain(
			"## Projects",
		);
	});
});

describe("homeCopy", () => {
	const text = homeCopy(home, ORIGIN);

	it("has the owner, featured projects, top skills and contact", () => {
		expect(text).toMatch(/^# Jane Owner\n/);
		expect(text).toContain("I make things.");
		expect(text).toContain(
			"- [Wishlist App](https://example.test/projects/wishlist): Share.",
		);
		expect(text).toContain(
			"- [Web development](https://example.test/skills/web): confidence 80/100. Tools: React",
		);
		expect(text).toContain("- Email (main): jane@example.test");
	});

	it("lists every agent file", () => {
		for (const file of agentFileList(home.pagePaths)) {
			expect(text).toContain(`(https://example.test${file})`);
		}
		expect(agentFileList(home.pagePaths).slice(0, 3)).toEqual([
			"/llms.txt",
			"/sitemap.md",
			"/index.md",
		]);
	});
});

describe("llmsTxt and sitemapMd", () => {
	const pages = [
		{ path: "/", title: "Home", description: "Home page." },
		{ path: "/projects", title: "Projects", description: "All projects." },
		{ path: "/skills", title: "Skills", description: "All skills." },
		{
			path: "/projects/wishlist",
			title: "Wishlist App",
			description: "Share.",
		},
		{ path: "/skills/web", title: "Web development", description: "Web." },
	];

	it("follows llms.txt: title, summary, then link sections", () => {
		const text = llmsTxt(home, pages, ORIGIN);
		expect(text).toMatch(/^# wends\.dev\n\n> Portfolio of Jane\.\n/);
		expect(text).toContain(
			"- [Home](https://example.test/index.md): Home page.",
		);
		expect(text).toContain(
			"## Projects\n\n- [Wishlist App](https://example.test/projects/wishlist.md): Share.",
		);
		expect(text).toContain(
			"## Skills\n\n- [Web development](https://example.test/skills/web.md): Web.",
		);
		expect(text).toContain("[CV](https://example.test/cv.pdf)");
	});

	it("lists every page with its URL and copy", () => {
		const text = sitemapMd(pages, "wends.dev", ORIGIN);
		expect(text).toContain(
			"| Home | https://example.test/ | https://example.test/index.md |",
		);
		expect(text).toContain(
			"| Web development | https://example.test/skills/web | https://example.test/skills/web.md |",
		);
	});
});
