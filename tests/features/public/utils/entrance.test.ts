import { describe, expect, it } from "vitest";
import {
	ENTRANCE_TIMING,
	getEntranceDelay,
	getEntranceItemOffset,
} from "#/features/public/utils/entrance";
import { INTRO_HERO_DELAY } from "#/features/public/utils/intro";

describe("getEntranceDelay", () => {
	it("waits for the intro curtain on a tab's first load", () => {
		expect(getEntranceDelay(true)).toBe(INTRO_HERO_DELAY);
	});

	it("starts at once otherwise", () => {
		expect(getEntranceDelay(false)).toBe(0);
	});
});

describe("getEntranceItemOffset", () => {
	it("staggers items 60ms apart", () => {
		expect(getEntranceItemOffset(0)).toBe(0);
		expect(getEntranceItemOffset(1)).toBeCloseTo(0.06);
		expect(getEntranceItemOffset(3)).toBeCloseTo(0.18);
	});

	it("stops adding delay after the cap, so long lists don't drag", () => {
		const capped = getEntranceItemOffset(ENTRANCE_TIMING.itemStaggerCap);
		expect(getEntranceItemOffset(ENTRANCE_TIMING.itemStaggerCap + 5)).toBe(
			capped,
		);
		expect(getEntranceItemOffset(40)).toBe(capped);
	});
});

describe("ENTRANCE_TIMING", () => {
	// WD-51: the title rises first; the rest follows while it is still rising.
	it("starts the rest after the title starts and before it ends", () => {
		expect(ENTRANCE_TIMING.restAt).toBeGreaterThan(0);
		expect(ENTRANCE_TIMING.restAt).toBeLessThan(ENTRANCE_TIMING.titleRise);
	});

	it("matches the spec's durations", () => {
		expect(ENTRANCE_TIMING.titleRise).toBe(0.72);
		expect(ENTRANCE_TIMING.item).toBe(0.4);
		expect(ENTRANCE_TIMING.itemStagger).toBe(0.06);
		expect(ENTRANCE_TIMING.rise).toBe(16);
	});
});
