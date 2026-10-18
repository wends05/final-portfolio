import { describe, expect, it } from "vitest";
import {
	getMetadataRows,
	getProjectDateLine,
	getProjectLinks,
	getProjectPosition,
	nearestIndex,
	orderProjects,
	padIndex,
	resolveCredits,
	stepSlide,
} from "#/features/projects/projects.utils";

const listed = (slug: string) => ({ slug, title: slug.toUpperCase() });

describe("getProjectPosition", () => {
	const ordered = [listed("a"), listed("b"), listed("c")];

	it("counts from 1 and points at the project after", () => {
		expect(getProjectPosition(ordered, "b")).toEqual({
			position: 2,
			total: 3,
			next: { slug: "c", title: "C" },
		});
	});

	it("wraps from the last project to the first", () => {
		expect(getProjectPosition(ordered, "c")?.next).toEqual({
			slug: "a",
			title: "A",
		});
	});

	it("has no next project when there is only one", () => {
		expect(getProjectPosition([ordered[0]], "a")).toEqual({
			position: 1,
			total: 1,
			next: null,
		});
	});

	it("is null for a slug that isn't listed", () => {
		expect(getProjectPosition(ordered, "missing")).toBeNull();
	});
});

describe("nearestIndex", () => {
	const boxes = [
		{ top: 0, height: 100 }, // centre 50
		{ top: 120, height: 100 }, // centre 170
		{ top: 240, height: 100 }, // centre 290
	];

	it("picks the box whose centre is closest to the line", () => {
		expect(nearestIndex(boxes, 160)).toBe(1);
		expect(nearestIndex(boxes, 400)).toBe(2);
		expect(nearestIndex(boxes, -50)).toBe(0);
	});

	it("keeps the earlier box on a tie", () => {
		expect(nearestIndex(boxes, 110)).toBe(0);
	});

	it("is 0 with no boxes", () => {
		expect(nearestIndex([], 100)).toBe(0);
	});
});

describe("stepSlide", () => {
	it("steps forward and back, wrapping at both ends", () => {
		expect(stepSlide(0, 1, 3)).toBe(1);
		expect(stepSlide(2, 1, 3)).toBe(0);
		expect(stepSlide(0, -1, 3)).toBe(2);
	});

	it("is 0 with no slides", () => {
		expect(stepSlide(0, 1, 0)).toBe(0);
	});
});

describe("padIndex", () => {
	it("pads to two digits", () => {
		expect(padIndex(1)).toBe("01");
		expect(padIndex(12)).toBe("12");
		expect(padIndex(120)).toBe("120");
	});
});

describe("getProjectLinks", () => {
	it("keeps only the links that are set", () => {
		expect(
			getProjectLinks({ githubUrl: "https://github.com/x", liveUrl: null }),
		).toEqual([{ label: "github", href: "https://github.com/x" }]);
		expect(getProjectLinks({ githubUrl: null, liveUrl: null })).toEqual([]);
	});

	it("puts the live site first", () => {
		expect(
			getProjectLinks({
				githubUrl: "https://github.com/x",
				liveUrl: "https://x.test",
			}).map((link) => link.label),
		).toEqual(["live site", "github"]);
	});
});

describe("getProjectDateLine", () => {
	it("joins the period and the status", () => {
		expect(
			getProjectDateLine({
				status: "ONGOING",
				startedAt: "2024-09-01",
				endedAt: null,
			}),
		).toBe("Sep 2024 – now · ongoing");
		expect(
			getProjectDateLine({
				status: "COMPLETED",
				startedAt: "2024-01-01",
				endedAt: "2024-03-15",
			}),
		).toBe("Mar 2024 · completed");
	});

	it("uses the start month for a completed project without an end date", () => {
		expect(
			getProjectDateLine({
				status: "COMPLETED",
				startedAt: "2024-01-01",
				endedAt: null,
			}),
		).toBe("Jan 2024 · completed");
	});
});

