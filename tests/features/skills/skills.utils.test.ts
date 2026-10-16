import { describe, expect, it } from "vitest";
import {
	filterProjectsBySkill,
	splitPicked,
	splitVisibleSkills,
} from "#/features/skills/skills.utils";

const skills = (...names: string[]) => names.map((name) => ({ name }));

describe("splitVisibleSkills", () => {
	it("shows the first skills and counts the rest", () => {
		const { visible, hidden } = splitVisibleSkills(
			skills("React", "TypeScript", "Prisma", "Tailwind CSS", "Go"),
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
		expect(splitVisibleSkills(skills("Flutter", "Expo"), 3)).toEqual({
			visible: skills("Flutter", "Expo"),
			hidden: 0,
		});
		expect(splitVisibleSkills(skills("A", "B", "C"), 3).hidden).toBe(0);
	});

	it("handles a category with no skills", () => {
		expect(splitVisibleSkills([], 3)).toEqual({ visible: [], hidden: 0 });
	});

	it("treats a negative count as zero", () => {
		expect(splitVisibleSkills(skills("Go"), -1)).toEqual({
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

describe("filterProjectsBySkill", () => {
	const projects = [
		{ slug: "taskflow", skills: [{ id: "react" }, { id: "prisma" }] },
		{ slug: "wends-dev", skills: [{ id: "react" }] },
		{ slug: "ledger-cli", skills: [{ id: "go" }] },
	];

	it("keeps every project when no skill is selected", () => {
		expect(filterProjectsBySkill(projects, null)).toBe(projects);
	});

	it("keeps only the projects that used the selected skill", () => {
		expect(filterProjectsBySkill(projects, "react").map((p) => p.slug)).toEqual(
			["taskflow", "wends-dev"],
		);
		expect(
			filterProjectsBySkill(projects, "prisma").map((p) => p.slug),
		).toEqual(["taskflow"]);
	});

	it("returns nothing for a skill no project used", () => {
		expect(filterProjectsBySkill(projects, "redis")).toEqual([]);
	});
});
