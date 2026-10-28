import { describe, expect, it, vi } from "vitest";
import {
	createTransitionStore,
	gateEntrance,
} from "#/features/public/utils/transition/transition-store";

function fakeTimeline() {
	return { pause: vi.fn(), play: vi.fn() };
}

describe("createTransitionStore", () => {
	it("starts with no source, nothing covering and nothing held", () => {
		expect(createTransitionStore().getState()).toMatchObject({
			source: null,
			covering: false,
			entranceHeld: false,
		});
	});

	it("sets and clears the pick source", () => {
		const store = createTransitionStore();
		store.getState().setSource("pick");
		expect(store.getState().source).toBe("pick");
		store.getState().setSource(null);
		expect(store.getState().source).toBeNull();
	});
});

describe("gateEntrance", () => {
	it("leaves the timeline alone when nothing is held", () => {
		const store = createTransitionStore();
		const tl = fakeTimeline();
		expect(gateEntrance(tl, store)).toBeUndefined();
		expect(tl.pause).not.toHaveBeenCalled();
	});

	it("pauses a held entrance and plays it once released", () => {
		const store = createTransitionStore();
		store.getState().holdEntrance();
		const tl = fakeTimeline();

		gateEntrance(tl, store);
		expect(tl.pause).toHaveBeenCalledOnce();
		store.getState().setCovering(true);
		expect(tl.play).not.toHaveBeenCalled();

		store.getState().releaseEntrance();
		expect(tl.play).toHaveBeenCalledOnce();
		store.getState().holdEntrance();
		store.getState().releaseEntrance();
		expect(tl.play).toHaveBeenCalledOnce();
	});

	it("stops listening after cleanup", () => {
		const store = createTransitionStore();
		store.getState().holdEntrance();
		const tl = fakeTimeline();

		gateEntrance(tl, store)?.();
		store.getState().releaseEntrance();
		expect(tl.play).not.toHaveBeenCalled();
	});
});
