import { describe, expect, it } from "vitest";
import { splitVisibleTools } from "#/lib/tools";

const tools = (...names: string[]) => names;

describe("splitVisibleTools", () => {
	it("shows the first tools and counts the rest", () => {
		const { visible, hidden } = splitVisibleTools(
			tools("React", "TypeScript", "Prisma", "Tailwind CSS", "Go"),
			3,
		);
		expect(visible).toEqual(["React", "TypeScript", "Prisma"]);
		expect(hidden).toBe(2);
	});

	it("hides nothing when the list fits", () => {
		expect(splitVisibleTools(tools("Flutter", "Expo"), 3)).toEqual({
			visible: tools("Flutter", "Expo"),
			hidden: 0,
		});
		expect(splitVisibleTools(tools("A", "B", "C"), 3).hidden).toBe(0);
	});

	it("handles a list with no tools", () => {
		expect(splitVisibleTools([], 3)).toEqual({ visible: [], hidden: 0 });
	});

	it("treats a negative count as zero", () => {
		expect(splitVisibleTools(tools("Go"), -1)).toEqual({
			visible: [],
			hidden: 1,
		});
	});
});
