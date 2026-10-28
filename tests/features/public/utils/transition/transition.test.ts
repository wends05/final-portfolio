import { describe, expect, it } from "vitest";
import {
	chooseTransition,
	getEntranceStart,
	getSection,
	readVisited,
	rememberVisited,
	SECTION_TIMING,
	type Section,
	type TransitionSource,
	VISITED_KEY,
} from "#/features/public/utils/transition/transition";

function fakeStorage(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => {
			data.set(key, value);
		},
	};
}

function choose(
	from: string,
	to: string,
	{
		source = "link",
		visited = [],
	}: { source?: TransitionSource; visited?: Section[] } = {},
) {
	// The section a visitor is on has always been visited.
	const seen = new Set<Section>(visited);
	const current = getSection(from);
	if (current) seen.add(current);
	return chooseTransition({ from, to, source, visited: seen });
}

describe("getSection", () => {
	it("names the section by the first path segment", () => {
		expect(getSection("/")).toBe("home");
		expect(getSection("/skills")).toBe("skills");
		expect(getSection("/skills/web-development")).toBe("skills");
		expect(getSection("/projects")).toBe("projects");
		expect(getSection("/projects/portfolio/")).toBe("projects");
	});

	it("is null outside the sections", () => {
		expect(getSection("/coming-soon")).toBeNull();
		expect(getSection("/nope/deeper")).toBeNull();
	});
});

describe("chooseTransition", () => {
	// One case per row of the WD-51 table.
	it.each([
		["/", "/projects", "card"],
		["/projects", "/skills", "card"],
		["/projects/portfolio", "/skills", "card"],
		["/skills", "/projects/portfolio", "card"],
		["/projects", "/projects/portfolio", "fade"],
		["/projects/portfolio", "/projects", "fade"],
	] as const)("%s to %s plays %s", (from, to, kind) => {
		expect(choose(from, to)).toBe(kind);
	});

	it("plays the list pick's entry for a pick from the landing page", () => {
		expect(choose("/", "/skills/web-development", { source: "pick" })).toBe(
			"pick",
		);
		expect(choose("/", "/projects/portfolio", { source: "pick" })).toBe("pick");
	});

	it("fades to a section already visited in this tab", () => {
		expect(choose("/", "/projects", { visited: ["projects"] })).toBe("fade");
		expect(choose("/skills/web-development", "/", { visited: ["home"] })).toBe(
			"fade",
		);
		expect(choose("/skills/web-development", "/")).toBe("card");
	});

	it("plays the menu entry for a menu pick, visited or not", () => {
		expect(choose("/", "/skills", { source: "menu" })).toBe("menu");
		expect(
			choose("/", "/skills", { source: "menu", visited: ["skills"] }),
		).toBe("menu");
	});

	it("plays nothing when the path stays the same", () => {
		expect(choose("/skills", "/skills")).toBe("none");
		expect(choose("/skills/", "/skills")).toBe("none");
		expect(choose("/projects", "/projects", { source: "pick" })).toBe("none");
	});

	it("fades to a path outside the sections", () => {
		expect(choose("/", "/missing-page")).toBe("fade");
	});

	it("applies the same rules whichever way the navigation goes", () => {
		// Back from /skills to /projects reads as a navigation to /projects.
		expect(choose("/skills", "/projects")).toBe("card");
		expect(choose("/skills", "/projects", { visited: ["projects"] })).toBe(
			"fade",
		);
	});
});

describe("getEntranceStart", () => {
	it("starts after the title card and the frame's fade", () => {
		expect(getEntranceStart("card")).toBeCloseTo(
			SECTION_TIMING.titleIn + SECTION_TIMING.hold + SECTION_TIMING.frameIn,
		);
		// 460ms cover + 400ms title + 600ms hold + 320ms frame = 1780ms.
		expect(SECTION_TIMING.cover + getEntranceStart("card")).toBeCloseTo(1.78);
	});

	it("starts after the frame's fade for a menu pick", () => {
		expect(getEntranceStart("menu")).toBe(SECTION_TIMING.frameIn);
	});

	it("starts at once otherwise", () => {
		expect(getEntranceStart("fade")).toBe(0);
		expect(getEntranceStart("pick")).toBe(0);
		expect(getEntranceStart("none")).toBe(0);
	});
});

describe("visited sections", () => {
	it("starts empty", () => {
		expect(readVisited(fakeStorage())).toEqual(new Set());
		expect(readVisited(null)).toEqual(new Set());
	});

	it("remembers each section once", () => {
		const storage = fakeStorage();
		rememberVisited("home", storage);
		rememberVisited("projects", storage);
		rememberVisited("home", storage);
		expect(readVisited(storage)).toEqual(new Set(["home", "projects"]));
		expect(JSON.parse(storage.getItem(VISITED_KEY) ?? "")).toEqual([
			"home",
			"projects",
		]);
	});

	it("ignores paths outside the sections", () => {
		const storage = fakeStorage();
		rememberVisited(getSection("/missing-page"), storage);
		expect(storage.getItem(VISITED_KEY)).toBeNull();
	});

	it("ignores stored values that aren't a list of sections", () => {
		expect(readVisited(fakeStorage({ [VISITED_KEY]: "not json" }))).toEqual(
			new Set(),
		);
		expect(readVisited(fakeStorage({ [VISITED_KEY]: '{"a":1}' }))).toEqual(
			new Set(),
		);
		expect(
			readVisited(fakeStorage({ [VISITED_KEY]: '["skills","admin",3]' })),
		).toEqual(new Set(["skills"]));
	});

	it("survives storage that throws", () => {
		const storage = {
			getItem: () => {
				throw new Error("blocked");
			},
			setItem: () => {
				throw new Error("blocked");
			},
		};
		expect(readVisited(storage)).toEqual(new Set());
		expect(() => rememberVisited("skills", storage)).not.toThrow();
	});
});