describe("getMetadataRows", () => {
	it("reads an object as label → value", () => {
		expect(
			getMetadataRows({ event: "Odyssey 2024", players: 2, solo: false }),
		).toEqual([
			{ label: "event", value: "Odyssey 2024" },
			{ label: "players", value: "2" },
			{ label: "solo", value: "false" },
		]);
	});

	it("keeps the order of the list form", () => {
		expect(
			getMetadataRows([
				{ label: "role", value: "programmer" },
				{ label: "event", value: "Odyssey 2024" },
			]),
		).toEqual([
			{ label: "role", value: "programmer" },
			{ label: "event", value: "Odyssey 2024" },
		]);
	});

	it("joins list values with a dot", () => {
		expect(getMetadataRows({ platforms: ["Windows", "Web"] })).toEqual([
			{ label: "platforms", value: "Windows · Web" },
		]);
	});

	it("leaves out empty values, nested objects and entries without a label", () => {
		expect(
			getMetadataRows({
				blank: "  ",
				none: null,
				nested: { a: 1 },
				empty: [],
			}),
		).toEqual([]);
		expect(
			getMetadataRows([
				{ value: "no label" },
				"loose",
				{ label: "", value: "x" },
			]),
		).toEqual([]);
	});

	it("is empty for the column's default and for non-objects", () => {
		expect(getMetadataRows({})).toEqual([]);
		expect(getMetadataRows(null)).toEqual([]);
		expect(getMetadataRows("text")).toEqual([]);
	});
});

const started = (slug: string, startedAt: string) => ({ slug, startedAt });

describe("orderProjects", () => {
	const projects = [
		started("a-2023", "2023-01-01T00:00:00.000Z"),
		started("b-2025", "2025-01-01T00:00:00.000Z"),
		started("c-2022", "2022-01-01T00:00:00.000Z"),
		started("d-2024", "2024-01-01T00:00:00.000Z"),
	];
	const slugs = (featured: string[]) =>
		orderProjects(projects, featured).map((p) => p.slug);

	it("puts featured projects first, in featured order, even when older", () => {
		expect(slugs(["c-2022", "a-2023"]).slice(0, 2)).toEqual([
			"c-2022",
			"a-2023",
		]);
		expect(slugs(["a-2023", "c-2022"]).slice(0, 2)).toEqual([
			"a-2023",
			"c-2022",
		]);
	});

	it("lists the rest newest first", () => {
		expect(slugs(["c-2022"])).toEqual(["c-2022", "b-2025", "d-2024", "a-2023"]);
	});

	it("is newest first when nothing is featured", () => {
		expect(slugs([])).toEqual(["b-2025", "d-2024", "a-2023", "c-2022"]);
	});

	it("does not change the input", () => {
		const before = projects.map((p) => p.slug);
		orderProjects(projects, ["c-2022"]);
		expect(projects.map((p) => p.slug)).toEqual(before);
	});
});

describe("resolveCredits", () => {
	const collaborators = [
		{ slug: "jane-doe", name: "Jane Doe", profileUrl: "https://jane.dev" },
		{ slug: "john-roe", name: "John Roe" },
		{ slug: "ana-lee", name: "Ana Lee", profileUrl: null },
	];

	it("keeps the project's credit order and adds names and profile URLs", () => {
		const credits = [
			{ collaborator: "ana-lee", role: "Artist" },
			{ collaborator: "jane-doe", role: "Programmer" },
		];
		expect(resolveCredits(credits, collaborators)).toEqual([
			{ name: "Ana Lee", role: "Artist", profileUrl: null },
			{ name: "Jane Doe", role: "Programmer", profileUrl: "https://jane.dev" },
		]);
	});

	it("turns a missing role and profile URL into null", () => {
		expect(
			resolveCredits([{ collaborator: "john-roe" }], collaborators),
		).toEqual([{ name: "John Roe", role: null, profileUrl: null }]);
	});

	it("skips unknown collaborators and leaves out uncredited ones", () => {
		expect(resolveCredits([{ collaborator: "ghost" }], collaborators)).toEqual(
			[],
		);
		expect(resolveCredits([], collaborators)).toEqual([]);
	});
});
