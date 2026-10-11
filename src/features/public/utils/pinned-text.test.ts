import { describe, expect, it } from "vitest";
import {
	PINNED_TEXT_SCROLL,
	pinnedTextPad,
	pinnedTextRunway,
} from "./pinned-text";

const scroll = {
	fadeIn: 25,
	fill: 100,
	cover: 100,
	edge: 30,
	hold: 35,
	inkShare: 0.2,
};

describe("pinnedTextPad", () => {
	it("adds the hold, the gradient's lead and the cover", () => {
		expect(pinnedTextPad(scroll)).toBe(165);
	});
});

describe("pinnedTextRunway", () => {
	it("is the pinned scroll plus the stage itself", () => {
		expect(pinnedTextRunway(scroll)).toBe(390);
	});

	it.each([
		["a sample", scroll],
		["the live values", PINNED_TEXT_SCROLL],
	])("pins the stage for exactly the timeline's duration (%s)", (_, s) => {
		const timeline = s.fadeIn + s.fill + pinnedTextPad(s);
		expect(pinnedTextRunway(s) - 100).toBe(timeline);
	});
});

describe("PINNED_TEXT_SCROLL", () => {
	it("keeps the word ink time inside the fill", () => {
		expect(PINNED_TEXT_SCROLL.inkShare).toBeGreaterThan(0);
		expect(PINNED_TEXT_SCROLL.inkShare).toBeLessThan(1);
	});

	it("covers the stage in one viewport of scroll", () => {
		expect(PINNED_TEXT_SCROLL.cover).toBe(100);
	});

	it("has a positive scroll for every phase", () => {
		const { inkShare: _inkShare, ...phases } = PINNED_TEXT_SCROLL;
		for (const value of Object.values(phases)) expect(value).toBeGreaterThan(0);
	});
});
