import { describe, expect, it } from "vitest";
import { getPresentationState } from "./presentation";

describe("getPresentationState", () => {
	it("starts on the first project with an empty bar", () => {
		expect(getPresentationState(0, 3)).toEqual({ active: 0, barProgress: 0 });
	});

	it("ends on the last project with a full bar", () => {
		expect(getPresentationState(1, 3)).toEqual({ active: 2, barProgress: 1 });
	});

	it("gives every project an equal share of the scroll", () => {
		expect(getPresentationState(1 / 6, 3).active).toBe(0);
		expect(getPresentationState(3 / 6, 3).active).toBe(1);
		expect(getPresentationState(5 / 6, 3).active).toBe(2);
	});

	it("fills the bar across the current project's share only", () => {
		expect(getPresentationState(1 / 6, 3).barProgress).toBeCloseTo(0.5);
		expect(getPresentationState(0.5, 3).barProgress).toBeCloseTo(0.5);
		expect(getPresentationState(5 / 6, 3).barProgress).toBeCloseTo(0.5);
	});

	it("switches at each share boundary, resetting the bar", () => {
		expect(getPresentationState(0.25, 4)).toEqual({
			active: 1,
			barProgress: 0,
		});
		expect(getPresentationState(0.5, 4)).toEqual({
			active: 2,
			barProgress: 0,
		});
		expect(getPresentationState(0.249, 4).active).toBe(0);
	});

	it("handles a single project", () => {
		expect(getPresentationState(0, 1)).toEqual({ active: 0, barProgress: 0 });
		expect(getPresentationState(0.5, 1)).toEqual({
			active: 0,
			barProgress: 0.5,
		});
		expect(getPresentationState(1, 1)).toEqual({ active: 0, barProgress: 1 });
	});

	it("clamps progress outside 0–1 and empty lists", () => {
		expect(getPresentationState(-0.2, 3)).toEqual({
			active: 0,
			barProgress: 0,
		});
		expect(getPresentationState(1.2, 3)).toEqual({ active: 2, barProgress: 1 });
		expect(getPresentationState(0.5, 0)).toEqual({ active: 0, barProgress: 0 });
	});
});
