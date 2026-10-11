import { afterEach, describe, expect, it, vi } from "vitest";
import { skipIntro } from "./intro";

function stubDocument(intro: string | undefined) {
	const dataset: Record<string, string | undefined> = { intro };
	vi.stubGlobal("document", { documentElement: { dataset } });
	const setItem = vi.fn();
	vi.stubGlobal("sessionStorage", { setItem, getItem: vi.fn() });
	return { dataset, setItem };
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("skipIntro", () => {
	it("ends a pending intro so the scroll lock lifts", () => {
		const { dataset } = stubDocument("play");
		skipIntro();
		expect(dataset.intro).toBe("seen");
	});

	it("does not remember the intro as seen for the next page load", () => {
		const { setItem } = stubDocument("play");
		skipIntro();
		expect(setItem).not.toHaveBeenCalled();
	});

	it("leaves an intro that already finished alone", () => {
		const { dataset } = stubDocument("seen");
		skipIntro();
		expect(dataset.intro).toBe("seen");
	});
});
