import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_KEY, themeHeadScript } from "#/lib/theme";

interface Setup {
	/** What localStorage holds under THEME_KEY; "throw" makes the read throw. */
	stored: string | null | "throw";
	systemDark: boolean;
	/** Classes already on <html> before the script runs. */
	classes?: string[];
}

// Runs the inline head script against stubbed browser globals and returns
// the classes left on <html>.
function runHeadScript({ stored, systemDark, classes = [] }: Setup) {
	const classList = new Set(classes);
	vi.stubGlobal("document", {
		documentElement: {
			classList: {
				toggle: (name: string, force: boolean) => {
					if (force) classList.add(name);
					else classList.delete(name);
					return force;
				},
			},
		},
	});
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => {
			if (stored === "throw") throw new Error("storage blocked");
			return key === THEME_KEY ? stored : null;
		},
	});
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: query === "(prefers-color-scheme: dark)" && systemDark,
	}));

	new Function(themeHeadScript)();
	return classList;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("themeHeadScript", () => {
	it("follows a stored dark choice over a light system", () => {
		expect(
			runHeadScript({ stored: "dark", systemDark: false }).has("dark"),
		).toBe(true);
	});

	it("follows a stored light choice over a dark system", () => {
		expect(
			runHeadScript({ stored: "light", systemDark: true }).has("dark"),
		).toBe(false);
	});

	it("follows a dark system when nothing is stored", () => {
		expect(runHeadScript({ stored: null, systemDark: true }).has("dark")).toBe(
			true,
		);
	});

	it("follows a light system when nothing is stored", () => {
		expect(runHeadScript({ stored: null, systemDark: false }).has("dark")).toBe(
			false,
		);
	});

	it("treats an unknown stored value as no choice", () => {
		expect(
			runHeadScript({ stored: "auto", systemDark: true }).has("dark"),
		).toBe(true);
		expect(
			runHeadScript({ stored: "blue", systemDark: false }).has("dark"),
		).toBe(false);
	});

	it("falls back to the system when storage throws", () => {
		expect(
			runHeadScript({ stored: "throw", systemDark: true }).has("dark"),
		).toBe(true);
	});

	it("keeps the other classes on <html>", () => {
		const classes = runHeadScript({
			stored: "dark",
			systemDark: false,
			classes: ["lenis"],
		});
		expect([...classes].sort()).toEqual(["dark", "lenis"]);
	});

	it("removes a stale dark class when the choice is light", () => {
		expect(
			runHeadScript({
				stored: "light",
				systemDark: true,
				classes: ["dark"],
			}).has("dark"),
		).toBe(false);
	});
});
