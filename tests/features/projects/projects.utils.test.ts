import { describe, expect, it } from "vitest";
import {
	getMetadataRows,
	getProjectDateLine,
	getProjectLinks,
	getProjectPosition,
	nearestIndex,
	orderProjectsForIndex,
	padIndex,
	stepSlide,
} from "#/features/projects/projects.utils";

const listed = (
	slug: string,
	featuredRank: number | null,
	createdAt: string,
) => ({ slug, title: slug.toUpperCase(), featuredRank, createdAt });

describe("orderProjectsForIndex", () => {
	it("puts featured projects first, by rank, then the rest newest first", () => {
		const shuffled = [
			listed("old", null, "2023-01-01T00:00:00.000Z"),
			listed("third", 3, "2026-01-01T00:00:00.000Z"),
			listed("new", null, "2025-06-01T00:00:00.000Z"),
			listed("first", 1, "2022-01-01T00:00:00.000Z"),
			listed("middle", null, "2024-03-01T00:00:00.000Z"),
			listed("second", 2, "2021-01-01T00:00:00.000Z"),
		];
		expect(orderProjectsForIndex(shuffled).map((p) => p.slug)).toEqual([
			"first",
			"second",
			"third",
			"new",
			"middle",
			"old",
		]);
	});

	it("leaves the input array as it was", () => {
		const input = [
			listed("b", null, "2023-01-01T00:00:00.000Z"),
			listed("a", 1, "2022-01-01T00:00:00.000Z"),
		];
		orderProjectsForIndex(input);
		expect(input.map((p) => p.slug)).toEqual(["b", "a"]);
	});

	it("handles no projects", () => {
		expect(orderProjectsForIndex([])).toEqual([]);
	});
});

describe("getProjectPosition", () => {
	const ordered = [
		listed("a", 1, ""),
		listed("b", null, ""),
		listed("c", null, ""),
	];

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

	it("shows the status alone without dates, once", () => {
		expect(
			getProjectDateLine({ status: "ONGOING", startedAt: null, endedAt: null }),
		).toBe("ongoing");
		expect(
			getProjectDateLine({
				status: "COMPLETED",
				startedAt: null,
				endedAt: null,
			}),
		).toBe("completed");
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
