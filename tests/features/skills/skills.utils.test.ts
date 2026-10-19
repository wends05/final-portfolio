import { describe, expect, it } from "vitest";
import {
	filterProjectsByTool,
	getProjectsUsingTools,
	getSkillPosition,
	orderSkillsPage,
	splitPicked,
} from "#/features/skills/skills.utils";

// Stands in for list items: only `dataset.slug` matters.
const item = (slug: string) => ({ dataset: { slug } });

describe("splitPicked", () => {
	it("finds the picked item by slug and keeps the rest in order", () => {
		const items = [item("web"), item("mobile"), item("game")];
		const { picked, rest } = splitPicked(items, "mobile");
		expect(picked).toBe(items[1]);
		expect(rest).toEqual([items[0], items[2]]);
	});

	it("returns no picked item and the whole list for an unknown slug", () => {
		const items = [item("web"), item("mobile")];
		expect(splitPicked(items, "devops")).toEqual({
			picked: undefined,
			rest: items,
		});
	});
});

describe("filterProjectsByTool", () => {
	const projects = [
		{ slug: "taskflow", tools: ["React", "Prisma"] },
		{ slug: "wends-dev", tools: ["react"] },
		{ slug: "ledger-cli", tools: ["Go"] },
	];

	it("keeps every project when no tool is selected", () => {
		expect(filterProjectsByTool(projects, null)).toBe(projects);
	});

	it("keeps the projects that used the selected tool, ignoring case", () => {
		expect(filterProjectsByTool(projects, "React").map((p) => p.slug)).toEqual([
			"taskflow",
			"wends-dev",
		]);
		expect(filterProjectsByTool(projects, "prisma").map((p) => p.slug)).toEqual(
			["taskflow"],
		);
	});

	it("returns nothing for a tool no project used", () => {
		expect(filterProjectsByTool(projects, "Redis")).toEqual([]);
	});
});

describe("getProjectsUsingTools", () => {
	const projects = [
		{ slug: "taskflow", tools: ["React", "Prisma"] },
		{ slug: "wends-dev", tools: ["react"] },
		{ slug: "ledger-cli", tools: ["Go"] },
		{ slug: "notes", tools: [] },
	];

	it("keeps the projects that used any of the skill's tools, ignoring case", () => {
		const used = getProjectsUsingTools(projects, ["React", "go"]);
		expect(used.map((p) => p.slug)).toEqual([
			"taskflow",
			"wends-dev",
			"ledger-cli",
		]);
	});

	it("keeps only the skill's tools on each project, as the project spells them", () => {
		const [taskflow, wendsDev] = getProjectsUsingTools(projects, ["REACT"]);
		expect(taskflow?.tools).toEqual(["React"]);
		expect(wendsDev?.tools).toEqual(["react"]);
	});

	it("returns nothing when the skill has no tools", () => {
		expect(getProjectsUsingTools(projects, [])).toEqual([]);
	});
});

describe("getSkillPosition", () => {
	it("is the index in topSkills, or -1", () => {
		expect(getSkillPosition("games", ["web", "games"])).toBe(1);
		expect(getSkillPosition("devops", ["web", "games"])).toBe(-1);
	});
});

describe("orderSkillsPage", () => {
	const skill = (slug: string, confidence: number) => ({
		slug,
		name: slug,
		confidence,
	});
	const skills = [
		skill("devops", 40),
		skill("web", 80),
		skill("games", 60),
		skill("backend", 70),
		skill("design", 70),
	];

	it("puts top skills first in topSkills order, then by confidence, then by slug", () => {
		expect(orderSkillsPage(skills, ["games"]).map((s) => s.slug)).toEqual([
			"games",
			"web",
			"backend",
			"design",
			"devops",
		]);
	});

	it("does not change the input", () => {
		const before = skills.map((s) => s.slug);
		orderSkillsPage(skills, ["games"]);
		expect(skills.map((s) => s.slug)).toEqual(before);
	});
});
