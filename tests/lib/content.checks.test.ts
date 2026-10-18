import { describe, expect, it } from "vitest";
import {
	type ContentData,
	findContentErrors,
	removeDrafts,
} from "#/lib/content.checks";

const project = (slug: string, overrides: object = {}) => ({
	slug,
	path: `projects/${slug}`,
	tools: ["React"],
	credits: [],
	draft: false,
	...overrides,
});

const skill = (slug: string, overrides: object = {}) => ({
	slug,
	path: `skills/${slug}`,
	tools: [] as string[],
	draft: false,
	...overrides,
});

const content = (overrides: Partial<ContentData> = {}): ContentData => ({
	projects: [project("portfolio"), project("taskflow")],
	skills: [skill("web", { tools: ["react"] })],
	tools: ["React", "Godot"],
	collaborators: [{ slug: "jane-doe" }],
	site: { featured: ["taskflow", "portfolio"], topSkills: ["web"] },
	...overrides,
});

describe("findContentErrors", () => {
	it("accepts valid content, matching tool names ignoring case", () => {
		expect(findContentErrors(content())).toEqual([]);
	});

	it("reports tool names listed twice ignoring case", () => {
		expect(findContentErrors(content({ tools: ["React", "react"] }))).toEqual([
			'tools.yaml: "react" is listed more than once',
		]);
	});

	it("reports unknown tools on projects and skills", () => {
		const errors = findContentErrors(
			content({
				projects: [project("portfolio", { tools: ["Vue"] })],
				skills: [skill("web", { path: "skills/web", tools: ["Svelte"] })],
				site: { featured: [], topSkills: [] },
			}),
		);
		expect(errors).toEqual([
			'projects/portfolio: unknown tool "Vue"',
			'skills/web: unknown tool "Svelte"',
		]);
	});

	it("reports unknown collaborators in credits", () => {
		const errors = findContentErrors(
			content({
				projects: [
					project("portfolio", { credits: [{ collaborator: "john-roe" }] }),
				],
				site: { featured: [], topSkills: [] },
			}),
		);
		expect(errors).toEqual([
			'projects/portfolio: unknown collaborator "john-roe"',
		]);
	});

	it("reports a slug that does not match its folder or file name", () => {
		const errors = findContentErrors(
			content({
				projects: [project("portfolio", { path: "projects/old-name" })],
				skills: [skill("web", { path: "skills/web-dev", tools: [] })],
				site: { featured: [], topSkills: [] },
			}),
		);
		expect(errors).toEqual([
			'projects/old-name: slug "portfolio" does not match its folder',
			'skills/web-dev: slug "web" does not match its file name',
		]);
	});

	it("reports unknown slugs in site.yaml", () => {
		const errors = findContentErrors(
			content({ site: { featured: ["missing"], topSkills: ["nope"] } }),
		);
		expect(errors).toEqual([
			'site.yaml: unknown featured project "missing"',
			'site.yaml: unknown top skill "nope"',
		]);
	});

	it("accepts a featured draft", () => {
		const data = content({
			projects: [project("portfolio", { draft: true })],
			site: { featured: ["portfolio"], topSkills: [] },
		});
		expect(findContentErrors(data)).toEqual([]);
	});
});

describe("removeDrafts", () => {
	it("removes drafts from projects and featured, in place", () => {
		const data = content({
			projects: [project("portfolio", { draft: true }), project("taskflow")],
			site: { featured: ["portfolio", "taskflow"], topSkills: [] },
		});
		const projects = data.projects;

		removeDrafts(data);

		expect(data.projects).toBe(projects);
		expect(data.projects.map((p) => p.slug)).toEqual(["taskflow"]);
		expect(data.site.featured).toEqual(["taskflow"]);
	});

	it("leaves content without drafts unchanged", () => {
		const data = content();
		removeDrafts(data);
		expect(data).toEqual(content());
	});

	it("removes draft skills and their topSkills slugs", () => {
		const data = content({
			skills: [skill("web", { draft: true }), skill("games")],
			site: { featured: [], topSkills: ["web", "games"] },
		});
		const skills = data.skills;

		removeDrafts(data);

		expect(data.skills).toBe(skills);
		expect(data.skills.map((s) => s.slug)).toEqual(["games"]);
		expect(data.site.topSkills).toEqual(["games"]);
	});
});
