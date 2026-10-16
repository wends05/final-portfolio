import { describe, expect, it } from "vitest";
import {
	filterProjectsByTool,
	getProjectsUsingTools,
	splitPicked,
	splitVisibleTools,
} from "#/features/skills/skills.utils";

const tools = (...names: string[]) => names.map((name) => ({ name }));

describe("splitVisibleTools", () => {
	it("shows the first tools and counts the rest", () => {
		const { visible, hidden } = splitVisibleTools(
			tools("React", "TypeScript", "Prisma", "Tailwind CSS", "Go"),
			3,
		);
		expect(visible.map((s) => s.name)).toEqual([
			"React",
			"TypeScript",
			"Prisma",
		]);
		expect(hidden).toBe(2);
	});

	it("hides nothing when the list fits", () => {
		expect(splitVisibleTools(tools("Flutter", "Expo"), 3)).toEqual({
			visible: tools("Flutter", "Expo"),
			hidden: 0,
		});
		expect(splitVisibleTools(tools("A", "B", "C"), 3).hidden).toBe(0);
	});

	it("handles a skill with no tools", () => {
		expect(splitVisibleTools([], 3)).toEqual({ visible: [], hidden: 0 });
	});

	it("treats a negative count as zero", () => {
		expect(splitVisibleTools(tools("Go"), -1)).toEqual({
			visible: [],
			hidden: 1,
		});
	});
});

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
		{ slug: "taskflow", tools: [{ id: "react" }, { id: "prisma" }] },
		{ slug: "wends-dev", tools: [{ id: "react" }] },
		{ slug: "ledger-cli", tools: [{ id: "go" }] },
	];

	it("keeps every project when no tool is selected", () => {
		expect(filterProjectsByTool(projects, null)).toBe(projects);
	});

	it("keeps only the projects that used the selected tool", () => {
		expect(filterProjectsByTool(projects, "react").map((p) => p.slug)).toEqual([
			"taskflow",
			"wends-dev",
		]);
		expect(filterProjectsByTool(projects, "prisma").map((p) => p.slug)).toEqual(
			["taskflow"],
		);
	});

	it("returns nothing for a tool no project used", () => {
		expect(filterProjectsByTool(projects, "redis")).toEqual([]);
	});
});

describe("getProjectsUsingTools", () => {
	const projects = [
		{ slug: "taskflow", tools: [{ id: "react" }, { id: "prisma" }] },
		{ slug: "wends-dev", tools: [{ id: "react" }] },
		{ slug: "ledger-cli", tools: [{ id: "go" }] },
		{ slug: "notes", tools: [] },
	];

	it("keeps the projects that used any of the tools", () => {
		const used = getProjectsUsingTools(projects, new Set(["react", "go"]));
		expect(used.map((p) => p.slug)).toEqual([
			"taskflow",
			"wends-dev",
			"ledger-cli",
		]);
	});

	it("keeps only the given tools on each project", () => {
		const [taskflow] = getProjectsUsingTools(projects, new Set(["prisma"]));
		expect(taskflow?.tools).toEqual([{ id: "prisma" }]);
	});

	it("returns nothing when the skill has no tools", () => {
		expect(getProjectsUsingTools(projects, new Set())).toEqual([]);
	});
});
