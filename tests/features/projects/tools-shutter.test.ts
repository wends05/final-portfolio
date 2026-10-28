import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import {
	playToolsShutter,
	type ShutterTimeline,
	toolsShutterVars,
} from "#/features/projects/projects.utils";

/** A timeline that records the calls the dialog makes, in order. */
function fakeTimeline() {
	const calls: string[] = [];
	const timeline: ShutterTimeline = {
		play: () => calls.push("play"),
		reverse: () => calls.push("reverse"),
		timeScale: (value) => calls.push(`timeScale(${value})`),
	};
	return { timeline, calls };
}

describe("playToolsShutter", () => {
	it("plays forwards at normal speed when the dialog opens", () => {
		const { timeline, calls } = fakeTimeline();
		const preventUnmount = vi.fn();
		playToolsShutter(true, timeline, preventUnmount, 1.6);
		expect(calls).toEqual(["timeScale(1)", "play"]);
		expect(preventUnmount).not.toHaveBeenCalled();
	});

	it("keeps the dialog mounted and plays backwards, faster, when it closes", () => {
		const { timeline, calls } = fakeTimeline();
		const preventUnmount = vi.fn();
		playToolsShutter(false, timeline, preventUnmount, 1.6);
		expect(preventUnmount).toHaveBeenCalledOnce();
		expect(calls).toEqual(["timeScale(1.6)", "reverse"]);
	});

	it("plays forwards again at normal speed when reopened mid-close", () => {
		const { timeline, calls } = fakeTimeline();
		playToolsShutter(false, timeline, () => {}, 1.6);
		playToolsShutter(true, timeline, () => {}, 1.6);
		expect(calls.slice(2)).toEqual(["timeScale(1)", "play"]);
	});

	it("lets Base UI close on its own before there is a timeline", () => {
		const preventUnmount = vi.fn();
		playToolsShutter(false, null, preventUnmount, 1.6);
		expect(preventUnmount).not.toHaveBeenCalled();
	});
});

describe("toolsShutterVars", () => {
	it("builds the timeline paused", () => {
		const tl = gsap.timeline(toolsShutterVars(() => {}));
		expect(tl.paused()).toBe(true);
		tl.kill();
	});

	it("unmounts once the timeline has run backwards to the start", () => {
		const unmount = vi.fn();
		const tl = gsap.timeline(toolsShutterVars(unmount));
		tl.to({ value: 0 }, { value: 1, duration: 1 });
		tl.progress(1);
		expect(unmount).not.toHaveBeenCalled();
		tl.reverse();
		tl.time(0, false);
		expect(unmount).toHaveBeenCalledOnce();
		tl.kill();
	});
});
