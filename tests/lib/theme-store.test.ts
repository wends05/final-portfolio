import { afterEach, describe, expect, it, vi } from "vitest";
import {
	applyChoice,
	createThemeStore,
	readStoredChoice,
	THEME_KEY,
} from "#/lib/theme";

interface Browser {
	/** Initial localStorage value under THEME_KEY; "throw" makes storage throw. */
	stored?: string | null | "throw";
	systemDark?: boolean;
	reducedMotion?: boolean;
	/** Whether document.startViewTransition exists. */
	viewTransitions?: boolean;
}

// Stubs the browser globals the theme code touches and returns handles to
// inspect them and to flip the system scheme.
function stubBrowser({
	stored = null,
	systemDark = false,
	reducedMotion = false,
	viewTransitions = false,
}: Browser = {}) {
	const storage = new Map<string, string>();
	if (stored !== null && stored !== "throw") storage.set(THEME_KEY, stored);
	const blocked = stored === "throw";
	const guard = () => {
		if (blocked) throw new Error("storage blocked");
	};
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => {
			guard();
			return storage.get(key) ?? null;
		},
		setItem: (key: string, value: string) => {
			guard();
			storage.set(key, value);
		},
		removeItem: (key: string) => {
			guard();
			storage.delete(key);
		},
	});

	const classes = new Set<string>();
	// Runs the update straight away, as the browser does once it has the
	// old frame's snapshot.
	const startViewTransition = vi.fn((update: () => void) => update());
	vi.stubGlobal("document", {
		...(viewTransitions && { startViewTransition }),
		documentElement: {
			classList: {
				toggle: (name: string, force: boolean) => {
					if (force) classes.add(name);
					else classes.delete(name);
					return force;
				},
			},
		},
	});

	let dark = systemDark;
	const listeners: Array<() => void> = [];
	vi.stubGlobal("matchMedia", (query: string) => ({
		get matches() {
			if (query === "(prefers-reduced-motion: reduce)") return reducedMotion;
			return query === "(prefers-color-scheme: dark)" && dark;
		},
		addEventListener: (_: string, listener: () => void) => {
			listeners.push(listener);
		},
	}));

	return {
		storage,
		classes,
		listeners,
		startViewTransition,
		setSystemDark: (value: boolean) => {
			dark = value;
			for (const listener of listeners) listener();
		},
	};
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("readStoredChoice", () => {
	it("returns a stored light or dark choice", () => {
		stubBrowser({ stored: "dark" });
		expect(readStoredChoice()).toBe("dark");
	});

	it("treats nothing stored, an unknown value and blocked storage as auto", () => {
		stubBrowser({ stored: null });
		expect(readStoredChoice()).toBe("auto");
		stubBrowser({ stored: "blue" });
		expect(readStoredChoice()).toBe("auto");
		stubBrowser({ stored: "throw" });
		expect(readStoredChoice()).toBe("auto");
	});
});

describe("applyChoice", () => {
	it("stores light or dark and sets the class to match", () => {
		const browser = stubBrowser({ systemDark: true });
		applyChoice("light");
		expect(browser.storage.get(THEME_KEY)).toBe("light");
		expect(browser.classes.has("dark")).toBe(false);
	});

	it("forgets the choice on auto and follows the system", () => {
		const browser = stubBrowser({ stored: "light", systemDark: true });
		applyChoice("auto");
		expect(browser.storage.has(THEME_KEY)).toBe(false);
		expect(browser.classes.has("dark")).toBe(true);
	});

	it("still sets the class when storage is blocked", () => {
		const browser = stubBrowser({ stored: "throw" });
		expect(() => applyChoice("dark")).not.toThrow();
		expect(browser.classes.has("dark")).toBe(true);
	});
});

describe("themeStore", () => {
	it("starts on auto before hydrating, whatever is stored", () => {
		stubBrowser({ stored: "dark" });
		expect(createThemeStore().getState().choice).toBe("auto");
	});

	it("hydrates the stored choice", () => {
		stubBrowser({ stored: "dark" });
		const store = createThemeStore();
		store.getState().hydrate();
		expect(store.getState().choice).toBe("dark");
	});

	it("cycles auto → light → dark → auto, storing and showing each", () => {
		const browser = stubBrowser({ systemDark: true });
		const store = createThemeStore();
		const seen: Array<[string, string | undefined, boolean]> = [];
		for (let i = 0; i < 3; i++) {
			store.getState().cycle();
			seen.push([
				store.getState().choice,
				browser.storage.get(THEME_KEY),
				browser.classes.has("dark"),
			]);
		}
		expect(seen).toEqual([
			["light", "light", false],
			["dark", "dark", true],
			["auto", undefined, true],
		]);
	});

	it("follows a system change while on auto", () => {
		const browser = stubBrowser({ systemDark: false });
		const store = createThemeStore();
		store.getState().hydrate();
		browser.setSystemDark(true);
		expect(browser.classes.has("dark")).toBe(true);
		browser.setSystemDark(false);
		expect(browser.classes.has("dark")).toBe(false);
	});

	it("ignores a system change while on light", () => {
		const browser = stubBrowser({ stored: "light", systemDark: false });
		const store = createThemeStore();
		store.getState().hydrate();
		browser.setSystemDark(true);
		expect(browser.classes.has("dark")).toBe(false);
	});

	it("adds one system listener however many times it hydrates", () => {
		const browser = stubBrowser();
		const store = createThemeStore();
		store.getState().hydrate();
		store.getState().hydrate();
		expect(browser.listeners).toHaveLength(1);
	});
});

describe("themeStore fade", () => {
	it("crossfades a click through a view transition", () => {
		const browser = stubBrowser({ viewTransitions: true });
		createThemeStore().getState().cycle();
		expect(browser.startViewTransition).toHaveBeenCalledTimes(1);
		expect(browser.storage.get(THEME_KEY)).toBe("light");
	});

	it("switches instantly without view transition support", () => {
		const browser = stubBrowser({ viewTransitions: false });
		createThemeStore().getState().cycle();
		expect(browser.storage.get(THEME_KEY)).toBe("light");
	});

	it("switches instantly with reduced motion", () => {
		const browser = stubBrowser({ viewTransitions: true, reducedMotion: true });
		const store = createThemeStore();
		store.getState().cycle();
		store.getState().cycle();
		expect(browser.startViewTransition).not.toHaveBeenCalled();
		expect(browser.classes.has("dark")).toBe(true);
	});

	it("does not fade a system change while on auto", () => {
		const browser = stubBrowser({ viewTransitions: true });
		createThemeStore().getState().hydrate();
		browser.setSystemDark(true);
		expect(browser.startViewTransition).not.toHaveBeenCalled();
		expect(browser.classes.has("dark")).toBe(true);
	});
});
